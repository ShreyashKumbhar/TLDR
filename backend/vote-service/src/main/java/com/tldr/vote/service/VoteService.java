package com.tldr.vote.service;

import com.tldr.vote.dto.SummaryDTO;
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

    @Value("${services.user.base-url:http://user-service:8081}")
    private String userServiceBaseUrl;

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
                int deltaUpvotes = (vote.getValue() == 1 ? 1 : 0) - (previousValue == 1 ? 1 : 0);
                if (deltaUpvotes != 0) {
                    updateSummaryAuthorUpvotes(vote.getSummaryId(), deltaUpvotes);
                }
            }
            return dto;
        } else {
            // Create new vote
            VoteDTO dto = convertToDTO(voteRepository.save(vote));
            updateSummaryVoteCount(vote.getSummaryId(), vote.getValue());
            int deltaUpvotes = vote.getValue() == 1 ? 1 : 0;
            if (deltaUpvotes != 0) {
                updateSummaryAuthorUpvotes(vote.getSummaryId(), deltaUpvotes);
            }
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
            int deltaUpvotes = existing.getValue() == 1 ? -1 : 0;
            if (deltaUpvotes != 0) {
                updateSummaryAuthorUpvotes(summaryId, deltaUpvotes);
            }
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

    private void updateSummaryAuthorUpvotes(Long summaryId, int change) {
        try {
            // First get the summary to find the author's userId
            String summaryUrl = String.format("%s/api/summaries/%d", summaryServiceBaseUrl, summaryId);
            ResponseEntity<SummaryDTO> summaryResponse = restTemplate.getForEntity(summaryUrl, SummaryDTO.class);
            
            if (summaryResponse.getStatusCode().is2xxSuccessful() && summaryResponse.getBody() != null) {
                Long authorUserId = summaryResponse.getBody().getUserId();
                if (authorUserId != null) {
                    updateUserUpvotes(authorUserId, change);
                }
            }
        } catch (Exception ex) {
            // Log but don't fail the vote operation if upvote tracking fails
            System.err.println("Failed to update summary author upvotes: " + ex.getMessage());
        }
    }

    private void updateUserUpvotes(Long userId, int change) {
        String url = String.format("%s/api/users/%d/upvotes?change=%d", userServiceBaseUrl, userId, change);
        try {
            ResponseEntity<Void> response = restTemplate.exchange(url, HttpMethod.PUT, null, Void.class);
            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new IllegalStateException("Failed to update user upvotes");
            }
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to update user upvotes", ex);
        }
    }
}
