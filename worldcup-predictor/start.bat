@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║       今天你买球了吗 - 2026世界杯预测平台                  ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

:: 检查 Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js
    echo 下载地址：https://nodejs.org/
    pause
    exit /b 1
)

:: 检查 npm
npm -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 npm，请先安装 npm
    pause
    exit /b 1
)

echo [信息] Node.js 版本：
node -v
echo [信息] npm 版本：
npm -v
echo.

:: 清理旧进程
echo [步骤 1/4] 清理旧进程...
powershell -ExecutionPolicy Bypass -File "%~dp0scripts\check-ports.ps1" -Kill
echo.

:: 检查依赖是否已安装
if not exist "server\node_modules" (
    echo [步骤 2/4] 安装后端依赖...
    cd server
    call npm install
    cd ..
    echo.
) else (
    echo [步骤 2/4] 后端依赖已安装，跳过
)

if not exist "client\node_modules" (
    echo [步骤 3/4] 安装前端依赖...
    cd client
    call npm install
    cd ..
    echo.
) else (
    echo [步骤 3/4] 前端依赖已安装，跳过
)

:: 初始化数据库
echo [步骤 4/4] 初始化数据库...
cd server
if not exist "node_modules\bcryptjs" (
    call npm install bcryptjs
)
node setup.js
cd ..
echo.

echo ══════════════════════════════════════════════════════════════
echo [启动] 正在启动服务器...
echo ══════════════════════════════════════════════════════════════
echo.

:: 启动后端服务器
echo [1/2] 启动后端服务器 (端口 3001)...
start "⚽ 后端服务器" cmd /k "cd /d "%~dp0server" && title 后端服务器 - Port 3001 && node src/index.js"

:: 等待后端启动
echo    等待后端响应...
timeout /t 3 /nobreak >nul

:: 启动前端服务器
echo [2/2] 启动前端服务器 (端口 5173)...
start "⚽ 前端服务器" cmd /k "cd /d "%~dp0client" && title 前端服务器 - Port 5173 && npm run dev"

:: 等待前端启动
echo    等待前端响应...
timeout /t 5 /nobreak >nul

:: 健康检查
echo.
echo [健康检查] 验证服务状态...
powershell -ExecutionPolicy Bypass -File "%~dp0scripts\check-ports.ps1" -Wait -Timeout 15

echo.
echo ══════════════════════════════════════════════════════════════
echo.
echo   ✅ 服务启动成功！
echo.
echo   📱 前端地址: http://localhost:5173
echo   🔧 后端地址: http://localhost:3001
echo   📊 健康检查: http://localhost:3001/api/health
echo.
echo   👑 管理员账号: jtnmqlm / a1234567
echo.
echo ══════════════════════════════════════════════════════════════
echo.

:: 打开浏览器
start http://localhost:5173

echo 按任意键退出此窗口...
pause >nul
