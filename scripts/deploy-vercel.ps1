# Manual Vercel production deploy — run from repo root.
# Requires: npm i -g vercel   OR   npx vercel (will prompt login first time)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot\..

Write-Host "Deploying to Vercel production..." -ForegroundColor Cyan
npx vercel --prod

Write-Host "`nDone. Hard-refresh the live site (Ctrl+Shift+R)." -ForegroundColor Green
Write-Host "View page source and search for site-build to verify the deployed version." -ForegroundColor Gray
