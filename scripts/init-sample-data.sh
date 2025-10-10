#!/bin/bash

# TLDR - Sample Data Initialization Script
# This script populates the application with sample data for testing

echo "🚀 TLDR Sample Data Initialization"
echo "=================================="
echo ""

# Base URLs
USER_SERVICE="http://localhost:8081/api"
SUMMARY_SERVICE="http://localhost:8082/api"
VOTE_SERVICE="http://localhost:8083/api"
COMMENT_SERVICE="http://localhost:8084/api"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if service is running
check_service() {
    if curl -s "$1" > /dev/null; then
        echo -e "${GREEN}✓${NC} Service at $1 is running"
        return 0
    else
        echo -e "${RED}✗${NC} Service at $1 is not running"
        return 1
    fi
}

echo "Checking services..."
check_service "$USER_SERVICE/users" || exit 1
check_service "$SUMMARY_SERVICE/summaries" || exit 1
check_service "$VOTE_SERVICE/votes" || exit 1
check_service "$COMMENT_SERVICE/comments" || exit 1
echo ""

echo "Creating sample users..."

# Create users
curl -s -X POST "$USER_SERVICE/users" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "techfan",
    "email": "techfan@example.com",
    "password": "password123"
  }' > /dev/null

curl -s -X POST "$USER_SERVICE/users" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newsjunkie",
    "email": "newsjunkie@example.com",
    "password": "password123"
  }' > /dev/null

curl -s -X POST "$USER_SERVICE/users" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "sciencegeek",
    "email": "sciencegeek@example.com",
    "password": "password123"
  }' > /dev/null

echo -e "${GREEN}✓${NC} Created 3 sample users"

echo "Creating sample news summaries..."

# Summary 1
curl -s -X POST "$SUMMARY_SERVICE/summaries" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "AI Breakthrough: New Model Achieves Human-Level Performance",
    "content": "Researchers have developed a new AI model that matches human performance in complex reasoning tasks. The model uses novel architecture combining transformers with symbolic reasoning. Implications for automation and decision-making are significant.",
    "originalUrl": "https://example.com/ai-breakthrough",
    "userId": 1,
    "tags": ["technology", "ai", "research"]
  }' > /dev/null

# Summary 2
curl -s -X POST "$SUMMARY_SERVICE/summaries" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Climate Report: Global Temperatures Continue to Rise",
    "content": "Latest climate data shows global temperatures have risen 0.3°C in the past year. Scientists warn of accelerating ice melt in polar regions. Renewable energy adoption needs to increase 5x to meet 2030 targets.",
    "originalUrl": "https://example.com/climate-report",
    "userId": 2,
    "tags": ["climate", "science", "environment"]
  }' > /dev/null

# Summary 3
curl -s -X POST "$SUMMARY_SERVICE/summaries" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tech Giant Announces Revolutionary Quantum Computer",
    "content": "Major tech company unveils 1000-qubit quantum computer, claiming it can solve problems classical computers cannot. Applications include drug discovery, cryptography, and optimization. Commercial availability expected in 2025.",
    "originalUrl": "https://example.com/quantum-computer",
    "userId": 1,
    "tags": ["technology", "quantum", "innovation"]
  }' > /dev/null

# Summary 4
curl -s -X POST "$SUMMARY_SERVICE/summaries" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Study Reveals Benefits of Mediterranean Diet",
    "content": "10-year study of 50,000 participants shows Mediterranean diet reduces heart disease risk by 30%. Key factors include olive oil, fish, and vegetables. Researchers recommend gradual dietary changes for best results.",
    "originalUrl": "https://example.com/diet-study",
    "userId": 3,
    "tags": ["health", "science", "nutrition"]
  }' > /dev/null

# Summary 5
curl -s -X POST "$SUMMARY_SERVICE/summaries" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Space Mission Discovers Water on Distant Moon",
    "content": "NASA probe finds evidence of liquid water beneath surface of Europa. Discovery increases likelihood of extraterrestrial life. Follow-up mission planned for 2028 to investigate further.",
    "originalUrl": "https://example.com/space-discovery",
    "userId": 2,
    "tags": ["space", "science", "nasa"]
  }' > /dev/null

echo -e "${GREEN}✓${NC} Created 5 sample summaries"

echo "Adding sample votes..."

# Add votes to summaries
for summary_id in 1 2 3 4 5; do
    for user_id in 1 2 3; do
        value=$((RANDOM % 3 - 1))  # Random -1, 0, or 1
        if [ $value -ne 0 ]; then
            curl -s -X POST "$VOTE_SERVICE/votes" \
              -H "Content-Type: application/json" \
              -d "{
                \"userId\": $user_id,
                \"summaryId\": $summary_id,
                \"value\": $value
              }" > /dev/null
        fi
    done
done

echo -e "${GREEN}✓${NC} Added sample votes"

echo "Adding sample comments..."

# Add comments
curl -s -X POST "$COMMENT_SERVICE/comments" \
  -H "Content-Type: application/json" \
  -d '{
    "summaryId": 1,
    "userId": 2,
    "content": "This is amazing! Can'\''t wait to see the practical applications."
  }' > /dev/null

curl -s -X POST "$COMMENT_SERVICE/comments" \
  -H "Content-Type: application/json" \
  -d '{
    "summaryId": 1,
    "userId": 3,
    "content": "Great summary! Do you have a link to the research paper?"
  }' > /dev/null

curl -s -X POST "$COMMENT_SERVICE/comments" \
  -H "Content-Type: application/json" \
  -d '{
    "summaryId": 3,
    "userId": 2,
    "content": "Quantum computing is the future! 🚀"
  }' > /dev/null

curl -s -X POST "$COMMENT_SERVICE/comments" \
  -H "Content-Type: application/json" \
  -d '{
    "summaryId": 5,
    "userId": 1,
    "content": "The search for extraterrestrial life continues! Exciting times."
  }' > /dev/null

echo -e "${GREEN}✓${NC} Added sample comments"

echo ""
echo "=================================="
echo -e "${GREEN}✓ Sample data initialization complete!${NC}"
echo ""
echo "You can now:"
echo "  - Visit http://localhost:3000 to see the summaries"
echo "  - Browse trending topics"
echo "  - Test voting and commenting"
echo "  - Submit your own summaries"
echo ""
