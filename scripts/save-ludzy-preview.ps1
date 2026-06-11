# Saves a Ludzy homepage screenshot into assets/clients/ludzy.png
# Run after capturing a screenshot, or re-run when you want to refresh the tile image.

$src = "$env:LOCALAPPDATA\Temp\cursor\screenshots\ludzy-preview.png"
$dstDir = Join-Path $PSScriptRoot "..\assets\clients"
$dst = Join-Path $dstDir "ludzy.png"

New-Item -ItemType Directory -Force -Path $dstDir | Out-Null

if (-not (Test-Path $src)) {
  Write-Host "Source screenshot not found: $src" -ForegroundColor Yellow
  Write-Host "Open https://www.ludzy.online in the browser, screenshot the hero, save as ludzy-preview.png in the path above, then re-run."
  exit 1
}

Copy-Item -LiteralPath $src -Destination $dst -Force
Write-Host "Saved $($dst) ($((Get-Item $dst).Length) bytes)" -ForegroundColor Green
