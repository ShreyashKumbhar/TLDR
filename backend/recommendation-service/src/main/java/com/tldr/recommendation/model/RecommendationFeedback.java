package com.tldr.recommendation.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "recommendation_feedback",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "summary_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationFeedback {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "summary_id", nullable = false)
    private Long summaryId;
    
    @Column(name = "feedback_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private FeedbackType feedbackType;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    public enum FeedbackType {
        THUMBS_UP(1.0),
        THUMBS_DOWN(-1.0),
        NOT_INTERESTED(-2.0),
        HIDE(-3.0);
        
        private final double impact;
        
        FeedbackType(double impact) {
            this.impact = impact;
        }
        
        public double getImpact() {
            return impact;
        }
    }
}

