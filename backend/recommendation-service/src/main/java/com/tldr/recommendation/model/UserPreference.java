package com.tldr.recommendation.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "user_preferences")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserPreference {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;
    
    // Tag preferences: tag -> score (0.0 to 1.0)
    @ElementCollection
    @CollectionTable(name = "user_tag_preferences", joinColumns = @JoinColumn(name = "user_id"))
    @MapKeyColumn(name = "tag")
    @Column(name = "score")
    private Map<String, Double> tagPreferences = new HashMap<>();
    
    // Author preferences: authorUserId -> score
    @ElementCollection
    @CollectionTable(name = "user_author_preferences", joinColumns = @JoinColumn(name = "user_id"))
    @MapKeyColumn(name = "author_user_id")
    @Column(name = "score")
    private Map<Long, Double> authorPreferences = new HashMap<>();
    
    // Circle preferences: circleId -> score
    @ElementCollection
    @CollectionTable(name = "user_circle_preferences", joinColumns = @JoinColumn(name = "user_id"))
    @MapKeyColumn(name = "circle_id")
    @Column(name = "score")
    private Map<Long, Double> circlePreferences = new HashMap<>();
    
    // Overall preference score (normalized)
    @Column(name = "preference_score")
    private Double preferenceScore = 0.0;
    
    @Column(name = "total_interactions")
    private Integer totalInteractions = 0;
    
    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;
    
    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        lastUpdated = LocalDateTime.now();
    }
}

