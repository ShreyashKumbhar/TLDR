package com.tldr.saved.service;

import com.tldr.saved.dto.SavedSummaryDTO;
import com.tldr.saved.model.SavedSummary;
import com.tldr.saved.repository.SavedSummaryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SavedSummaryService {
    
    @Autowired
    private SavedSummaryRepository savedSummaryRepository;
    
    public SavedSummaryDTO saveSummary(SavedSummary savedSummary) {
        if (!savedSummaryRepository.existsByUserIdAndSummaryId(
                savedSummary.getUserId(), savedSummary.getSummaryId())) {
            SavedSummary saved = savedSummaryRepository.save(savedSummary);
            return convertToDTO(saved);
        }
        return null;
    }
    
    public Page<SavedSummaryDTO> getSavedSummariesByUser(Long userId, Pageable pageable) {
        return savedSummaryRepository.findByUserIdOrderBySavedAtDesc(userId, pageable)
                .map(this::convertToDTO);
    }
    
    public boolean isSaved(Long userId, Long summaryId) {
        return savedSummaryRepository.existsByUserIdAndSummaryId(userId, summaryId);
    }
    
    @Transactional
    public void unsaveSummary(Long userId, Long summaryId) {
        savedSummaryRepository.deleteByUserIdAndSummaryId(userId, summaryId);
    }
    
    private SavedSummaryDTO convertToDTO(SavedSummary savedSummary) {
        return new SavedSummaryDTO(
            savedSummary.getId(),
            savedSummary.getUserId(),
            savedSummary.getSummaryId(),
            savedSummary.getSavedAt()
        );
    }
}
