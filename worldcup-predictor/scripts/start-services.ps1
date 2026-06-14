# start-services.ps1
# 后台启动所有服务（用于 opencode bash 调用）

param(
    [switch]$Restart  # 先杀旧进程再启动
)

$projectRoot = "E:\opencode对话\worldcup-predictor"

# 如果需要重启，先杀旧进程
if ($Restart) {
    Write-Host "[清理] 停止旧进程..." -ForegroundColor Yellow
    & "$projectRoot\scripts\check-ports.ps1" -Kill
    Start-Sleep -Seconds 2
}

# 检查端口是否已在监听
$backendRunning = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | 
                  Where-Object { $_.State -eq 'Listen' }
$frontendRunning = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | 
                   Where-Object { $_.State -eq 'Listen' }

# 启动后端
if (-not $backendRunning) {
    Write-Host "[启动] 后端服务器 (端口 3001)..." -ForegroundColor Cyan
    Start-Process -FilePath "node" -ArgumentList "src/index.js" `
                  -WorkingDirectory "$projectRoot\server" `
                  -WindowStyle Hidden
} else {
    Write-Host "[跳过] 后端已在运行" -ForegroundColor Green
}

# 启动前端
if (-not $frontendRunning) {
    Write-Host "[启动] 前端服务器 (端口 5173)..." -ForegroundColor Cyan
    Start-Process -FilePath "cmd.exe" `
                  -ArgumentList "/c", "cd /d `"$projectRoot\client`" && npx vite --host" `
                  -WindowStyle Hidden
} else {
    Write-Host "[跳过] 前端已在运行" -ForegroundColor Green
}

# 等待并验证
Write-Host ""
Write-Host "[验证] 等待服务启动..." -ForegroundColor Yellow
$timeout = 30
$start = Get-Date

while ($true) {
    $elapsed = ((Get-Date) - $start).TotalSeconds
    if ($elapsed -ge $timeout) {
        Write-Host "[超时] 部分服务未能在 ${timeout}秒内启动" -ForegroundColor Red
        break
    }
    
    $b = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Where-Object { $_.State -eq 'Listen' }
    $f = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | Where-Object { $_.State -eq 'Listen' }
    
    if ($b -and $f) {
        Write-Host ""
        Write-Host "[成功] 所有服务已启动！" -ForegroundColor Green
        Write-Host "  后端: http://localhost:3001" -ForegroundColor Cyan
        Write-Host "  前端: http://localhost:5173" -ForegroundColor Cyan
        break
    }
    
    Write-Host "." -NoNewline
    Start-Sleep -Seconds 1
}

Write-Host ""
