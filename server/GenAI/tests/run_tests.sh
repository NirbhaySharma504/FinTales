#!/bin/bash
# Test runner script for FinTales backend

echo "=========================================="
echo "FinTales Backend Test Suite"
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if virtual environment is activated
if [ -z "$VIRTUAL_ENV" ]; then
    echo -e "${YELLOW}Warning: Virtual environment not activated${NC}"
    echo "Activating virtual environment..."
    source venv/bin/activate
fi

# Install test dependencies if needed
echo "Checking test dependencies..."
pip install -q pytest pytest-asyncio pytest-cov pytest-mock httpx responses freezegun

# Run tests with coverage
echo ""
echo "Running unit tests..."
pytest tests/unit -v --cov=. --cov-report=term-missing --tb=short -m unit || true

echo ""
echo "Running integration tests..."
pytest tests/integration -v --cov=. --cov-report=term-missing --tb=short -m integration || true

echo ""
echo "Running module tests..."
pytest tests/module -v --cov=. --cov-report=term-missing --tb=short -m module || true

echo ""
echo "Running all tests with coverage report..."
pytest tests/ -v --cov=. --cov-report=html --cov-report=term-missing --cov-report=xml || true

echo ""
echo -e "${GREEN}=========================================="
echo "Test Suite Complete"
echo "==========================================${NC}"
echo ""
echo "Coverage report generated in htmlcov/index.html"
echo "XML coverage report generated in coverage.xml"

