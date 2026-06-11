# One-time push script — run in PowerShell from this folder.
# Usage: .\push.ps1 -RemoteUrl "https://github.com/YOUR_USER/Media.git"

param(
  [Parameter(Mandatory = $true)]
  [string]$RemoteUrl
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

if (-not (Test-Path .git)) {
  git init
  git branch -M main
}

git add -A
git status

$hasCommits = git rev-parse HEAD 2>$null
if (-not $hasCommits) {
  git commit -m "Initial static site with Vercel and Supabase contact API"
} else {
  git commit -m "Add static site with day/night UI, Vercel API, and Supabase schema" `
    -m "Landing page for web dev, drone media, and Google Business services."
}

$remotes = git remote
if ($remotes -notcontains 'origin') {
  git remote add origin $RemoteUrl
} else {
  git remote set-url origin $RemoteUrl
}

git push -u origin main

Write-Host "`nDone. If Vercel is linked to this repo, it will redeploy automatically." -ForegroundColor Green
