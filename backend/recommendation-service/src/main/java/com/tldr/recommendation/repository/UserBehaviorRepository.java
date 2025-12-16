package com.tldr.recommendation.repository;

import com.tldr.recommendation.model.UserBehavior;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserBehaviorRepository extends JpaRepository<UserBehavior, Long> {
    
    Optional<UserBehavior> findByUserIdAndSummaryIdAndBehaviorType(
        Long userId, Long summaryId, UserBehavior.BehaviorType behaviorType);
    
    List<UserBehavior> findByUserId(Long userId);
    
    List<UserBehavior> findBySummaryId(Long summaryId);
    
    @Query("SELECT ub.summaryId, SUM(ub.weight) as totalWeight " +
           "FROM UserBehavior ub WHERE ub.userId = :userId " +
           "GROUP BY ub.summaryId ORDER BY totalWeight DESC")
    List<Object[]> findSummaryWeightsByUserId(Long userId);
    
    long countByUserId(Long userId);
    
    void deleteByUserIdAndSummaryId(Long userId, Long summaryId);
}

