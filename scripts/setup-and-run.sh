#!/bin/bash

# TLDR - Complete Setup and Startup Script
# This script builds all services and starts the complete application

set -e

echo "🚀 TLDR - Complete Setup and Startup"
echo "====================================="
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Step 1: Building backend services...${NC}"
echo ""

services=("user-service" "summary-service" "vote-service" "comment-service" "saved-service")

for service in "${services[@]}"; do
    echo "Building $service..."
    cd "$PROJECT_ROOT/backend/$service"
    mvn clean package -DskipTests > /dev/null 2>&1
    echo -e "${GREEN}✓${NC} $service built successfully"
done

echo ""
echo -e "${BLUE}Step 2: Starting backend services...${NC}"
echo ""

# Start User Service
echo "Starting User Service on port 8081..."
cd "$PROJECT_ROOT/backend/user-service"
nohup java -jar target/user-service-1.0.0.jar > /tmp/user-service.log 2>&1 &
sleep 3

# Start Summary Service
echo "Starting Summary Service on port 8082..."
cd "$PROJECT_ROOT/backend/summary-service"
nohup java -jar target/summary-service-1.0.0.jar > /tmp/summary-service.log 2>&1 &
sleep 3

# Start Vote Service
echo "Starting Vote Service on port 8083..."
cd "$PROJECT_ROOT/backend/vote-service"
nohup java -jar target/vote-service-1.0.0.jar > /tmp/vote-service.log 2>&1 &
sleep 3

# Start Comment Service
echo "Starting Comment Service on port 8084..."
cd "$PROJECT_ROOT/backend/comment-service"
nohup java -jar target/comment-service-1.0.0.jar > /tmp/comment-service.log 2>&1 &
sleep 3

# Start Saved Service
echo "Starting Saved Service on port 8085..."
cd "$PROJECT_ROOT/backend/saved-service"
nohup java -jar target/saved-service-1.0.0.jar > /tmp/saved-service.log 2>&1 &
sleep 5

echo ""
echo -e "${BLUE}Step 3: Starting frontend...${NC}"
echo ""

cd "$PROJECT_ROOT/frontend"
echo "Installing frontend dependencies (if needed)..."
if [ ! -d "node_modules" ]; then
    npm install > /dev/null 2>&1
fi
echo "Starting React development server on port 3000..."
nohup npm start > /tmp/frontend.log 2>&1 &

echo ""
echo -e "${GREEN}✓ All services started successfully!${NC}"
echo ""
echo "Please wait 10-20 seconds for all services to fully initialize..."
echo ""
echo "Service URLs:"
echo "  Frontend:        http://localhost:3000"
echo "  User Service:    http://localhost:8081"
echo "  Summary Service: http://localhost:8082"
echo "  Vote Service:    http://localhost:8083"
echo "  Comment Service: http://localhost:8084"
echo "  Saved Service:   http://localhost:8085"
echo ""
echo "Logs are available in /tmp/*-service.log and /tmp/frontend.log"
echo ""
echo "To populate with sample data, run:"
echo "  ./scripts/init-sample-data.sh"
echo ""
