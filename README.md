# TLDR - Bite-sized News Summaries

TLDR is a microservices-based web application similar to Reddit, but specifically designed for news content. Users can browse, submit, and vote on concise news summaries that highlight key points with links to original articles. The platform enables community-curated, bite-sized news with quick, actionable insights.

## Features

### Core Features
- 📝 **Submit News Summaries** - Share concise summaries of news articles
- ⬆️ **Upvote/Downvote** - Vote on summaries to promote quality content
- 💬 **Commenting System** - Discuss summaries with nested comments
- ❤️ **Comment Likes & Moderation** - Reply chains with likes, reporting, and moderator controls keep discussions positive
- 🏷️ **Tag by Topic** - Organize summaries by topics (technology, politics, science, etc.)
- 💾 **Save for Later** - Bookmark summaries to read later
- 🔥 **Daily Trending Digest** - View the top summaries from the last 24 hours
- 👤 **Profile Dashboard** - Review your karma and manage/delete your submissions
- 🔐 **User Accounts** - Secure signup, login, and password recovery workflows
- 🎯 **Personalized Recommendations** - AI-powered content recommendations based on your interests
- 🔔 **Real-time Notifications** - Get notified about replies, likes, and badge achievements
- 🔍 **Search Functionality** - Search summaries by tags and keywords
- 🏆 **Badge System** - Earn badges based on upvotes received

### Technical Features
- Microservices architecture using Spring Boot
- Modern React frontend
- RESTful APIs for inter-service communication
- H2 in-memory databases (easily replaceable with PostgreSQL/MySQL)
- Docker support for easy deployment
- JWT-based authentication with BCrypt password hashing and input validation

## Architecture

The application is built using a microservices architecture with the following services:

### Backend Services (Spring Boot)

1. **User Service** (Port 8081)
   - User management and authentication
   - User karma tracking
   - Badge system based on upvotes

2. **Summary Service** (Port 8082)
   - News summary CRUD operations
   - Summary browsing and filtering
   - Tag management
   - Trending digest generation

3. **Vote Service** (Port 8083)
   - Upvote/downvote functionality
   - Vote counting and management

4. **Comment Service** (Port 8084)
   - Comment creation and retrieval
   - Nested comment support
   - Comment likes and moderation
   - Real-time notifications system

5. **Saved Service** (Port 8085)
   - Save summaries for later
   - Manage user's saved content

6. **Recommendation Service** (Port 8086)
   - Personalized content recommendations
   - User behavior tracking
   - Preference learning and adaptation

### Frontend (React)

- Modern, responsive UI
- Real-time voting and commenting
- Tag filtering and search
- Trending digest view
- Personalized recommendations feed
- Submission form
- Notification center
- User profile with badge display

## Project Structure

```
TLDR/
├── backend/
│   ├── user-service/
│   ├── summary-service/
│   ├── vote-service/
│   ├── comment-service/
│   ├── saved-service/
│   └── recommendation-service/
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       └── services/
├── docker-compose.yml
└── README.md
```

## Documentation

- **[Quick Start Guide](QUICKSTART.md)** - Get up and running in minutes
- **[Architecture](ARCHITECTURE.md)** - System design and data flow
- **[Contributing](CONTRIBUTING.md)** - How to contribute to the project
- **[Badge System](BADGE_SYSTEM.md)** - Badge tiers and achievement system
- **[Recommendation System](RECOMMENDATION_SYSTEM.md)** - Personalized content recommendations

## Getting Started

### Prerequisites

- Java 17 or higher
- Maven 3.6+
- Node.js 16+ and npm
- Docker and Docker Compose (optional, for containerized deployment)

### Running Locally

#### Backend Services

Each service can be run independently:

```bash
# User Service
cd backend/user-service
mvn spring-boot:run

# Summary Service
cd backend/summary-service
mvn spring-boot:run

# Vote Service
cd backend/vote-service
mvn spring-boot:run

# Comment Service
cd backend/comment-service
mvn spring-boot:run

# Saved Service
cd backend/saved-service
mvn spring-boot:run

# Recommendation Service
cd backend/recommendation-service
mvn spring-boot:run
```

#### Frontend

```bash
cd frontend
npm install
npm start
```

The frontend will be available at http://localhost:3000

### Preloaded Sample Data

- **Demo accounts** (all use password `password123!`):
  - `techfan@example.com`
  - `newsjunkie@example.com`
  - `sciencegeek@example.com`
  - `healthhero@example.com`
  - `marketwatcher@example.com`
- `techfan@example.com` has the `MODERATOR` role for testing comment moderation tools
- **Curated summaries** covering AI breakthroughs, climate policy, space exploration, biotech, and clean tech funding are inserted during service startup so the home page and trending view are never empty.
- Vote and comment counters are pre-populated to showcase engagement out of the box.

### Sample Data

To populate the application with sample data for testing:

```bash
# Make sure all services are running first
./scripts/init-sample-data.sh
```

This will create sample users, summaries, votes, and comments to help you explore the application.

### Running with Docker

The easiest way to run the entire application:

```bash
docker-compose up --build
```

This will start all services and the frontend. Access the application at http://localhost:3000

## API Documentation

### Summary Service (Port 8082)

- `GET /api/summaries` - Get all summaries (paginated)
- `GET /api/summaries/top` - Get top-voted summaries
- `GET /api/summaries/trending` - Get trending digest
- `GET /api/summaries/{id}` - Get summary by ID
- `POST /api/summaries` - Create new summary
- `GET /api/summaries/tags?tags=tech,science` - Filter by tags
- `GET /api/summaries/user/{userId}` - Fetch summaries for a specific user
- `DELETE /api/summaries/{id}?userId={userId}` - Delete a user's own summary

