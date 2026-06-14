@echo off
echo ========================================
echo    WorldCup Predictor 2026
echo    Python Virtual Environment
echo ========================================
echo.
echo Activating virtual environment...
call "%~dp0venv\Scripts\activate.bat"
echo.
echo Python: %PYTHON_PATH%
echo.
echo Installed packages:
pip list 2>nul | findstr /i "pandas numpy scikit-learn requests python-dotenv"
echo.
echo Usage:
echo   python your_script.py
echo   pip install package_name
echo.
echo Deactivate with: deactivate
echo.
cmd /k
