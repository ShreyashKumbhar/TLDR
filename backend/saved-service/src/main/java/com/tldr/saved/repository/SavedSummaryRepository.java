package com.tldr.saved.repository;

import com.tldr.saved.model.SavedSummary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SavedSummaryRepository extends JpaRepository<SavedSummary, Long> {
    Page<SavedSummary> findByUserIdOrderBySavedAtDesc(Long userId, Pageable pageable);
    Optional<SavedSummary> findByUserIdAndSummaryId(Long userId, Long summaryId);
    boolean existsByUserIdAndSummaryId(Long userId, Long summaryId);
    void deleteByUserIdAndSummaryId(Long userId, Long summaryId);
}
