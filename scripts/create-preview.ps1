$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$previewDir = Join-Path $root 'preview'
New-Item -ItemType Directory -Force -Path $previewDir | Out-Null

$html = Invoke-RestMethod -Uri 'https://raw.githubusercontent.com/CHWEB7/Media/main/index.html' -Headers @{ 'User-Agent' = 'VoltronDigital' }

$html = $html -replace '(<meta name="viewport"[^>]+>)', "`$1`n  <meta name=`"robots`" content=`"noindex, nofollow`">"
$html = $html -replace 'relume-layout-v1', 'relume-layout-preview'
$html = $html -replace '<title>Voltron Digital[^<]+</title>', '<title>Voltron Digital — Preview (hidden)</title>'
$html = $html -replace 'href="css/', 'href="../css/'
$html = $html -replace 'href="assets/', 'href="../assets/'
$html = $html -replace 'src="assets/', 'src="../assets/'
$html = $html -replace 'src="js/', 'src="../js/'

$out = Join-Path $previewDir 'index.html'
[System.IO.File]::WriteAllText($out, $html, [System.Text.UTF8Encoding]::new($false))
Write-Output "Wrote $out ($((Get-Item $out).Length) bytes)"
