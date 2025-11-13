# TLDR Project Summary

## What Was Built

A complete microservices-based web application for news summaries, similar to Reddit but specifically for news content. The application allows users to browse, submit, and vote on concise news summaries with links to original articles.

## Project Structure

```
TLDR/
├── backend/                    # Spring Boot microservices
│   ├── user-service/          # User management (Port 8081)
│   ├── summary-service/       # News summaries CRUD (Port 8082)
│   ├── vote-service/          # Voting system (Port 8083)
│   ├── comment-service/       # Comments (Port 8084)
│   └── saved-service/         # Save for later (Port 8085)
├── frontend/                   # React application
│   ├── components/            # Reusable UI components
│   ├── pages/                 # Page components
│   └── services/              # API integration
├── scripts/                    # Utility scripts
└── Documentation              # Complete documentation suite
```

## Services Implemented

### 1. User Service (Port 8081)
**Purpose:** User management, authentication, and karma tracking

**Endpoints:**
- POST /api/auth/signup - Register account (returns JWT + profile)
- POST /api/auth/login - Authenticate and receive JWT
- POST /api/auth/password/reset-request - Request password reset token
- POST /api/auth/password/reset-confirm - Reset password using token
- GET /api/auth/me - Fetch profile for current JWT
- POST /api/users - Create user
- GET /api/users/{id} - Get user by ID
- GET /api/users/username/{username} - Get user by username
- GET /api/users - Get all users
- PUT /api/users/{id}/karma - Update user karma

**Features:**
- Secure signup/login with JWT authentication
- BCrypt password hashing with validation & sanitization
- Password reset token lifecycle management
- User profiles and karma system
- H2 in-memory database

### 2. Summary Service (Port 8082)
**Purpose:** Core news summary management

**Endpoints:**
- POST /api/summaries - Create summary
- GET /api/summaries - Get all summaries (paginated)
- GET /api/summaries/{id} - Get summary by ID
- GET /api/summaries/top - Get top-voted summaries
- GET /api/summaries/tags?tags=tech,science - Filter by tags
- GET /api/summaries/user/{userId} - Get user's summaries
- GET /api/summaries/trending - Get trending digest (last 24h)
- PUT /api/summaries/{id}/votes - Update vote count
- PUT /api/summaries/{id}/comments - Update comment count

**Features:**
- Summary CRUD operations
- Tag-based filtering
- Trending digest generation
- Pagination support
- Vote/comment count tracking

### 3. Vote Service (Port 8083)
**Purpose:** Handle upvotes and downvotes

**Endpoints:**
- POST /api/votes - Cast or update vote
- GET /api/votes?userId={id}&summaryId={id} - Get user's vote
- GET /api/votes/count/{summaryId} - Get total votes
- DELETE /api/votes - Remove vote

**Features:**
- Upvote/downvote system
- One vote per user per summary
- Vote counting
- Vote removal

### 4. Comment Service (Port 8084)
**Purpose:** Comment management

**Endpoints:**
- POST /api/comments - Create comment
- GET /api/comments/{id} - Get comment by ID
- GET /api/comments/summary/{summaryId} - Get comments for summary
- GET /api/comments/count/{summaryId} - Get comment count
- DELETE /api/comments/{id} - Delete comment

**Features:**
- Comment CRUD operations
- Nested comments (parent-child)
- Pagination support
- Comment counting

### 5. Saved Service (Port 8085)
**Purpose:** Save summaries for later reading

**Endpoints:**
- POST /api/saved - Save summary
- GET /api/saved/user/{userId} - Get user's saved summaries
- GET /api/saved/check?userId={id}&summaryId={id} - Check if saved
- DELETE /api/saved - Unsave summary

**Features:**
- Bookmark summaries
- Manage saved content
- Check save status

## Frontend Components

### Pages
1. **HomePage** - Browse all summaries with sorting (recent/top)
2. **SubmitPage** - Form to submit new summaries (auth required)
3. **TrendingPage** - View trending summaries from last 24 hours
4. **LoginPage** - Authenticate existing users with client-side validation
5. **SignupPage** - Register new users with helpful validation hints
6. **ForgotPasswordPage** - Start password reset flow
7. **ResetPasswordPage** - Complete password reset using token

### Components
1. **Header** - Navigation bar with auth-aware actions
2. **SummaryCard** - Display individual summary with voting (auth-aware)
3. **AuthContext** - React context for session and token management

### Services
- **API Service** - Centralized API communication layer with auth helpers

