@echo off
echo ========================================
echo VoiceShield AI Backend Restart
echo ========================================
echo.

cd backend

echo Stopping any running uvicorn processes...
taskkill /F /IM python.exe /FI "WINDOWTITLE eq *uvicorn*" 2>nul

echo.
echo Starting backend server...
echo.

python -m uvicorn server:app --reload --host 0.0.0.0 --port 8000

pause
