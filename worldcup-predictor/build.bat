@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║       构建生产版本                                         ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

:: 构建前端
echo [1/2] 构建前端生产版本...
cd client
call npm run build
if %errorlevel% neq 0 (
    echo [错误] 前端构建失败
    pause
    exit /b 1
)
cd ..
echo.

echo [2/2] 构建完成！
echo.
echo ══════════════════════════════════════════════════════════════
echo.
echo   ✅ 构建成功！
echo.
echo   前端构建产物: client/dist
echo   后端代码: server/
echo.
echo   部署说明:
echo   - 前端: 将 client/dist 目录部署到 Vercel/Netlify
echo   - 后端: 将 server 目录部署到 Railway/Render
echo.
echo ══════════════════════════════════════════════════════════════
echo.
pause
