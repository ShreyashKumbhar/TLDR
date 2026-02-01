# Quick Start Guide

This guide will help you get TLDR up and running on your local machine in minutes.

## Prerequisites

Make sure you have the following installed:
- **Java 17+** - [Download](https://adoptium.net/)
- **Maven 3.6+** - [Download](https://maven.apache.org/download.cgi)
- **Node.js 16+** - [Download](https://nodejs.org/)

## Manual Setup

### Step 1: Start Backend Services

Open 6 terminal windows and run each service:

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

**Terminal 6 - Recommendation Service:**
```bash
cd backend/recommendation-service
mvn spring-boot:run
# Runs on http://localhost:8086
```

### Step 2: Start Frontend

In a 7th terminal:

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
   - Log in with a preloaded account such as `techfan@example.com` / `password123!`
   - Explore the featured summaries already on the home page
   - Request a password reset to see the recovery flow (token appears in user-service logs)
   - Click "Submit" to create a new summary (requires login)
   - Visit `/profile` to view your karma, badges, upvotes, and manage/delete your submissions
   - Expand the comments on any summary to reply, like, report, and (as `techfan`) hide/restore comments
   - Vote on summaries
   - View trending summaries
   - Filter by tags or use the search feature
   - Check the `/foryou` page for personalized recommendations
   - View notifications in the notification center
   - Earn badges by receiving upvotes on your submissions

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
- Recommendation Service: http://localhost:8086/h2-console

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

Press `Ctrl+C` in each terminal window running a service.

Happy coding! 🚀
