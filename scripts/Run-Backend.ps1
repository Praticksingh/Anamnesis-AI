param(
    [int]$Port = 8000
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $repoRoot 'backend'
$rootVenvPython = Join-Path $repoRoot '.venv\Scripts\python.exe'
$backendVenvPython = Join-Path $backendDir '.venv\Scripts\python.exe'

if (Test-Path $rootVenvPython) {
    $python = $rootVenvPython
} elseif (Test-Path $backendVenvPython) {
    $python = $backendVenvPython
} else {
    throw "No Python virtual environment found. Expected .venv at the repo root or backend/.venv."
}

Push-Location $backendDir
try {
    & $python -m uvicorn app.main:app --reload --port $Port
}
finally {
    Pop-Location
}
