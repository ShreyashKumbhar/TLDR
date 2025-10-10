package com.tldr.vote.repository;

import com.tldr.vote.model.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {
    Optional<Vote> findByUserIdAndSummaryId(Long userId, Long summaryId);
    
    @Query("SELECT SUM(v.value) FROM Vote v WHERE v.summaryId = :summaryId")
    Integer sumVotesBySummaryId(Long summaryId);
    
    void deleteByUserIdAndSummaryId(Long userId, Long summaryId);
}
