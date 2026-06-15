param(
    [int]$Port = 3000
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$frontendDir = Join-Path $repoRoot 'frontend'
$envExample = Join-Path $frontendDir '.env.local.example'
$envLocal = Join-Path $frontendDir '.env.local'

if (-not (Test-Path $envLocal) -and (Test-Path $envExample)) {
    Copy-Item $envExample $envLocal
}

Push-Location $frontendDir
try {
    if (-not (Test-Path (Join-Path $frontendDir 'node_modules'))) {
        npm install
    }

    $env:PORT = $Port
    npm run dev
}
finally {
    Pop-Location
}
