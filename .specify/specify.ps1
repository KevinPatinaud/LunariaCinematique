# Local entry point for the pinned Lunaria Spec Kit CLI.
# Runtime packages are isolated outside both source repositories.
param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$SpecKitArguments
)
$ErrorActionPreference = 'Stop'
$version = '1.2.3'
$repoRoot = Split-Path -Parent $PSScriptRoot
if (-not $env:LOCALAPPDATA) { throw 'LOCALAPPDATA is required for this Windows launcher.' }
$runtime = Join-Path $env:LOCALAPPDATA "Lunaria\SpecKit\$version\venv"
$python = Join-Path $runtime 'Scripts\python.exe'
$cli = Join-Path $runtime 'Scripts\specify.exe'

if (-not (Test-Path -LiteralPath $cli -PathType Leaf)) {
    Write-Host "Installing Spec Kit $version in $runtime"
    if (-not (Test-Path -LiteralPath $python -PathType Leaf)) {
        if (-not (Get-Command py -ErrorAction SilentlyContinue)) {
            throw 'Install Python 3.11+ with the Windows Python launcher, then retry.'
        }
        & py -3 -c 'import sys; assert sys.version_info >= (3, 11), "Python 3.11+ required"'
        if ($LASTEXITCODE -ne 0) { throw 'Python 3.11+ is required.' }
        & py -3 -m venv $runtime
        if ($LASTEXITCODE -ne 0) { throw 'Could not create the Spec Kit virtual environment.' }
    }
    & $python -m pip install --disable-pip-version-check "specify-cli==$version"
    if ($LASTEXITCODE -ne 0) { throw 'Spec Kit installation failed. Retry this command.' }
}

& $python -c "import importlib.metadata as m; assert m.version('specify-cli') == '$version', 'Unexpected Spec Kit version'"
if ($LASTEXITCODE -ne 0) { throw "Expected Spec Kit $version in $runtime" }
if (-not $SpecKitArguments) { $SpecKitArguments = @('--help') }
$previousEncoding = $env:PYTHONIOENCODING
Push-Location -LiteralPath $repoRoot
try {
    $env:PYTHONIOENCODING = 'utf-8'
    & $cli @SpecKitArguments
    $cliExitCode = $LASTEXITCODE
} finally {
    Pop-Location
    $env:PYTHONIOENCODING = $previousEncoding
}
exit $cliExitCode
