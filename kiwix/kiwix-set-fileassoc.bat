@echo off
set SCRIPT_DIRECTORY_PATH=%~dp0
set KIWIX_PATH=%SCRIPT_DIRECTORY_PATH%kiwix.exe

reg add HKCU\Software\Classes\.zim /ve /d "zim" /f 2>nul 1>nul
reg add HKCU\Software\Classes\zim\shell\open\command /ve /d "\"%KIWIX_PATH%\" \"%%1\"" /f 2>nul 1>nul
