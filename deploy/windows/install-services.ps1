# Registers the backend and the website as Windows services with NSSM
# (https://nssm.cc), so they start with Windows and restart if they crash.
# Run once, in PowerShell as Administrator, after the first build:
#   .\deploy\windows\install-services.ps1 -AppDir C:\spark\app
param(
  [string]$AppDir = "C:\spark\app",
  [string]$LogDir = "C:\spark\logs",
  [string]$Nssm = "nssm.exe"
)
$ErrorActionPreference = "Stop"

$node = (Get-Command node.exe).Source
New-Item -ItemType Directory -Force $LogDir | Out-Null

function Install-NodeService($Name, $Display, $Dir, $Arguments) {
  if (Get-Service $Name -ErrorAction SilentlyContinue) {
    Write-Host "$Name exists: updating its settings"
  } else {
    & $Nssm install $Name $node | Out-Null
  }
  & $Nssm set $Name AppParameters $Arguments | Out-Null
  & $Nssm set $Name AppDirectory $Dir | Out-Null
  & $Nssm set $Name DisplayName $Display | Out-Null
  & $Nssm set $Name Start SERVICE_AUTO_START | Out-Null
  & $Nssm set $Name AppEnvironmentExtra "NODE_ENV=production" | Out-Null
  & $Nssm set $Name AppStdout (Join-Path $LogDir "$Name.log") | Out-Null
  & $Nssm set $Name AppStderr (Join-Path $LogDir "$Name.log") | Out-Null
  # Rotate the log at 10 MB.
  & $Nssm set $Name AppRotateFiles 1 | Out-Null
  & $Nssm set $Name AppRotateBytes 10485760 | Out-Null
  # Ctrl+C first so open requests finish, then stop.
  & $Nssm set $Name AppStopMethodConsole 5000 | Out-Null
}

# Backend: settings in backend\.env
Install-NodeService "SparkBackend" "Spark Backend (API)" (Join-Path $AppDir "backend") "dist\server.mjs"

# Website: settings in .env.production.local; starts after the backend.
Install-NodeService "SparkWebsite" "Spark Website" $AppDir "node_modules\next\dist\bin\next start -p 3000 -H 127.0.0.1"
& $Nssm set SparkWebsite DependOnService SparkBackend | Out-Null

Start-Service SparkBackend
Start-Service SparkWebsite
Get-Service SparkBackend, SparkWebsite | Format-Table Name, Status, StartType
