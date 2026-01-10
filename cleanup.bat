@echo off
echo ========================================
echo  VitechCo Process Hub - Cleanup Script
echo ========================================
echo.
echo Xoa cac folder khong can thiet...
echo.

REM Xoa node_modules
if exist node_modules (
    echo [1/8] Xoa node_modules...
    rmdir /s /q node_modules
    echo Done: node_modules deleted
) else (
    echo [1/8] Skip: node_modules khong ton tai
)

REM Xoa .next
if exist .next (
    echo [2/8] Xoa .next...
    rmdir /s /q .next
    echo Done: .next deleted
) else (
    echo [2/8] Skip: .next khong ton tai
)

REM Xoa .git (QUAN TRONG: File nay thuong rat lon >100MB)
if exist .git (
    echo [3/9] Xoa .git...
    rmdir /s /q .git
    echo Done: .git deleted
) else (
    echo [3/9] Skip: .git khong ton tai
)

REM Xoa coverage
if exist coverage (
    echo [4/8] Xoa coverage...
    rmdir /s /q coverage
    echo Done: coverage deleted
) else (
    echo [4/8] Skip: coverage khong ton tai
)

REM Xoa .vercel
if exist .vercel (
    echo [5/8] Xoa .vercel...
    rmdir /s /q .vercel
    echo Done: .vercel deleted
) else (
    echo [5/8] Skip: .vercel khong ton tai
)

REM Xoa playwright-report
if exist playwright-report (
    echo [6/8] Xoa playwright-report...
    rmdir /s /q playwright-report
    echo Done: playwright-report deleted
) else (
    echo [6/8] Skip: playwright-report khong ton tai
)

REM Xoa test-results
if exist test-results (
    echo [7/8] Xoa test-results...
    rmdir /s /q test-results
    echo Done: test-results deleted
) else (
    echo [7/8] Skip: test-results khong ton tai
)

REM Xoa database backups (QUAN TRONG: File >300MB)
echo [8/9] Xoa large database files...
del /q prisma\dev.db.backup 2>nul
del /q prisma\*.db 2>nul
echo Done: Database backups deleted

REM Xoa log files
echo [9/9] Xoa *.log files...
del /q *.log 2>nul
echo Done: Log files deleted

echo.
echo ========================================
echo  CLEANUP HOAN TAT!
echo ========================================
echo.
echo Project da clean. Ban co the tao ZIP bay gio!
echo.
pause
