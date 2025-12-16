package com.tldr.recommendation.repository;

import com.tldr.recommendation.model.RecommendationFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecommendationFeedbackRepository extends JpaRepository<RecommendationFeedback, Long> {
    
    Optional<RecommendationFeedback> findByUserIdAndSummaryId(Long userId, Long summaryId);
    
    List<RecommendationFeedback> findByUserId(Long userId);
    
    List<RecommendationFeedback> findByUserIdAndFeedbackType(Long userId, RecommendationFeedback.FeedbackType feedbackType);
}

