# 本机 Windows：推送 Gitee + SSH 远程一键升级
# 用法: npm run deploy:upgrade
# 配置: 复制 scripts/deploy.env.example 为 scripts/deploy.env

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $ProjectRoot

$DeployEnv = Join-Path $ProjectRoot "scripts\deploy.env"
$EcsHost = "root@123.57.244.162"
$EcsPath = "/root/PlantShow"
$UpgradeMode = "backend"

if (Test-Path $DeployEnv) {
    Get-Content $DeployEnv | ForEach-Object {
        if ($_ -match '^\s*#' -or $_ -match '^\s*$') { return }
        if ($_ -match '^\s*ECS_HOST=(.+)$') { $EcsHost = $Matches[1].Trim() }
        if ($_ -match '^\s*ECS_PATH=(.+)$') { $EcsPath = $Matches[1].Trim() }
        if ($_ -match '^\s*UPGRADE_MODE=(.+)$') { $UpgradeMode = $Matches[1].Trim() }
    }
}

Write-Host ">>> 推送到 Gitee..." -ForegroundColor Cyan
git push gitee main
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

if ($UpgradeMode -eq "none") {
    Write-Host ">>> UPGRADE_MODE=none，跳过远程升级" -ForegroundColor Yellow
    Write-Host ">>> 请在 ECS 上执行: cd $EcsPath && bash scripts/upgrade-prod.sh"
    exit 0
}

$UpgradeFlag = ""
if ($UpgradeMode -eq "all") { $UpgradeFlag = "--all" }

Write-Host ">>> 远程升级 $EcsHost ($UpgradeMode)..." -ForegroundColor Cyan
ssh $EcsHost "cd '$EcsPath' && bash scripts/upgrade-prod.sh $UpgradeFlag --auto"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host ">>> 本机推送 + 远程升级完成" -ForegroundColor Green
