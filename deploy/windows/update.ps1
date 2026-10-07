# Deploys the latest code: pulls it, rebuilds the backend and the website, and
# restarts both services. Run in PowerShell as Administrator from the app folder:
#   .\deploy\windows\update.ps1
# Content and uploads live in SPARK_DATA_DIR / SPARK_UPLOADS_DIR and are never touched.
#
# Each service is stopped while its packages are reinstalled (Windows locks the
# files a running app has loaded), so the site is briefly unavailable: about a
# minute for the website build.
param([string]$AppDir = (Resolve-Path "$PSScriptRoot\..\.."))
$ErrorActionPreference = "Stop"
Set-Location $AppDir

function Run($what) {
  & cmd /c $what
  if ($LASTEXITCODE -ne 0) { throw "Failed: $what" }
}

Write-Host "== Pulling the latest code"
Run "git pull --ff-only"

Write-Host "== Backend"
Stop-Service SparkBackend
Push-Location backend
try {
  Run "npm ci"
  Run "npm run build"
} finally {
  Pop-Location
  Start-Service SparkBackend
}
Start-Sleep -Seconds 3

# The website is built from the running backend (it pre-renders the pages).
Write-Host "== Website"
Stop-Service SparkWebsite
try {
  Run "npm ci"
  Run "npm run build"
} finally {
  Start-Service SparkWebsite
}

Get-Service SparkBackend, SparkWebsite | Format-Table Name, Status
Write-Host "Done."
