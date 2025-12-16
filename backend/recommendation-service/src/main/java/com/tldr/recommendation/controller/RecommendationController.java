package com.tldr.recommendation.controller;

import com.tldr.recommendation.dto.FeedbackRequest;
import com.tldr.recommendation.dto.RecommendationDTO;
import com.tldr.recommendation.dto.UserPreferenceDTO;
import com.tldr.recommendation.model.UserBehavior;
import com.tldr.recommendation.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class RecommendationController {
    
    private final RecommendationService recommendationService;
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<RecommendationDTO>> getRecommendations(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "20") int limit) {
        List<RecommendationDTO> recommendations = recommendationService.getRecommendations(userId, limit);
        return ResponseEntity.ok(recommendations);
    }
    
    @PostMapping("/track")
    public ResponseEntity<Void> trackBehavior(
            @RequestParam Long userId,
            @RequestParam Long summaryId,
            @RequestParam String behaviorType) {
        try {
            UserBehavior.BehaviorType type = UserBehavior.BehaviorType.valueOf(behaviorType.toUpperCase());
            recommendationService.trackBehavior(userId, summaryId, type);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/feedback")
    public ResponseEntity<Void> submitFeedback(@RequestBody FeedbackRequest request) {
        recommendationService.submitFeedback(request);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/preferences/{userId}")
    public ResponseEntity<UserPreferenceDTO> getUserPreferences(@PathVariable Long userId) {
        UserPreferenceDTO preferences = recommendationService.getUserPreferences(userId);
        return preferences != null 
            ? ResponseEntity.ok(preferences)
            : ResponseEntity.notFound().build();
    }
    
    @PostMapping("/preferences/{userId}/update")
    public ResponseEntity<Void> updatePreferences(@PathVariable Long userId) {
        recommendationService.updateUserPreferences(userId);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/track")
    public ResponseEntity<Void> removeVoteBehaviors(
            @RequestParam Long userId,
            @RequestParam Long summaryId) {
        recommendationService.removeVoteBehaviors(userId, summaryId);
        return ResponseEntity.ok().build();
    }
}

