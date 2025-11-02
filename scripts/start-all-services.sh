#!/bin/bash

# Script to start all TLDR backend services

echo "Starting TLDR backend services..."

# Start User Service
echo "Starting User Service on port 8081..."
cd /home/runner/work/TLDR/TLDR/backend/user-service
nohup java -jar target/user-service-1.0.0.jar > /tmp/user-service.log 2>&1 &
sleep 3

# Start Summary Service
echo "Starting Summary Service on port 8082..."
cd /home/runner/work/TLDR/TLDR/backend/summary-service
nohup java -jar target/summary-service-1.0.0.jar > /tmp/summary-service.log 2>&1 &
sleep 3

# Start Vote Service
echo "Starting Vote Service on port 8083..."
cd /home/runner/work/TLDR/TLDR/backend/vote-service
nohup java -jar target/vote-service-1.0.0.jar > /tmp/vote-service.log 2>&1 &
sleep 3

# Start Comment Service
echo "Starting Comment Service on port 8084..."
cd /home/runner/work/TLDR/TLDR/backend/comment-service
nohup java -jar target/comment-service-1.0.0.jar > /tmp/comment-service.log 2>&1 &
sleep 3

# Start Saved Service
echo "Starting Saved Service on port 8085..."
cd /home/runner/work/TLDR/TLDR/backend/saved-service
nohup java -jar target/saved-service-1.0.0.jar > /tmp/saved-service.log 2>&1 &
sleep 3

echo ""
echo "All services starting... Please wait 10-15 seconds for complete initialization."
echo ""
echo "Service URLs:"
echo "  User Service:    http://localhost:8081"
echo "  Summary Service: http://localhost:8082"
echo "  Vote Service:    http://localhost:8083"
echo "  Comment Service: http://localhost:8084"
echo "  Saved Service:   http://localhost:8085"
echo ""
echo "Check logs in /tmp/*-service.log for details"
