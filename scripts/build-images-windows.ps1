# 在本机 Windows + Docker Desktop 构建镜像，导出 tar 供 ECS 加载
# 用法: powershell -ExecutionPolicy Bypass -File scripts/build-images-windows.ps1

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $ProjectRoot

Write-Host ">>> 检查 Docker..." -ForegroundColor Cyan
docker version | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "未检测到 Docker。请先安装 Docker Desktop 并确保已启动。" -ForegroundColor Red
    Write-Host "https://www.docker.com/products/docker-desktop/"
    exit 1
}

Write-Host ">>> 构建 backend（约 5~15 分钟）..." -ForegroundColor Cyan
docker compose build backend
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ">>> 构建 nginx（约 3~10 分钟）..." -ForegroundColor Cyan
docker compose build nginx
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ">>> 确认镜像名称..." -ForegroundColor Cyan
$images = docker images --format "{{.Repository}}:{{.Tag}}" | Select-String "plantshow"
$images | ForEach-Object { Write-Host "  $_" }

$backendImage = (docker images --format "{{.Repository}}" | Select-String "^plantshow-backend$" | Select-Object -First 1).ToString().Trim()
$nginxImage = (docker images --format "{{.Repository}}" | Select-String "^plantshow-nginx$" | Select-Object -First 1).ToString().Trim()

if (-not $backendImage -or -not $nginxImage) {
    Write-Host "未找到 plantshow-backend / plantshow-nginx，请手动执行: docker images" -ForegroundColor Red
    exit 1
}

$outFile = Join-Path $ProjectRoot "plantshow-images.tar"
Write-Host ">>> 导出镜像到 $outFile ..." -ForegroundColor Cyan
docker save "${backendImage}:latest" "${nginxImage}:latest" -o $outFile
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$sizeMb = [math]::Round((Get-Item $outFile).Length / 1MB, 1)
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " 构建完成: plantshow-images.tar ($sizeMb MB)" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "上传到 ECS（把 IP 换成你的公网 IP）:" -ForegroundColor Yellow
Write-Host "  scp plantshow-images.tar root@123.57.244.162:/root/"
Write-Host ""
Write-Host "在 ECS 上加载并启动:" -ForegroundColor Yellow
Write-Host "  bash scripts/load-images-server.sh"
Write-Host ""
