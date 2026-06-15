param(
    [string]$DatabaseName = 'anamnesis_ai',
    [string]$DatabaseUser = 'user',
    [string]$DatabasePassword = 'pass',
    [string]$DatabaseHost = 'localhost',
    [int]$DatabasePort = 5432,
    [string]$Superuser = 'postgres'
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $repoRoot 'backend'
$backendEnvPath = Join-Path $backendDir '.env'
$backendEnvExamplePath = Join-Path $backendDir '.env.example'

function Write-Info {
    param([string]$Message)
    Write-Host $Message
}

function Get-PlainTextPassword {
    param([string]$Prompt)

    $secure = Read-Host -AsSecureString $Prompt
    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToGlobalAllocUnicode($secure)
    try {
        return [Runtime.InteropServices.Marshal]::PtrToStringUni($ptr)
    }
    finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeGlobalAllocUnicode($ptr)
    }
}

if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
    throw "psql was not found on PATH. Install PostgreSQL first, or open a PostgreSQL shell that provides psql."
}

$service = Get-Service -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -like '*postgres*' -or $_.DisplayName -like '*postgres*' } |
    Select-Object -First 1

if ($service -and $service.Status -ne 'Running') {
    Write-Info "Starting PostgreSQL service: $($service.Name)"
    Start-Service -Name $service.Name
}

$postgresPassword = $env:PGPASSWORD
if (-not $postgresPassword) {
    $postgresPassword = Get-PlainTextPassword "Enter the PostgreSQL superuser password for $Superuser"
}

$previousPgPassword = $env:PGPASSWORD
$env:PGPASSWORD = $postgresPassword

try {
    $safeDatabaseUser = $DatabaseUser.Replace("'", "''")
    $safeDatabasePassword = $DatabasePassword.Replace("'", "''")
    $safeDatabaseName = $DatabaseName.Replace('"', '""')

    $databaseExistsQuery = "SELECT 1 FROM pg_database WHERE datname = '$safeDatabaseName';"
    $databaseExists = & psql -h $DatabaseHost -p $DatabasePort -U $Superuser -d postgres -tAc $databaseExistsQuery 2>$null

    if ($LASTEXITCODE -ne 0) {
        throw "Unable to connect to PostgreSQL as $Superuser on $DatabaseHost`:$DatabasePort. Confirm the service is running and the password is correct."
    }

    $roleExistsQuery = "SELECT 1 FROM pg_roles WHERE rolname = '$safeDatabaseUser';"
    $roleExists = & psql -h $DatabaseHost -p $DatabasePort -U $Superuser -d postgres -tAc $roleExistsQuery 2>$null

    if ($LASTEXITCODE -ne 0) {
        throw "Unable to inspect PostgreSQL roles."
    }

    if ($roleExists) {
        $alterRoleSql = "ALTER ROLE `"$safeDatabaseUser`" WITH LOGIN PASSWORD '$safeDatabasePassword';"
        $alterRoleSql | & psql -h $DatabaseHost -p $DatabasePort -U $Superuser -d postgres -v ON_ERROR_STOP=1 1>$null
    } else {
        $createRoleSql = "CREATE ROLE `"$safeDatabaseUser`" LOGIN PASSWORD '$safeDatabasePassword';"
        $createRoleSql | & psql -h $DatabaseHost -p $DatabasePort -U $Superuser -d postgres -v ON_ERROR_STOP=1 1>$null
    }

    if ($LASTEXITCODE -ne 0) {
        throw "Failed to create or update the PostgreSQL role '$DatabaseUser'."
    }

    if (-not $databaseExists) {
        $createDbSql = "CREATE DATABASE `"$safeDatabaseName`" OWNER `"$safeDatabaseUser`";"
        $createDbSql | & psql -h $DatabaseHost -p $DatabasePort -U $Superuser -d postgres -v ON_ERROR_STOP=1 1>$null
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to create the PostgreSQL database '$DatabaseName'."
        }
        Write-Info "Created database: $DatabaseName"
    } else {
        Write-Info "Database already exists: $DatabaseName"
    }

    if (-not (Test-Path $backendEnvPath) -and (Test-Path $backendEnvExamplePath)) {
        Copy-Item $backendEnvExamplePath $backendEnvPath
    }

    $databaseUrl = "postgresql+asyncpg://$DatabaseUser`:$DatabasePassword@$DatabaseHost`:$DatabasePort/$DatabaseName"

    if (Test-Path $backendEnvPath) {
        $envContent = Get-Content $backendEnvPath -Raw
        if ($envContent -match '(?m)^DATABASE_URL=.*$') {
            $envContent = [regex]::Replace($envContent, '(?m)^DATABASE_URL=.*$', "DATABASE_URL=$databaseUrl")
        } else {
            if (-not $envContent.EndsWith("`n")) {
                $envContent += "`n"
            }
            $envContent += "DATABASE_URL=$databaseUrl`n"
        }
        Set-Content -Path $backendEnvPath -Value $envContent -NoNewline
        Write-Info "Updated backend/.env with DATABASE_URL"
    }

    Write-Info "PostgreSQL setup complete."
}
finally {
    $env:PGPASSWORD = $previousPgPassword
}