## Key Features Implemented

### ✅ Core Features
- [x] News summary submission with tags
- [x] Upvoting/downvoting system
- [x] Commenting with nested replies
- [x] Tagging by topic
- [x] Save summaries for later
- [x] Daily trending digest generation
- [x] Secure authentication with password recovery

### ✅ Technical Features
- [x] Microservices architecture
- [x] RESTful API design
- [x] Spring Boot 3.1.5
- [x] React 18 frontend
- [x] H2 in-memory databases
- [x] JPA/Hibernate ORM
- [x] Docker support
- [x] CORS configuration
- [x] Pagination
- [x] Data validation
- [x] JWT-based authentication with BCrypt hashing

### ✅ Developer Experience
- [x] Complete documentation suite
- [x] Quick start guide
- [x] Architecture documentation
- [x] Contributing guidelines
- [x] Sample data script
- [x] Docker Compose orchestration
- [x] .gitignore configuration

## Technologies Used

### Backend
- **Language:** Java 17
- **Framework:** Spring Boot 3.1.5
- **Build Tool:** Maven
- **Database:** H2 (in-memory)
- **ORM:** Spring Data JPA with Hibernate
- **Utilities:** Lombok

### Frontend
- **Library:** React 18.2.0
- **Routing:** React Router DOM v6
- **HTTP Client:** Axios
- **Build Tool:** Create React App
- **Styling:** Custom CSS

### DevOps
- **Containerization:** Docker
- **Orchestration:** Docker Compose
- **Version Control:** Git

## Data Models

### User
```java
- id: Long
- username: String (unique)
- email: String (unique)
- password: String (hashed)
- karma: Integer
- createdAt: LocalDateTime
```

### PasswordResetToken
```java
- id: Long
- token: String (unique)
- user: User
- expiresAt: LocalDateTime
- used: Boolean
```

### Summary
```java
- id: Long
- title: String
- content: String (max 1000 chars)
- originalUrl: String
- userId: Long
- tags: Set<String>
- voteCount: Integer
- commentCount: Integer
- createdAt: LocalDateTime
```

### Vote
```java
- id: Long
- userId: Long
- summaryId: Long
- value: Integer (1 or -1)
- createdAt: LocalDateTime
- Unique constraint: (userId, summaryId)
```

### Comment
```java
- id: Long
- summaryId: Long
- userId: Long
- content: String (max 500 chars)
- parentId: Long (nullable, for nested comments)
- createdAt: LocalDateTime
```

### SavedSummary
```java
- id: Long
- userId: Long
- summaryId: Long
- savedAt: LocalDateTime
- Unique constraint: (userId, summaryId)
```

## How to Run

### Option 1: Docker (Recommended)
```bash
docker-compose up --build
```
Access at http://localhost:3000

### Option 2: Manual
```bash
# Start each backend service
cd backend/[service-name]
mvn spring-boot:run

# Start frontend
cd frontend
npm install
npm start
```

### Load Sample Data
```bash
./scripts/init-sample-data.sh
```

## API Examples

### Create a Summary
```bash
curl -X POST http://localhost:8082/api/summaries \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Breaking News",
    "content": "Summary of the news...",
    "originalUrl": "https://example.com/article",
    "userId": 1,
    "tags": ["technology", "innovation"]
  }'
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

### Get Trending
```bash
curl http://localhost:8082/api/summaries/trending
```

## Future Enhancements

- Multi-factor authentication and refresh tokens
- Search functionality
- Real-time notifications
- Email digest subscriptions
- User profiles with activity history
- Content moderation
- Advanced filtering
- Mobile app
- API rate limiting
- Caching (Redis)
- Production database (PostgreSQL)
- Service discovery (Eureka)
- API Gateway (Spring Cloud Gateway)
- Monitoring (Prometheus/Grafana)
- Logging (ELK Stack)

## Success Metrics

✅ **5 microservices** fully implemented
✅ **20+ REST endpoints** across all services
✅ **7 React pages** with authentication flows
✅ **100% Docker support** for deployment
✅ **Complete documentation** suite (4 files)
✅ **Sample data script** for testing
✅ **Production-ready structure** with clean separation

## Conclusion

TLDR is a complete, production-ready skeleton for a microservices-based news aggregation platform. It demonstrates best practices in:
- Microservices architecture
- RESTful API design
- Frontend-backend integration
- Containerization
- Documentation
- Developer experience

The application is ready for further development and can serve as a foundation for a full-featured news aggregation platform.
