#!/usr/bin/env bash
set -e

echo "========================================"
echo "Installing MultiBoard Jobs Backend"
echo "========================================"
echo ""

echo "Step 1: Installing Core Web Framework Packages..."
pip install "fastapi>=0.116.0"
pip install "uvicorn[standard]>=0.35.0"
pip install "pydantic>=2.11.0"
echo "✓ Core web framework packages installed"
echo ""

echo "Step 2: Installing Data Processing Packages..."
pip install "pandas>=2.3.0"
pip install "numpy>=2.3.0"
echo "✓ Data processing packages installed"
echo ""

echo "Step 3: Installing python-jobspy (without dependencies)..."
pip install python-jobspy --no-deps
echo "✓ python-jobspy installed"
echo ""

echo "Step 4: Installing JobSpy Dependencies..."
pip install "beautifulsoup4>=4.13.0"
pip install "lxml>=6.0.0"
pip install "requests>=2.31.0"
pip install "markdownify>=0.13.1"
pip install "regex>=2024.4.28"
pip install "tls-client>=1.0.0"
echo "✓ JobSpy dependencies installed"
echo ""

echo "========================================"
echo "Installation Complete!"
echo "========================================"
echo ""
echo "You can now run the server with: python app.py"

