# Installation script for LinkedIn Job Scraper Backend
# Run this script in PowerShell from the backend directory

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installing LinkedIn Job Scraper Backend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Install Core Web Framework Packages
Write-Host "Step 1: Installing Core Web Framework Packages..." -ForegroundColor Yellow
pip install fastapi>=0.116.0
pip install "uvicorn[standard]>=0.35.0"
pip install pydantic>=2.11.0
Write-Host "✓ Core web framework packages installed" -ForegroundColor Green
Write-Host ""

# Step 2: Install Data Processing Packages
Write-Host "Step 2: Installing Data Processing Packages..." -ForegroundColor Yellow
pip install pandas>=2.3.0
pip install numpy>=2.3.0
Write-Host "✓ Data processing packages installed" -ForegroundColor Green
Write-Host ""

# Step 3: Install JobSpy Package (without dependencies)
Write-Host "Step 3: Installing python-jobspy (without dependencies)..." -ForegroundColor Yellow
pip install python-jobspy --no-deps
Write-Host "✓ python-jobspy installed" -ForegroundColor Green
Write-Host ""

# Step 4: Install JobSpy Dependencies
Write-Host "Step 4: Installing JobSpy Dependencies..." -ForegroundColor Yellow
pip install beautifulsoup4>=4.13.0
pip install lxml>=6.0.0
pip install requests>=2.31.0
pip install markdownify>=0.13.1
pip install regex>=2024.4.28
pip install tls-client>=1.0.0
Write-Host "✓ JobSpy dependencies installed" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now run the server with: python app.py" -ForegroundColor Yellow

