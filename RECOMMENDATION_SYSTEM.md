# Personalized Recommendation System

## Overview

The TLDR platform now includes a comprehensive personalized recommendation system that learns from user behavior to provide relevant content suggestions. The system uses a hybrid approach combining content-based filtering and collaborative filtering to deliver accurate, personalized recommendations.

## Architecture

### Recommendation Service (Port 8086)

A new microservice dedicated to recommendation generation and user preference management.

**Key Components:**
- **UserBehavior**: Tracks all user interactions (views, votes, comments, saves)
- **UserPreference**: Stores computed user preferences (tags, authors, scores)
- **RecommendationFeedback**: Captures user feedback on recommendations

## How It Works

### 1. Behavior Tracking

The system automatically tracks user interactions:

- **VIEW** (weight: 0.5): When a user views a summary
- **UPVOTE** (weight: 2.0): When a user upvotes a summary
- **DOWNVOTE** (weight: -1.0): When a user downvotes a summary
- **COMMENT** (weight: 1.5): When a user comments on a summary
- **SAVE** (weight: 1.8): When a user saves a summary for later

### 2. Preference Building

User preferences are automatically calculated from behavior data:

- **Tag Preferences**: Based on tags of summaries the user interacts with
- **Author Preferences**: Based on authors whose summaries the user engages with
- **Time Decay**: Recent interactions are weighted more heavily (decay factor: 0.95 per day)

### 3. Recommendation Algorithm

The system uses a **hybrid approach**:

#### Content-Based Filtering (60% weight)
- Matches user's tag preferences with summary tags
- Considers author preferences
- Scores based on how well a summary matches known preferences

#### Collaborative Filtering (40% weight)
- Finds users with similar preferences (cosine similarity)
- Recommends summaries liked by similar users
- Considers interaction weights from similar users

#### Time Decay
- Recent summaries are prioritized
- Older content gradually loses relevance

### 4. Feedback Mechanism

Users can provide feedback on recommendations:

- **THUMBS_UP**: Positive feedback (helps improve recommendations)
- **THUMBS_DOWN**: Negative feedback (reduces similar recommendations)
- **NOT_INTERESTED**: Strong negative signal (excludes from future recommendations)
- **HIDE**: Hide this specific recommendation

## API Endpoints

### Get Recommendations
```
GET /api/recommendations/user/{userId}?limit=20
```
Returns personalized recommendations for a user.

### Track Behavior
```
POST /api/recommendations/track?userId={id}&summaryId={id}&behaviorType={TYPE}
```
Tracks user behavior (automatically called by frontend).

### Submit Feedback
```
POST /api/recommendations/feedback
Body: { userId, summaryId, feedbackType }
```
Submits user feedback on a recommendation.

### Get User Preferences
```
GET /api/recommendations/preferences/{userId}
```
Returns computed user preferences.

## Frontend Integration

### For You Page

A new `/foryou` page displays personalized recommendations with:
- Match percentage score
- Recommendation reason (e.g., "matches your interests, liked by similar users")
- Feedback buttons (Helpful, Not helpful, Not interested)

### Behavior Tracking

Automatically tracks:
- Views when SummaryCard is displayed
- Votes when user upvotes/downvotes
- Comments when user adds a comment

## Example User Profiles

### Tech Enthusiast Profile
```
Tag Preferences:
  - "technology": 0.85
  - "ai": 0.72
  - "programming": 0.68
  - "startups": 0.45

Author Preferences:
  - User 1 (tech blogger): 0.78
  - User 3 (AI researcher): 0.65

Total Interactions: 47
Preference Score: 12.3
```

**Sample Recommendations:**
1. "Latest AI Breakthrough in Language Models" (92% match - matches your interests, recent)
2. "Startup Funding Trends Q4 2024" (78% match - liked by similar users)
3. "New Programming Language Released" (85% match - matches your interests, recent)

### News Junkie Profile
```
Tag Preferences:
  - "politics": 0.82
  - "world-news": 0.75
  - "economics": 0.58
  - "society": 0.52

Author Preferences:
  - User 2 (news reporter): 0.71
  - User 5 (political analyst): 0.64

Total Interactions: 89
Preference Score: 18.7
```

**Sample Recommendations:**
1. "Global Economic Summit Results" (88% match - matches your interests, liked by similar users)
2. "Election Updates: Key Races" (91% match - matches your interests, recent)
3. "Social Policy Changes Announced" (76% match - matches your interests)

## Configuration

Recommendation algorithm can be tuned via `application.properties`:

```properties
recommendation.content-weight=0.6          # Content-based weight
recommendation.collaborative-weight=0.4    # Collaborative filtering weight
recommendation.min-interactions=3          # Minimum interactions for personalized recs
recommendation.max-recommendations=20     # Max recommendations per request
recommendation.decay-factor=0.95           # Time decay per day
```

## Learning and Adaptation

The system continuously learns and adapts:

1. **Real-time Updates**: Preferences are updated after each interaction
2. **Feedback Integration**: Negative feedback immediately adjusts preferences
3. **Similarity Refinement**: User similarity calculations improve as more data is collected
4. **Cold Start Handling**: New users see trending/popular content until enough data is collected

## Performance Considerations

- Preferences are cached and updated asynchronously
- Recommendations are computed on-demand (can be cached for performance)
- Behavior tracking is non-blocking
- Time decay calculations are optimized

## Future Enhancements

Potential improvements:
- Machine learning models (e.g., neural collaborative filtering)
- Real-time recommendation updates via WebSocket
- A/B testing framework for algorithm variants
- Explanation generation for recommendations
- Multi-armed bandit for exploration vs exploitation

