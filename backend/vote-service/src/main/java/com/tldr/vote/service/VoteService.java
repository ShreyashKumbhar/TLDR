package com.tldr.vote.service;

import com.tldr.vote.dto.VoteDTO;
import com.tldr.vote.model.Vote;
import com.tldr.vote.repository.VoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VoteService {
    
    @Autowired
    private VoteRepository voteRepository;
    
    @Transactional
    public VoteDTO castVote(Vote vote) {
        // Check if user already voted
        var existingVote = voteRepository.findByUserIdAndSummaryId(vote.getUserId(), vote.getSummaryId());
        
        if (existingVote.isPresent()) {
            // Update existing vote
            Vote existing = existingVote.get();
            existing.setValue(vote.getValue());
            return convertToDTO(voteRepository.save(existing));
        } else {
            // Create new vote
            return convertToDTO(voteRepository.save(vote));
        }
    }
    
    public VoteDTO getVote(Long userId, Long summaryId) {
        return voteRepository.findByUserIdAndSummaryId(userId, summaryId)
                .map(this::convertToDTO)
                .orElse(null);
    }
    
    public Integer getVoteCount(Long summaryId) {
        Integer count = voteRepository.sumVotesBySummaryId(summaryId);
        return count != null ? count : 0;
    }
    
    @Transactional
    public void removeVote(Long userId, Long summaryId) {
        voteRepository.deleteByUserIdAndSummaryId(userId, summaryId);
    }
    
    private VoteDTO convertToDTO(Vote vote) {
        return new VoteDTO(
            vote.getId(),
            vote.getUserId(),
            vote.getSummaryId(),
            vote.getValue()
        );
    }
}
