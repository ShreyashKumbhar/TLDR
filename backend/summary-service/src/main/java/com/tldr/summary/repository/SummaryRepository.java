package com.tldr.summary.repository;

import com.tldr.summary.model.Summary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SummaryRepository extends JpaRepository<Summary, Long> {
    Page<Summary> findByOrderByCreatedAtDesc(Pageable pageable);
    Page<Summary> findByOrderByVoteCountDesc(Pageable pageable);
    
    @Query("SELECT s FROM Summary s JOIN s.tags t WHERE t IN :tags")
    Page<Summary> findByTagsIn(List<String> tags, Pageable pageable);
    
    Page<Summary> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    @Query("SELECT s FROM Summary s WHERE s.createdAt >= :since ORDER BY s.voteCount DESC")
    List<Summary> findTrendingSince(LocalDateTime since, Pageable pageable);
    
    @Query("SELECT s FROM Summary s JOIN s.circleIds c WHERE c = :circleId")
    Page<Summary> findByCircleId(Long circleId, Pageable pageable);
    
    @Query("SELECT DISTINCT s FROM Summary s LEFT JOIN s.tags t WHERE " +
           "LOWER(s.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.content) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Summary> searchSummaries(@Param("query") String query, Pageable pageable);
}
