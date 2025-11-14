package com.tldr.summary.service;

import com.tldr.summary.dto.SummaryDTO;
import com.tldr.summary.model.Summary;
import com.tldr.summary.repository.SummaryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SummaryService {
    
    @Autowired
    private SummaryRepository summaryRepository;
    
    public SummaryDTO createSummary(Summary summary) {
        Summary savedSummary = summaryRepository.save(summary);
        return convertToDTO(savedSummary);
    }
    
    public SummaryDTO getSummaryById(Long id) {
        return summaryRepository.findById(id)
                .map(this::convertToDTO)
                .orElse(null);
    }
    
    public Page<SummaryDTO> getAllSummaries(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return summaryRepository.findByOrderByCreatedAtDesc(pageable)
                .map(this::convertToDTO);
    }
    
    public Page<SummaryDTO> getTopSummaries(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return summaryRepository.findByOrderByVoteCountDesc(pageable)
                .map(this::convertToDTO);
    }
    
    public Page<SummaryDTO> getSummariesByTags(List<String> tags, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return summaryRepository.findByTagsIn(tags, pageable)
                .map(this::convertToDTO);
    }
    
    public Page<SummaryDTO> getSummariesByUser(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return summaryRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::convertToDTO);
    }
    
    public List<SummaryDTO> getTrendingDigest() {
        LocalDateTime yesterday = LocalDateTime.now().minusDays(1);
        Pageable pageable = PageRequest.of(0, 10);
        return summaryRepository.findTrendingSince(yesterday, pageable).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public SummaryDTO updateVoteCount(Long id, Integer change) {
        return summaryRepository.findById(id)
                .map(summary -> {
                    summary.setVoteCount(summary.getVoteCount() + change);
                    return convertToDTO(summaryRepository.save(summary));
                })
                .orElse(null);
    }
    
    public SummaryDTO updateCommentCount(Long id, Integer change) {
        return summaryRepository.findById(id)
                .map(summary -> {
                    summary.setCommentCount(summary.getCommentCount() + change);
                    return convertToDTO(summaryRepository.save(summary));
                })
                .orElse(null);
    }

    @Transactional
    public boolean deleteSummary(Long id, Long userId) {
        return summaryRepository.findById(id)
                .filter(summary -> summary.getUserId().equals(userId))
                .map(summary -> {
                    summaryRepository.delete(summary);
                    return true;
                })
                .orElse(false);
    }
    
    private SummaryDTO convertToDTO(Summary summary) {
        return new SummaryDTO(
            summary.getId(),
            summary.getTitle(),
            summary.getContent(),
            summary.getOriginalUrl(),
            summary.getUserId(),
            summary.getTags(),
            summary.getCreatedAt(),
            summary.getVoteCount(),
            summary.getCommentCount()
        );
    }
}
