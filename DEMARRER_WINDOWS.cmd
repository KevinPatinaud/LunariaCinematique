@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js est absent. Installer Node.js 22.12 minimum, puis relancer.
  pause
  exit /b 1
)
node -e "const [a,b]=process.versions.node.split('.').map(Number);process.exit(a<22||(a===22&&b<12)?1:0)"
if errorlevel 1 (
  echo Version Node incompatible : Node.js 22.12 minimum requis.
  pause
  exit /b 1
)
if not exist node_modules\.bin\electron.cmd (
  echo Premiere installation : npm va telecharger les dependances du projet.
  choice /C ON /M "Continuer [O/N]"
  if errorlevel 2 exit /b 0
  call npm install
  if errorlevel 1 goto failure
)
call npm run dev
if errorlevel 1 goto failure
exit /b 0
:failure
echo.
echo Le studio n'a pas pu demarrer. Consulter le message ci-dessus et README.md.
pause
exit /b 1
