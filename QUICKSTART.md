# Quick Start Guide

This guide will help you get TLDR up and running on your local machine in minutes.

## Prerequisites

Make sure you have the following installed:
- **Java 17+** - [Download](https://adoptium.net/)
- **Maven 3.6+** - [Download](https://maven.apache.org/download.cgi)
- **Node.js 16+** - [Download](https://nodejs.org/)
- **Docker & Docker Compose** (optional) - [Download](https://www.docker.com/get-started)

## Option 1: Docker (Recommended)

The fastest way to get started is using Docker:

```bash
# Clone the repository
git clone https://github.com/ShreyashKumbhar/TLDR.git
cd TLDR

# Start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend services: http://localhost:8081-8085
```

That's it! All microservices and the frontend will start automatically.

## Option 2: Manual Setup

If you prefer to run services individually:

### Step 1: Start Backend Services

Open 5 terminal windows and run each service:

**Terminal 1 - User Service:**
```bash
cd backend/user-service
mvn spring-boot:run
# Runs on http://localhost:8081
```

**Terminal 2 - Summary Service:**
```bash
cd backend/summary-service
mvn spring-boot:run
# Runs on http://localhost:8082
```

**Terminal 3 - Vote Service:**
```bash
cd backend/vote-service
mvn spring-boot:run
# Runs on http://localhost:8083
```

**Terminal 4 - Comment Service:**
```bash
cd backend/comment-service
mvn spring-boot:run
# Runs on http://localhost:8084
```

**Terminal 5 - Saved Service:**
```bash
cd backend/saved-service
mvn spring-boot:run
# Runs on http://localhost:8085
```

### Step 2: Start Frontend

In a 6th terminal:

```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

## Verify Installation

1. Open http://localhost:3000 in your browser
2. You should see the TLDR homepage
3. Try these actions:
   - Click "Submit" to create a new summary
   - Vote on summaries
   - View trending summaries
   - Filter by tags

## Testing the APIs

You can test the backend APIs directly using curl or tools like Postman:

### Create a User
```bash
curl -X POST http://localhost:8081/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Create a Summary
```bash
curl -X POST http://localhost:8082/api/summaries \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Breaking: New Tech Announced",
    "content": "Company X announces revolutionary product that will change the industry...",
    "originalUrl": "https://example.com/article",
    "userId": 1,
    "tags": ["technology", "innovation"]
  }'
```

### Get All Summaries
```bash
curl http://localhost:8082/api/summaries
```

### Cast a Vote
```bash
curl -X POST http://localhost:8083/api/votes \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "summaryId": 1,
    "value": 1
  }'
```

### Get Trending Digest
```bash
curl http://localhost:8082/api/summaries/trending
```

## H2 Database Console

Each service has an H2 database console for debugging:

- User Service: http://localhost:8081/h2-console
- Summary Service: http://localhost:8082/h2-console
- Vote Service: http://localhost:8083/h2-console
- Comment Service: http://localhost:8084/h2-console
- Saved Service: http://localhost:8085/h2-console

**Connection Details:**
- JDBC URL: `jdbc:h2:mem:[servicename]db` (e.g., `jdbc:h2:mem:summarydb`)
- Username: `sa`
- Password: (leave blank)

## Common Issues

### Port Already in Use
If you see "Port already in use" errors:
```bash
# Find and kill the process using the port
# On Linux/Mac:
lsof -ti:8081 | xargs kill -9

# On Windows:
netstat -ano | findstr :8081
taskkill /PID <PID> /F
```

### Maven Build Fails
```bash
# Clean and rebuild
mvn clean install -DskipTests
```

### Frontend Won't Start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm start
```

## Next Steps

- Read the [Architecture documentation](ARCHITECTURE.md) to understand the system design
- Check the [API documentation](README.md#api-documentation) for all available endpoints
- Explore the code to see how microservices communicate
- Add your own features!

## Development Tips

1. **Hot Reload**: Spring Boot DevTools enables automatic restart on code changes
2. **Live Frontend**: React dev server automatically refreshes on changes
3. **Database**: H2 console lets you inspect data in real-time
4. **Logs**: Check console output for detailed request/response logs
5. **CORS**: Already configured for local development

## Stopping Services

### Docker:
```bash
docker-compose down
```

### Manual:
Press `Ctrl+C` in each terminal window running a service.

Happy coding! 🚀
