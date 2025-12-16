package com.tldr.recommendation.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_behaviors", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "summary_id", "behavior_type"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserBehavior {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "summary_id", nullable = false)
    private Long summaryId;
    
    @Column(name = "behavior_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private BehaviorType behaviorType;
    
    @Column(name = "weight", nullable = false)
    private Double weight = 1.0; // Weight of this interaction (e.g., upvote = 2.0, view = 0.5)
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum BehaviorType {
        VIEW(0.5),
        UPVOTE(2.0),
        DOWNVOTE(-1.0),
        COMMENT(1.5),
        SAVE(1.8),
        SHARE(1.2);
        
        private final double defaultWeight;
        
        BehaviorType(double defaultWeight) {
            this.defaultWeight = defaultWeight;
        }
        
        public double getDefaultWeight() {
            return defaultWeight;
        }
    }
}

