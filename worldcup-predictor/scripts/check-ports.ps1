# check-ports.ps1
# 端口检查和清理脚本

param(
    [switch]$Kill,      # 杀掉占用端口的进程
    [switch]$Wait,      # 等待端口可用
    [int]$Timeout = 30  # 等待超时秒数
)

$ports = @(3001, 5173)
$results = @{}

foreach ($port in $ports) {
    $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | 
            Where-Object { $_.State -eq 'Listen' } | 
            Select-Object -First 1
    
    if ($conn) {
        $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
        $results[$port] = @{
            Status = "IN_USE"
            PID = $conn.OwningProcess
            ProcessName = $proc.ProcessName
        }
        
        if ($Kill) {
            Write-Host "[清理] 杀掉端口 $port 上的进程 (PID: $($conn.OwningProcess), $($proc.ProcessName))" -ForegroundColor Yellow
            Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
            Start-Sleep -Milliseconds 500
            $results[$port].Status = "KILLED"
        }
    } else {
        $results[$port] = @{ Status = "FREE" }
    }
}

# 输出结果
Write-Host ""
Write-Host "端口检查结果:" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Gray
foreach ($port in $ports) {
    $r = $results[$port]
    $color = switch ($r.Status) {
        "IN_USE" { "Green" }
        "KILLED" { "Yellow" }
        "FREE"   { "Red" }
    }
    $statusText = switch ($r.Status) {
        "IN_USE" { "✅ 监听中 (PID: $($r.PID), $($r.ProcessName))" }
        "KILLED" { "⚠️ 已清理" }
        "FREE"   { "❌ 未运行" }
    }
    Write-Host "端口 ${port}: $statusText" -ForegroundColor $color
}
Write-Host "================================" -ForegroundColor Gray

# 如果需要等待端口可用
if ($Wait) {
    $start = Get-Date
    foreach ($port in $ports) {
        while ($results[$port].Status -ne "IN_USE") {
            $elapsed = ((Get-Date) - $start).TotalSeconds
            if ($elapsed -ge $Timeout) {
                Write-Host "[超时] 端口 $port 在 ${Timeout}秒内未启动" -ForegroundColor Red
                return $false
            }
            Start-Sleep -Seconds 1
            $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | 
                    Where-Object { $_.State -eq 'Listen' } | 
                    Select-Object -First 1
            if ($conn) {
                $results[$port].Status = "IN_USE"
                Write-Host "[就绪] 端口 $port 已启动" -ForegroundColor Green
                break
            }
            Write-Host "." -NoNewline
        }
    }
    Write-Host ""
}

# 返回所有端口是否都在监听
$allListening = $ports.All({ $results[$_].Status -eq "IN_USE" })
return $allListening
