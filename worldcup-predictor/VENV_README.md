# Python Virtual Environment Setup

## Location
`E:\opencode对话\worldcup-predictor\venv`

## Activation

### Windows PowerShell
```powershell
& "E:\opencode对话\worldcup-predictor\venv\Scripts\Activate.ps1"
```

### Windows Command Prompt
```cmd
E:\opencode对话\worldcup-predictor\venv\Scripts\activate.bat
```

### Using the helper script
```cmd
E:\opencode对话\worldcup-predictor\activate-venv.bat
```

## Installed Packages

| Package | Version | Purpose |
|---------|---------|---------|
| pandas | 3.0.3 | Data processing |
| numpy | 2.4.6 | Numerical computing |
| scikit-learn | 1.9.0 | Machine learning (AI prediction) |
| requests | 2.34.2 | HTTP requests |
| python-dotenv | 1.2.2 | Environment variables |
| scipy | 1.17.1 | Scientific computing |
| joblib | 1.5.3 | Parallel processing |

## Deactivate
```powershell
deactivate
```

## Install Additional Packages
```powershell
# Use Tsinghua mirror for faster downloads in China
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple package_name

# Or add to requirements.txt and install all
pip install -r requirements.txt
```

## Verify Installation
```python
import pandas
import numpy
import sklearn
import requests
print("All packages working!")
```
