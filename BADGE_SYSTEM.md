# Badge System Documentation

## Overview

The TLDR application now includes a badge system that rewards users based on the total number of upvotes they receive across all their submissions.

## Features

### User Model Enhancements

- **totalUpvotes**: Tracks the cumulative upvotes received by a user on all their summaries
- **badge**: A tier-based achievement level based on total upvotes

### Badge Tiers

Users are automatically assigned badges based on their total upvotes:

| Badge | Minimum Upvotes | Description |
|-------|----------------|-------------|
| NEWBIE | 0-9 | Starting level for all new users |
| BRONZE | 10-49 | Early contributor |
| SILVER | 50-199 | Active contributor |
| GOLD | 200-999 | Highly valued contributor |
| PLATINUM | 1000+ | Elite contributor |

## Implementation

### Backend Changes

#### 1. User Service (`user-service`)

**Model Updates** (`User.java`):
- Added `totalUpvotes` field (Integer, default: 0)
- Added `badge` field (String, default: "NEWBIE")

**DTO Updates** (`UserDTO.java`):
- Includes `totalUpvotes` and `badge` fields

**Service Layer** (`UserService.java`):
- New method: `updateTotalUpvotes(Long userId, Integer change)`
- Badge calculation logic: `determineBadge(int totalUpvotes)`
- Automatically updates badge when upvotes change

**Controller** (`UserController.java`):
- New endpoint: `PUT /api/users/{id}/upvotes?change={change}`

#### 2. Vote Service (`vote-service`)

**Service Updates** (`VoteService.java`):
- Calls summary-service to get the author's userId
- Calls user-service to update author's totalUpvotes when:
  - A new upvote is cast (+1)
  - An upvote is removed (-1)
  - An upvote changes to downvote (-1)
  - A downvote changes to upvote (+1)

**Flow**:
1. User casts/updates/removes vote
2. Vote service calculates the delta in upvotes (only counting value=1)
3. Vote service fetches the summary to get the author's userId
4. Vote service calls user-service to update the author's totalUpvotes
5. User service recalculates and updates the user's badge

### Frontend Changes

#### Profile Page (`ProfilePage.js`)

Added display of:
- Total Upvotes count
- Current badge tier

The profile stats section now shows:
- Karma
- Total Upvotes (new)
- Badge (new)
- Submissions

## API Endpoints

### Update User Total Upvotes

```
PUT /api/users/{id}/upvotes?change={change}
```

**Parameters**:
- `id` (path): User ID
- `change` (query): Integer change in upvotes (can be positive or negative)

**Response**: Updated `UserDTO` with new `totalUpvotes` and `badge`

**Example**:
```bash
curl -X PUT "http://localhost:8081/api/users/1/upvotes?change=1"
```

## Database Schema Changes

The `users` table in the user-service database now includes:

```sql
ALTER TABLE users ADD COLUMN total_upvotes INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN badge VARCHAR(255) DEFAULT 'NEWBIE';
```

## Notes

- Badge updates are automatic when totalUpvotes changes
- Only upvotes (vote value = 1) count toward badges; downvotes (value = -1) do not
- The system tracks upvotes per submission author, not per voter
- Badge tiers are calculated server-side to prevent client manipulation
- Upvote tracking is resilient - failures won't prevent voting operations

## Future Enhancements

Potential improvements:
- Badge display icons/colors in the UI
- Leaderboard showing top badge holders
- Time-based achievements (e.g., "Weekly Star")
- Notification when badge tier increases
- Badge history tracking
