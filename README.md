# TLDR - Bite-sized News Summaries

TLDR is a microservices-based web application similar to Reddit, but specifically designed for news content. Users can browse, submit, and vote on concise news summaries that highlight key points with links to original articles. The platform enables community-curated, bite-sized news with quick, actionable insights.

## Features

### Core Features
- 📝 **Submit News Summaries** - Share concise summaries of news articles
- ⬆️ **Upvote/Downvote** - Vote on summaries to promote quality content
- 💬 **Commenting System** - Discuss summaries with nested comments
- 🏷️ **Tag by Topic** - Organize summaries by topics (technology, politics, science, etc.)
- 💾 **Save for Later** - Bookmark summaries to read later
- 🔥 **Daily Trending Digest** - View the top summaries from the last 24 hours

### Technical Features
- Microservices architecture using Spring Boot
- Modern React frontend
- RESTful APIs for inter-service communication
- H2 in-memory databases (easily replaceable with PostgreSQL/MySQL)
- Docker support for easy deployment

## Architecture

The application is built using a microservices architecture with the following services:

### Backend Services (Spring Boot)

1. **User Service** (Port 8081)
   - User management and authentication
   - User karma tracking

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

5. **Saved Service** (Port 8085)
   - Save summaries for later
   - Manage user's saved content

### Frontend (React)

- Modern, responsive UI
- Real-time voting and commenting
- Tag filtering
- Trending digest view
- Submission form

## Project Structure

```
TLDR/
├── backend/
│   ├── user-service/
│   ├── summary-service/
│   ├── vote-service/
│   ├── comment-service/
│   └── saved-service/
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
```

#### Frontend

```bash
cd frontend
npm install
npm start
```

The frontend will be available at http://localhost:3000

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

### Vote Service (Port 8083)

- `POST /api/votes` - Cast a vote
- `GET /api/votes?userId={id}&summaryId={id}` - Get user's vote
- `GET /api/votes/count/{summaryId}` - Get vote count
- `DELETE /api/votes?userId={id}&summaryId={id}` - Remove vote

### Comment Service (Port 8084)

- `POST /api/comments` - Create comment
- `GET /api/comments/summary/{summaryId}` - Get comments for summary
- `GET /api/comments/count/{summaryId}` - Get comment count
- `DELETE /api/comments/{id}` - Delete comment

### Saved Service (Port 8085)

- `POST /api/saved` - Save summary
- `GET /api/saved/user/{userId}` - Get user's saved summaries
- `GET /api/saved/check?userId={id}&summaryId={id}` - Check if saved
- `DELETE /api/saved?userId={id}&summaryId={id}` - Unsave summary

### User Service (Port 8081)

- `POST /api/users` - Create user
- `GET /api/users/{id}` - Get user by ID
- `GET /api/users/username/{username}` - Get user by username
- `PUT /api/users/{id}/karma?change={value}` - Update user karma

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

- User authentication and authorization (JWT/OAuth2)
- Real-time notifications
- Search functionality
- User profiles and karma system
- Content moderation tools
- Mobile app (React Native)
- Email digest subscriptions
- Advanced filtering and sorting
- API rate limiting
- Monitoring and logging (ELK Stack)
- Service discovery (Eureka)
- API Gateway (Spring Cloud Gateway)

## License

This project is a demonstration/educational project for learning microservices architecture.

## Contact

For questions or suggestions, please open an issue in the repository.