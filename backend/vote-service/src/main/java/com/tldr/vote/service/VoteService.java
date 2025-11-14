package com.tldr.vote.service;

import com.tldr.vote.dto.VoteDTO;
import com.tldr.vote.model.Vote;
import com.tldr.vote.repository.VoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class VoteService {

    private final VoteRepository voteRepository;
    private final RestTemplate restTemplate;

    @Value("${services.summary.base-url:http://summary-service:8082}")
    private String summaryServiceBaseUrl;

    @Transactional
    public VoteDTO castVote(Vote vote) {
        // Check if user already voted
        var existingVote = voteRepository.findByUserIdAndSummaryId(vote.getUserId(), vote.getSummaryId());
        
        if (existingVote.isPresent()) {
            // Update existing vote
            Vote existing = existingVote.get();
            int previousValue = existing.getValue();
            existing.setValue(vote.getValue());
            VoteDTO dto = convertToDTO(voteRepository.save(existing));
            int change = vote.getValue() - previousValue;
            if (change != 0) {
                updateSummaryVoteCount(vote.getSummaryId(), change);
            }
            return dto;
        } else {
            // Create new vote
            VoteDTO dto = convertToDTO(voteRepository.save(vote));
            updateSummaryVoteCount(vote.getSummaryId(), vote.getValue());
            return dto;
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
        voteRepository.findByUserIdAndSummaryId(userId, summaryId).ifPresent(existing -> {
            voteRepository.delete(existing);
            updateSummaryVoteCount(summaryId, -existing.getValue());
        });
    }
    
    private VoteDTO convertToDTO(Vote vote) {
        return new VoteDTO(
            vote.getId(),
            vote.getUserId(),
            vote.getSummaryId(),
            vote.getValue()
        );
    }

    private void updateSummaryVoteCount(Long summaryId, int change) {
        String url = String.format("%s/api/summaries/%d/votes?change=%d", summaryServiceBaseUrl, summaryId, change);
        try {
            ResponseEntity<Void> response = restTemplate.exchange(url, HttpMethod.PUT, null, Void.class);
            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new IllegalStateException("Failed to update summary vote count");
            }
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to update summary vote count", ex);
        }
    }
}
