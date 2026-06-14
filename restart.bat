@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║       快速重启 - 今天你买球了吗                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

:: 清理旧进程
echo [1/3] 停止所有服务...
powershell -ExecutionPolicy Bypass -File "%~dp0scripts\check-ports.ps1" -Kill
timeout /t 2 /nobreak >nul
echo.

:: 启动后端
echo [2/3] 启动后端服务器 (端口 3001)...
start "⚽ 后端服务器" cmd /k "cd /d "%~dp0server" && title 后端服务器 - Port 3001 && node src/index.js"
timeout /t 3 /nobreak >nul

:: 启动前端
echo [3/3] 启动前端服务器 (端口 5173)...
start "⚽ 前端服务器" cmd /k "cd /d "%~dp0client" && title 前端服务器 - Port 5173 && npm run dev"
timeout /t 5 /nobreak >nul

:: 验证
echo.
echo [验证] 检查服务状态...
powershell -ExecutionPolicy Bypass -File "%~dp0scripts\check-ports.ps1" -Wait -Timeout 15

echo.
echo ══════════════════════════════════════════════════════════════
echo   ✅ 重启完成！
echo   📱 http://localhost:5173
echo ══════════════════════════════════════════════════════════════
echo.

start http://localhost:5173

echo 按任意键退出...
pause >nul
