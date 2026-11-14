param(
  [Parameter(Mandatory = $true)][string]$Repo,
  [string]$GitName = "A-Qing",
  [string]$GitEmail = "aqing@users.noreply.github.com"
)
$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw "没找到 git，先装 Git for Windows" }
if (-not (Test-Path ".git")) { git init | Out-Null; git branch -M main }
git config user.name $GitName
git config user.email $GitEmail
git add -A
git commit -m "feat: personal homepage" 2>$null
if (git remote 2>$null) { git remote set-url origin $Repo } else { git remote add origin $Repo }
git branch -M main
git push -u origin main
$clean = $Repo -replace "\.git$", ""
$parts = $clean -split "/"
$slug = $parts[-1]
$owner = $parts[-2]
Write-Host ""
Write-Host "推上去了。去仓库 Settings - Pages 选 Deploy from a branch / main / root。" -ForegroundColor Green
Write-Host ("然后访问 https://" + $owner + ".github.io/" + $slug + "/")