> **Startup seed data:** Five featured summaries (AI, climate, space, health, clean tech) are inserted automatically when no content exists to ensure the home feed showcases recent stories immediately after deployment.

### Vote Service (Port 8083)

- `POST /api/votes` - Cast a vote
- `GET /api/votes?userId={id}&summaryId={id}` - Get user's vote
- `GET /api/votes/count/{summaryId}` - Get vote count
- `DELETE /api/votes?userId={id}&summaryId={id}` - Remove vote

### Comment Service (Port 8084)

- `POST /api/comments` - Create comment or reply
- `GET /api/comments/summary/{summaryId}` - Get threaded comments (supports optional `viewerId` for like state)
- `GET /api/comments/count/{summaryId}` - Get comment count
- `DELETE /api/comments/{id}?userId={userId}` - Delete comment (owner or moderator)
- `POST /api/comments/{id}/likes?userId={userId}` - Like a comment
- `DELETE /api/comments/{id}/likes?userId={userId}` - Remove like
- `POST /api/comments/{id}/report?userId={userId}&reason=...` - Report a comment
- `POST /api/comments/{id}/moderate/hide?userId={moderatorId}` - Hide a comment (moderators)
- `POST /api/comments/{id}/moderate/restore?userId={moderatorId}` - Restore a hidden comment

#### Notifications
- `GET /api/notifications/user/{userId}` - Get user's notifications (paginated)
- `POST /api/notifications/{id}/read?userId={userId}` - Mark notification as read
- `POST /api/notifications/user/{userId}/read-all` - Mark all notifications as read
- `GET /api/notifications/user/{userId}/unread-count` - Get unread notification count
- `POST /api/notifications/badge?userId={userId}&badge={badge}` - Create badge notification

### Saved Service (Port 8085)

- `POST /api/saved` - Save summary
- `GET /api/saved/user/{userId}` - Get user's saved summaries
- `GET /api/saved/check?userId={id}&summaryId={id}` - Check if saved
- `DELETE /api/saved?userId={id}&summaryId={id}` - Unsave summary

### Recommendation Service (Port 8086)

- `GET /api/recommendations/user/{userId}?limit=20` - Get personalized recommendations
- `POST /api/recommendations/track?userId={id}&summaryId={id}&behaviorType={TYPE}` - Track user behavior (VIEW, UPVOTE, DOWNVOTE, COMMENT, SAVE)
- `POST /api/recommendations/feedback` - Submit feedback on recommendations
- `GET /api/recommendations/preferences/{userId}` - Get computed user preferences
- `POST /api/recommendations/preferences/{userId}/update` - Manually update preferences
- `DELETE /api/recommendations/track?userId={id}&summaryId={id}` - Remove vote behaviors

> **Behavior Tracking:** The system automatically tracks user interactions to build personalized recommendations. Supported types: VIEW (0.5), UPVOTE (2.0), DOWNVOTE (-1.0), COMMENT (1.5), SAVE (1.8).

### User Service (Port 8081)

#### Authentication
- `POST /api/auth/signup` - Register a new account (returns JWT + user profile)
- `POST /api/auth/login` - Sign in and receive JWT
- `POST /api/auth/password/reset-request` - Start password recovery flow
- `POST /api/auth/password/reset-confirm` - Complete password reset with token
- `GET /api/auth/me` - Fetch the current authenticated user's profile

#### User Management
- `POST /api/users` - Create user (server-side hashing & validation)
- `GET /api/users/{id}` - Get user by ID
- `GET /api/users/username/{username}` - Get user by username
- `PUT /api/users/{id}/karma?change={value}` - Update user karma
- `PUT /api/users/{id}/upvotes?change={value}` - Update user total upvotes (auto-updates badge)

## Technology Stack

### Backend
- **Framework:** Spring Boot 3.1.5
- **Language:** Java 17
- **Build Tool:** Maven
- **Database:** H2 (in-memory) - can be replaced with PostgreSQL/MySQL
- **ORM:** Spring Data JPA
- **API:** RESTful

### Frontend
- **Framework:** React 18
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Styling:** CSS3 (custom styling)

### DevOps
- **Containerization:** Docker
- **Orchestration:** Docker Compose

## Development

### Adding a New Feature

1. Identify which service(s) need to be modified
2. Update the model, repository, service, and controller layers
3. Update the frontend components and API service
4. Test the feature locally
5. Update documentation

### Database Configuration

Each service uses H2 in-memory database by default. To use a persistent database:

1. Update `pom.xml` to include your database driver
2. Update `application.properties` with connection details
3. Remove H2 dependency

Example for PostgreSQL:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/tldr
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Future Enhancements

- ~~User authentication and authorization (JWT/OAuth2)~~ ✅ Completed
- ~~Real-time notifications~~ ✅ Completed
- ~~Search functionality~~ ✅ Completed (tag-based)
- ~~User profiles and karma system~~ ✅ Completed
- ~~Content moderation tools~~ ✅ Completed
- Mobile app (React Native)
- Email digest subscriptions
- Advanced filtering and sorting
- Full-text search (Elasticsearch)
- API rate limiting
- Monitoring and logging (ELK Stack)
- Service discovery (Eureka)
- API Gateway (Spring Cloud Gateway)
- Multi-language support
- Dark mode theme

## License

This project is a demonstration/educational project for learning microservices architecture.

## Contact

For questions or suggestions, please open an issue in the repository.