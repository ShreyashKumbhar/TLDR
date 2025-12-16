package com.tldr.recommendation.service;

import com.tldr.recommendation.dto.FeedbackRequest;
import com.tldr.recommendation.dto.RecommendationDTO;
import com.tldr.recommendation.dto.UserPreferenceDTO;
import com.tldr.recommendation.model.RecommendationFeedback;
import com.tldr.recommendation.model.UserBehavior;
import com.tldr.recommendation.model.UserPreference;
import com.tldr.recommendation.repository.RecommendationFeedbackRepository;
import com.tldr.recommendation.repository.UserBehaviorRepository;
import com.tldr.recommendation.repository.UserPreferenceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationService {
    
    private final UserBehaviorRepository behaviorRepository;
    private final UserPreferenceRepository preferenceRepository;
    private final RecommendationFeedbackRepository feedbackRepository;
    private final RestTemplate restTemplate;
    
    @Value("${services.summary.base-url:http://summary-service:8082}")
    private String summaryServiceBaseUrl;
    
    @Value("${services.user.base-url:http://user-service:8081}")
    private String userServiceBaseUrl;
    
    @Value("${services.vote.base-url:http://vote-service:8083}")
    private String voteServiceBaseUrl;
    
    @Value("${services.comment.base-url:http://comment-service:8084}")
    private String commentServiceBaseUrl;
    
    @Value("${services.saved.base-url:http://saved-service:8085}")
    private String savedServiceBaseUrl;
    
    @Value("${recommendation.content-weight:0.6}")
    private double contentWeight;
    
    @Value("${recommendation.collaborative-weight:0.4}")
    private double collaborativeWeight;
    
    @Value("${recommendation.min-interactions:3}")
    private int minInteractions;
    
    @Value("${recommendation.max-recommendations:20}")
    private int maxRecommendations;
    
    @Value("${recommendation.decay-factor:0.95}")
    private double decayFactor;
    
    // Track behavior (called by other services or frontend)
    @Transactional
    public void trackBehavior(Long userId, Long summaryId, UserBehavior.BehaviorType behaviorType) {
        try {
            Optional<UserBehavior> existing = behaviorRepository.findByUserIdAndSummaryIdAndBehaviorType(
                userId, summaryId, behaviorType);
            
            if (existing.isPresent()) {
                UserBehavior behavior = existing.get();
                behavior.setWeight(behaviorType.getDefaultWeight());
                behavior.setUpdatedAt(LocalDateTime.now());
                behaviorRepository.save(behavior);
            } else {
                UserBehavior behavior = new UserBehavior();
                behavior.setUserId(userId);
                behavior.setSummaryId(summaryId);
                behavior.setBehaviorType(behaviorType);
                behavior.setWeight(behaviorType.getDefaultWeight());
                behaviorRepository.save(behavior);
            }
            
            // Update preferences (with error handling)
            try {
                updateUserPreferences(userId);
            } catch (Exception e) {
                log.error("Error updating preferences for user {}: {}", userId, e.getMessage(), e);
                // Don't fail the behavior tracking if preference update fails
            }
        } catch (Exception e) {
            log.error("Error tracking behavior for user {} on summary {}: {}", userId, summaryId, e.getMessage(), e);
            throw e;
        }
    }
    
    // Remove vote-related behaviors when a vote is removed
    @Transactional
    public void removeVoteBehaviors(Long userId, Long summaryId) {
        try {
            log.info("Removing vote behaviors for user {} on summary {}", userId, summaryId);
            // Delete UPVOTE and DOWNVOTE behaviors for this summary
            Optional<UserBehavior> upvoteBehavior = behaviorRepository.findByUserIdAndSummaryIdAndBehaviorType(
                userId, summaryId, UserBehavior.BehaviorType.UPVOTE);
            if (upvoteBehavior.isPresent()) {
                behaviorRepository.delete(upvoteBehavior.get());
                log.info("Deleted UPVOTE behavior for user {} on summary {}", userId, summaryId);
            }
            
            Optional<UserBehavior> downvoteBehavior = behaviorRepository.findByUserIdAndSummaryIdAndBehaviorType(
                userId, summaryId, UserBehavior.BehaviorType.DOWNVOTE);
            if (downvoteBehavior.isPresent()) {
                behaviorRepository.delete(downvoteBehavior.get());
                log.info("Deleted DOWNVOTE behavior for user {} on summary {}", userId, summaryId);
            }
            
            // Update preferences after removal
            try {
                updateUserPreferences(userId);
                log.info("Updated preferences for user {} after vote removal", userId);
            } catch (Exception e) {
                log.error("Error updating preferences after vote removal for user {}: {}", userId, e.getMessage(), e);
            }
        } catch (Exception e) {
            log.error("Error removing vote behaviors for user {} on summary {}: {}", userId, summaryId, e.getMessage(), e);
            throw e;
        }
    }
    
    // Get recommendations for a user
    public List<RecommendationDTO> getRecommendations(Long userId, int limit) {
        // Check if user has enough interactions
        long interactionCount = behaviorRepository.countByUserId(userId);
        if (interactionCount < minInteractions) {
            // Return trending/popular summaries for new users
            return getPopularRecommendations(limit);
        }
        
        // Get user preferences
        UserPreference preference = preferenceRepository.findByUserId(userId)
            .orElseGet(() -> {
                updateUserPreferences(userId);
                return preferenceRepository.findByUserId(userId).orElse(null);
            });
        
        if (preference == null) {
            return getPopularRecommendations(limit);
        }
        
        // Check if preferences are empty (no tag or author preferences)
        boolean preferencesEmpty = (preference.getTagPreferences() == null || preference.getTagPreferences().isEmpty()) &&
                                   (preference.getAuthorPreferences() == null || preference.getAuthorPreferences().isEmpty());
        
        if (preferencesEmpty) {
            log.info("User {} has empty preferences, returning popular recommendations", userId);
            return getPopularRecommendations(limit);
        }
        
        // Get all summaries (excluding already interacted)
        // Only exclude summaries with significant interactions (UPVOTE, DOWNVOTE, COMMENT, SAVE)
        // VIEW behaviors are lightweight and shouldn't prevent recommendations
        List<Long> interactedSummaries = behaviorRepository.findByUserId(userId)
            .stream()
            .filter(b -> b.getBehaviorType() != UserBehavior.BehaviorType.VIEW) // Don't exclude based on views
            .map(UserBehavior::getSummaryId)
            .distinct()
            .collect(Collectors.toList());
        
        // Get summaries from summary service
        List<Map<String, Object>> allSummaries = fetchAllSummaries();
        
        // Calculate recommendation scores
        Map<Long, RecommendationScore> scores = new HashMap<>();
        
        for (Map<String, Object> summary : allSummaries) {
            Long summaryId = Long.valueOf(summary.get("id").toString());
            
            // Skip already interacted summaries
            if (interactedSummaries.contains(summaryId)) {
                continue;
            }
            
            // Skip if user gave negative feedback
            if (hasNegativeFeedback(userId, summaryId)) {
                continue;
            }
            
            RecommendationScore score = calculateRecommendationScore(userId, summary, preference);
            scores.put(summaryId, score);
        }
        
        // If no scores calculated (all summaries filtered out or all scores are 0), return popular
        if (scores.isEmpty()) {
            log.info("No recommendation scores calculated for user {}, returning popular recommendations", userId);
            return getPopularRecommendations(limit);
        }
        
        // Sort by score and return top recommendations
        List<RecommendationDTO> recommendations = scores.entrySet().stream()
            .sorted((e1, e2) -> Double.compare(e2.getValue().totalScore, e1.getValue().totalScore))
            .limit(limit)
            .map(entry -> {
                Long summaryId = entry.getKey();
                RecommendationScore score = entry.getValue();
                Map<String, Object> summary = findSummaryById(allSummaries, summaryId);
                return buildRecommendationDTO(summary, score);
            })
            .collect(Collectors.toList());
        
        // If all recommendations have very low scores (near 0), fallback to popular
        if (!recommendations.isEmpty() && recommendations.stream().allMatch(r -> r.getScore() < 0.1)) {
            log.info("All recommendations for user {} have very low scores, returning popular recommendations", userId);
            return getPopularRecommendations(limit);
        }
        
        return recommendations;
    }
    
    // Calculate recommendation score using hybrid approach
    private RecommendationScore calculateRecommendationScore(
            Long userId, Map<String, Object> summary, UserPreference preference) {
        
        double contentScore = calculateContentBasedScore(summary, preference);
        double collaborativeScore = calculateCollaborativeScore(userId, summary);
        
        double totalScore = (contentWeight * contentScore) + (collaborativeWeight * collaborativeScore);
        
        // Apply time decay
        LocalDateTime createdAt = parseDateTime(summary.get("createdAt"));
        double timeDecay = calculateTimeDecay(createdAt);
        totalScore *= timeDecay;
        
        String reason = buildReason(contentScore, collaborativeScore, timeDecay);
        
        return new RecommendationScore(totalScore, contentScore, collaborativeScore, reason);
    }
    
    // Content-based filtering: match user preferences with summary features
    private double calculateContentBasedScore(Map<String, Object> summary, UserPreference preference) {
        double score = 0.0;
        double totalWeight = 0.0;
        
        // Tag matching - handle both List and Set
        try {
            Object tagsObj = summary.get("tags");
            if (tagsObj != null) {
                Set<String> tags = null;
                if (tagsObj instanceof Set) {
                    @SuppressWarnings("unchecked")
                    Set<String> tagsSet = (Set<String>) tagsObj;
                    tags = tagsSet;
                } else if (tagsObj instanceof List) {
                    @SuppressWarnings("unchecked")
                    List<String> tagsList = (List<String>) tagsObj;
                    tags = new HashSet<>(tagsList);
                }
                if (tags != null && !tags.isEmpty()) {
                    for (String tag : tags) {
                        Double tagPreference = preference.getTagPreferences().get(tag);
                        if (tagPreference != null) {
                            score += tagPreference;
                            totalWeight += 1.0;
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Error processing tags in calculateContentBasedScore: {}", e.getMessage());
        }
        
        // Author matching
        try {
            Object userIdObj = summary.get("userId");
            if (userIdObj != null) {
                Long authorId = Long.valueOf(userIdObj.toString());
                Double authorPreference = preference.getAuthorPreferences().get(authorId);
                if (authorPreference != null) {
                    score += authorPreference * 1.5; // Author preference weighted higher
                    totalWeight += 1.5;
                }
            }
        } catch (Exception e) {
            log.warn("Error processing author in calculateContentBasedScore: {}", e.getMessage());
        }
        
        return totalWeight > 0 ? score / totalWeight : 0.0;
    }
    
    // Collaborative filtering: find similar users and their preferences
    private double calculateCollaborativeScore(Long userId, Map<String, Object> summary) {
        Long summaryId = Long.valueOf(summary.get("id").toString());
        
        // Find users who interacted with this summary
        List<UserBehavior> behaviors = behaviorRepository.findBySummaryId(summaryId);
        if (behaviors.isEmpty()) {
            return 0.0;
        }
        
        // Get current user's preferences
        UserPreference userPreference = preferenceRepository.findByUserId(userId).orElse(null);
        if (userPreference == null) {
            return 0.0;
        }
        
        // Calculate similarity with users who interacted
        double totalSimilarity = 0.0;
        double totalWeight = 0.0;
        
        Set<Long> similarUsers = behaviors.stream()
            .map(UserBehavior::getUserId)
            .filter(uid -> !uid.equals(userId))
            .collect(Collectors.toSet());
        
        for (Long similarUserId : similarUsers) {
            UserPreference similarPreference = preferenceRepository.findByUserId(similarUserId).orElse(null);
            if (similarPreference != null) {
                double similarity = calculateUserSimilarity(userPreference, similarPreference);
                double interactionWeight = behaviors.stream()
                    .filter(b -> b.getUserId().equals(similarUserId))
                    .mapToDouble(UserBehavior::getWeight)
                    .sum();
                
                totalSimilarity += similarity * interactionWeight;
                totalWeight += interactionWeight;
            }
        }
        
        return totalWeight > 0 ? totalSimilarity / totalWeight : 0.0;
    }
    
    // Calculate similarity between two user preferences
    private double calculateUserSimilarity(UserPreference pref1, UserPreference pref2) {
        // Cosine similarity on tag preferences
        double dotProduct = 0.0;
        double norm1 = 0.0;
        double norm2 = 0.0;
        
        Set<String> allTags = new HashSet<>(pref1.getTagPreferences().keySet());
        allTags.addAll(pref2.getTagPreferences().keySet());
        
        for (String tag : allTags) {
            double val1 = pref1.getTagPreferences().getOrDefault(tag, 0.0);
            double val2 = pref2.getTagPreferences().getOrDefault(tag, 0.0);
            dotProduct += val1 * val2;
            norm1 += val1 * val1;
            norm2 += val2 * val2;
        }
        
        double denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
        return denominator > 0 ? dotProduct / denominator : 0.0;
    }
    
    // Update user preferences based on behavior
    @Transactional
    public void updateUserPreferences(Long userId) {
        List<UserBehavior> behaviors = behaviorRepository.findByUserId(userId);
        
        UserPreference preference = preferenceRepository.findByUserId(userId)
            .orElseGet(() -> {
                UserPreference newPref = new UserPreference();
                newPref.setUserId(userId);
                return newPref;
            });
        
        // Reset preferences
        preference.getTagPreferences().clear();
        preference.getAuthorPreferences().clear();
        
        // If no behaviors, clear preferences and return
        if (behaviors.isEmpty()) {
            preference.setTotalInteractions(0);
            preference.setPreferenceScore(0.0);
            preferenceRepository.save(preference);
            log.info("Cleared preferences for user {} - no behaviors", userId);
            return;
        }
        
        // Aggregate behaviors by summary
        Map<Long, List<UserBehavior>> behaviorsBySummary = behaviors.stream()
            .collect(Collectors.groupingBy(UserBehavior::getSummaryId));
        
        double totalWeight = 0.0;
        
        for (Map.Entry<Long, List<UserBehavior>> entry : behaviorsBySummary.entrySet()) {
            Long summaryId = entry.getKey();
            List<UserBehavior> summaryBehaviors = entry.getValue();
            
            // Get summary details
            Map<String, Object> summary = fetchSummary(summaryId);
            if (summary == null) {
                log.warn("Summary {} not found, skipping preference update", summaryId);
                continue;
            }
            
            // Calculate weight for this summary
            double summaryWeight = summaryBehaviors.stream()
                .mapToDouble(b -> b.getWeight() * calculateTimeDecay(b.getCreatedAt()))
                .sum();
            
            totalWeight += summaryWeight;
            
            // Update tag preferences - handle both List and Set
            try {
                Object tagsObj = summary.get("tags");
                if (tagsObj != null) {
                    Set<String> tags = null;
                    if (tagsObj instanceof Set) {
                        @SuppressWarnings("unchecked")
                        Set<String> tagsSet = (Set<String>) tagsObj;
                        tags = tagsSet;
                    } else if (tagsObj instanceof List) {
                        @SuppressWarnings("unchecked")
                        List<String> tagsList = (List<String>) tagsObj;
                        tags = new HashSet<>(tagsList);
                    }
                    if (tags != null && !tags.isEmpty()) {
                        for (String tag : tags) {
                            preference.getTagPreferences().merge(tag, summaryWeight, Double::sum);
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("Error processing tags for summary {}: {}", summaryId, e.getMessage());
            }
            
            // Update author preferences
            try {
                Object userIdObj = summary.get("userId");
                if (userIdObj != null) {
                    Long authorId = Long.valueOf(userIdObj.toString());
                    preference.getAuthorPreferences().merge(authorId, summaryWeight, Double::sum);
                }
            } catch (Exception e) {
                log.warn("Error processing author for summary {}: {}", summaryId, e.getMessage());
            }
        }
        
        // Normalize preferences
        if (totalWeight > 0) {
            final double finalTotalWeight = totalWeight; // Capture for lambda
            preference.getTagPreferences().replaceAll((k, v) -> v / finalTotalWeight);
            preference.getAuthorPreferences().replaceAll((k, v) -> v / finalTotalWeight);
        }
        
        preference.setTotalInteractions(behaviors.size());
        preference.setPreferenceScore(totalWeight);
        
        preferenceRepository.save(preference);
    }
    
    // Handle user feedback on recommendations
    @Transactional
    public void submitFeedback(FeedbackRequest request) {
        RecommendationFeedback.FeedbackType feedbackType;
        try {
            feedbackType = RecommendationFeedback.FeedbackType.valueOf(request.getFeedbackType());
        } catch (IllegalArgumentException e) {
            log.warn("Invalid feedback type: {}", request.getFeedbackType());
            return;
        }
        
        Optional<RecommendationFeedback> existing = feedbackRepository.findByUserIdAndSummaryId(
            request.getUserId(), request.getSummaryId());
        
        if (existing.isPresent()) {
            RecommendationFeedback feedback = existing.get();
            feedback.setFeedbackType(feedbackType);
            feedbackRepository.save(feedback);
        } else {
            RecommendationFeedback feedback = new RecommendationFeedback();
            feedback.setUserId(request.getUserId());
            feedback.setSummaryId(request.getSummaryId());
            feedback.setFeedbackType(feedbackType);
            feedbackRepository.save(feedback);
        }
        
        // If negative feedback, adjust preferences
        if (feedbackType.getImpact() < 0) {
            adjustPreferencesForNegativeFeedback(request.getUserId(), request.getSummaryId(), feedbackType);
        }
    }
    
    // Adjust preferences based on negative feedback
    private void adjustPreferencesForNegativeFeedback(
            Long userId, Long summaryId, RecommendationFeedback.FeedbackType feedbackType) {
        
        UserPreference preference = preferenceRepository.findByUserId(userId).orElse(null);
        if (preference == null) return;
        
        Map<String, Object> summary = fetchSummary(summaryId);
        if (summary == null) return;
        
        double impact = feedbackType.getImpact();
        
        // Reduce tag preferences - handle both List and Set safely
        try {
            Object tagsObj = summary.get("tags");
            if (tagsObj != null) {
                Set<String> tags = null;
                if (tagsObj instanceof Set) {
                    @SuppressWarnings("unchecked")
                    Set<String> tagsSet = (Set<String>) tagsObj;
                    tags = tagsSet;
                } else if (tagsObj instanceof List) {
                    @SuppressWarnings("unchecked")
                    List<String> tagsList = (List<String>) tagsObj;
                    tags = new HashSet<>(tagsList);
                }
                if (tags != null) {
                    for (String tag : tags) {
                        preference.getTagPreferences().merge(tag, impact * 0.1, (old, delta) -> Math.max(0.0, old + delta));
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Error adjusting tag preferences for negative feedback on summary {}: {}", summaryId, e.getMessage());
        }
        
        // Reduce author preference
        try {
            Long authorId = Long.valueOf(summary.get("userId").toString());
            preference.getAuthorPreferences().merge(authorId, impact * 0.15, (old, delta) -> Math.max(0.0, old + delta));
        } catch (Exception e) {
            log.warn("Error adjusting author preference for negative feedback on summary {}: {}", summaryId, e.getMessage());
        }
        
        preferenceRepository.save(preference);
    }
    
    // Helper methods
    private boolean hasNegativeFeedback(Long userId, Long summaryId) {
        return feedbackRepository.findByUserIdAndSummaryId(userId, summaryId)
            .map(f -> f.getFeedbackType().getImpact() < 0)
            .orElse(false);
    }
    
    private double calculateTimeDecay(LocalDateTime dateTime) {
        if (dateTime == null) return 1.0;
        long daysAgo = java.time.temporal.ChronoUnit.DAYS.between(dateTime, LocalDateTime.now());
        return Math.pow(decayFactor, daysAgo);
    }
    
    private String buildReason(double contentScore, double collaborativeScore, double timeDecay) {
        List<String> reasons = new ArrayList<>();
        if (contentScore > 0.5) reasons.add("matches your interests");
        if (collaborativeScore > 0.3) reasons.add("liked by similar users");
        if (timeDecay > 0.9) reasons.add("recent");
        return reasons.isEmpty() ? "trending" : String.join(", ", reasons);
    }
    
    private List<RecommendationDTO> getPopularRecommendations(int limit) {
        // Fetch trending summaries - try /top endpoint first, fallback to regular summaries
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(
                summaryServiceBaseUrl + "/api/summaries/top?page=0&size=" + limit, Map.class);
            Map<String, Object> data = response.getBody();
            if (data != null && data.containsKey("content")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> summaries = (List<Map<String, Object>>) data.get("content");
                if (summaries != null && !summaries.isEmpty()) {
                    return summaries.stream()
                        .map(s -> {
                            RecommendationScore score = new RecommendationScore(0.5, 0.0, 0.0, "trending");
                            return buildRecommendationDTO(s, score);
                        })
                        .collect(Collectors.toList());
                }
            }
        } catch (Exception e) {
            log.warn("Error fetching popular recommendations from /top endpoint, trying regular endpoint: {}", e.getMessage());
        }
        
        // Fallback to regular summaries sorted by vote count
        try {
            List<Map<String, Object>> allSummaries = fetchAllSummaries();
            if (!allSummaries.isEmpty()) {
                return allSummaries.stream()
                    .sorted((s1, s2) -> {
                        int v1 = (Integer) s1.getOrDefault("voteCount", 0);
                        int v2 = (Integer) s2.getOrDefault("voteCount", 0);
                        return Integer.compare(v2, v1); // Descending order
                    })
                    .limit(limit)
                    .map(s -> {
                        RecommendationScore score = new RecommendationScore(0.5, 0.0, 0.0, "trending");
                        return buildRecommendationDTO(s, score);
                    })
                    .collect(Collectors.toList());
            }
        } catch (Exception e) {
            log.error("Error fetching fallback popular recommendations", e);
        }
        return Collections.emptyList();
    }
    
    private List<Map<String, Object>> fetchAllSummaries() {
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(
                summaryServiceBaseUrl + "/api/summaries?page=0&size=1000", Map.class);
            Map<String, Object> data = response.getBody();
            if (data != null && data.containsKey("content")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> summaries = (List<Map<String, Object>>) data.get("content");
                return summaries != null ? summaries : Collections.emptyList();
            }
        } catch (Exception e) {
            log.error("Error fetching summaries", e);
        }
        return Collections.emptyList();
    }
    
    private Map<String, Object> fetchSummary(Long summaryId) {
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(
                summaryServiceBaseUrl + "/api/summaries/" + summaryId, Map.class);
            return response.getBody();
        } catch (Exception e) {
            log.error("Error fetching summary {}", summaryId, e);
            return null;
        }
    }
    
    private Map<String, Object> findSummaryById(List<Map<String, Object>> summaries, Long summaryId) {
        return summaries.stream()
            .filter(s -> Long.valueOf(s.get("id").toString()).equals(summaryId))
            .findFirst()
            .orElse(null);
    }
    
    private RecommendationDTO buildRecommendationDTO(Map<String, Object> summary, RecommendationScore score) {
        RecommendationDTO dto = new RecommendationDTO();
        dto.setSummaryId(Long.valueOf(summary.get("id").toString()));
        dto.setTitle((String) summary.get("title"));
        dto.setContent((String) summary.get("content"));
        dto.setOriginalUrl((String) summary.get("originalUrl"));
        dto.setUserId(Long.valueOf(summary.get("userId").toString()));
        dto.setScore(score.totalScore);
        dto.setReason(score.reason);
        
        // Handle tags - can be ArrayList or Set
        try {
            Object tagsObj = summary.get("tags");
            if (tagsObj != null) {
                if (tagsObj instanceof java.util.Set) {
                    @SuppressWarnings("unchecked")
                    Set<String> tags = (Set<String>) tagsObj;
                    dto.setTags(tags);
                } else if (tagsObj instanceof java.util.List) {
                    @SuppressWarnings("unchecked")
                    List<String> tagsList = (List<String>) tagsObj;
                    dto.setTags(new java.util.HashSet<>(tagsList));
                } else {
                    dto.setTags(new java.util.HashSet<>());
                }
            } else {
                dto.setTags(new java.util.HashSet<>());
            }
        } catch (Exception e) {
            log.warn("Error processing tags: {}", e.getMessage());
            dto.setTags(new java.util.HashSet<>());
        }
        
        dto.setVoteCount((Integer) summary.getOrDefault("voteCount", 0));
        dto.setCommentCount((Integer) summary.getOrDefault("commentCount", 0));
        dto.setCreatedAt(parseDateTime(summary.get("createdAt")));
        // Fetch username
        try {
            ResponseEntity<Map> userResponse = restTemplate.getForEntity(
                userServiceBaseUrl + "/api/users/" + dto.getUserId(), Map.class);
            Map<String, Object> user = userResponse.getBody();
            if (user != null) {
                dto.setUsername((String) user.get("username"));
            }
        } catch (Exception e) {
            log.warn("Could not fetch username for user {}", dto.getUserId());
        }
        return dto;
    }
    
    private LocalDateTime parseDateTime(Object dateTime) {
        if (dateTime == null) return LocalDateTime.now();
        if (dateTime instanceof String) {
            return LocalDateTime.parse(((String) dateTime).replace("Z", ""));
        }
        return LocalDateTime.now();
    }
    
    // Get user preferences
    public UserPreferenceDTO getUserPreferences(Long userId) {
        return preferenceRepository.findByUserId(userId)
            .map(p -> new UserPreferenceDTO(
                p.getUserId(),
                p.getTagPreferences(),
                p.getAuthorPreferences(),
                p.getPreferenceScore(),
                p.getTotalInteractions()
            ))
            .orElse(null);
    }
    
    // Inner class for recommendation scores
    private static class RecommendationScore {
        double totalScore;
        double contentScore;
        double collaborativeScore;
        String reason;
        
        RecommendationScore(double totalScore, double contentScore, double collaborativeScore, String reason) {
            this.totalScore = totalScore;
            this.contentScore = contentScore;
            this.collaborativeScore = collaborativeScore;
            this.reason = reason;
        }
    }
}

