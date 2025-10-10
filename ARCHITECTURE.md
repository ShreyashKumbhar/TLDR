# TLDR Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│                        Port: 3000 / 80                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │   Home   │  │  Submit  │  │ Trending │  │   Tags   │       │
│  │   Page   │  │   Page   │  │   Page   │  │  Filter  │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└────────────────────────┬────────────────────────────────────────┘
                        │ HTTP/REST
                        │
┌────────────────────────┴────────────────────────────────────────┐
│                    Backend Microservices                         │
├──────────────┬──────────────┬──────────────┬──────────────┬─────┤
│              │              │              │              │     │
│  User Svc    │ Summary Svc  │  Vote Svc    │ Comment Svc  │ ... │
│  Port: 8081  │  Port: 8082  │  Port: 8083  │  Port: 8084  │     │
│              │              │              │              │     │
│  ┌────────┐  │  ┌────────┐  │  ┌────────┐  │  ┌────────┐  │     │
│  │  User  │  │  │Summary │  │  │  Vote  │  │  │Comment │  │     │
│  │  Mgmt  │  │  │  CRUD  │  │  │  Logic │  │  │  CRUD  │  │     │
│  └────────┘  │  └────────┘  │  └────────┘  │  └────────┘  │     │
│      │       │      │       │      │       │      │       │     │
│      ▼       │      ▼       │      ▼       │      ▼       │     │
│  ┌────────┐  │  ┌────────┐  │  ┌────────┐  │  ┌────────┐  │     │
│  │   H2   │  │  │   H2   │  │  │   H2   │  │  │   H2   │  │     │
│  │   DB   │  │  │   DB   │  │  │   DB   │  │  │   DB   │  │     │
│  └────────┘  │  └────────┘  │  └────────┘  │  └────────┘  │     │
└──────────────┴──────────────┴──────────────┴──────────────┴─────┘

Additional Services:
- Saved Service (Port: 8085) - Save summaries for later
- Tag Service (future) - Advanced tag management
- Digest Service (future) - Scheduled digest generation
```

## Request Flow Example

### Submitting a News Summary

```
User (Browser)
    │
    │ 1. Submit form with title, content, URL, tags
    │
    ▼
Frontend (React)
    │
    │ 2. POST /api/summaries
    │
    ▼
Summary Service (8082)
    │
    │ 3. Validate and save summary
    │
    ▼
Database (H2)
    │
    │ 4. Return saved summary with ID
    │
    ▼
Frontend
    │
    │ 5. Display new summary
    │
    ▼
User
```

### Voting on a Summary

```
User
    │
    │ 1. Click upvote/downvote
    │
    ▼
Frontend
    │
    ├─── 2. POST /api/votes (userId, summaryId, value)
    │    │
    │    ▼
    │    Vote Service (8083)
    │    │
    │    └─── 3. Record/update vote
    │
    └─── 4. PUT /api/summaries/{id}/votes (update count)
         │
         ▼
         Summary Service (8082)
         │
         └─── 5. Update vote count
```

## Data Models

### Summary
```
- id: Long
- title: String
- content: String (max 1000 chars)
- originalUrl: String
- userId: Long
- tags: Set<String>
- createdAt: LocalDateTime
- voteCount: Integer
- commentCount: Integer
```

### Vote
```
- id: Long
- userId: Long
- summaryId: Long
- value: Integer (1 or -1)
- createdAt: LocalDateTime
```

### Comment
```
- id: Long
- summaryId: Long
- userId: Long
- content: String (max 500 chars)
- parentId: Long (for nested comments)
- createdAt: LocalDateTime
```

### User
```
- id: Long
- username: String
- email: String
- password: String (encrypted)
- karma: Integer
- createdAt: LocalDateTime
```
