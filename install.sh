#!/bin/bash
set -e

echo "========================================"
echo "Installing MultiBoard Jobs (Full Stack)"
echo "========================================"
echo ""

# ============================================
# BACKEND INSTALLATION
# ============================================
echo "Step 1: Installing Backend Dependencies..."
cd backend

# Install core web framework packages
echo "  → Installing core web framework packages..."
pip install fastapi>=0.116.0 "uvicorn[standard]>=0.35.0" pydantic>=2.11.0 mangum>=0.17.0

# Install data processing packages
echo "  → Installing data processing packages..."
pip install pandas>=2.3.0 numpy>=2.3.0

# Install JobSpy without dependencies (critical step)
echo "  → Installing python-jobspy (without dependencies)..."
pip install python-jobspy --no-deps

# Install JobSpy dependencies separately
echo "  → Installing JobSpy dependencies..."
pip install beautifulsoup4>=4.13.0 lxml>=6.0.0 requests>=2.31.0 markdownify>=0.13.1 regex>=2024.4.28 tls-client>=1.0.0

echo "✓ Backend dependencies installed"
echo ""

# ============================================
# FRONTEND INSTALLATION
# ============================================
cd ../frontend
echo "Step 2: Installing Frontend Dependencies..."
npm install
echo "✓ Frontend dependencies installed"
echo ""

# ============================================
# FRONTEND BUILD
# ============================================
echo "Step 3: Building Frontend..."
npm run build
echo "✓ Frontend built successfully"
echo ""

cd ..
echo "========================================"
echo "Installation Complete!"
echo "========================================"

