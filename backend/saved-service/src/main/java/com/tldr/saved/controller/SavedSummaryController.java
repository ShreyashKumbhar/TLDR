package com.tldr.saved.controller;

import com.tldr.saved.dto.SavedSummaryDTO;
import com.tldr.saved.model.SavedSummary;
import com.tldr.saved.service.SavedSummaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/saved")
@CrossOrigin(origins = "*")
public class SavedSummaryController {
    
    @Autowired
    private SavedSummaryService savedSummaryService;
    
    @PostMapping
    public ResponseEntity<SavedSummaryDTO> saveSummary(@RequestBody SavedSummary savedSummary) {
        SavedSummaryDTO saved = savedSummaryService.saveSummary(savedSummary);
        return saved != null 
            ? new ResponseEntity<>(saved, HttpStatus.CREATED)
            : new ResponseEntity<>(HttpStatus.CONFLICT);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<SavedSummaryDTO>> getSavedSummariesByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(savedSummaryService.getSavedSummariesByUser(userId, pageable));
    }
    
    @GetMapping("/check")
    public ResponseEntity<Boolean> isSaved(@RequestParam Long userId, @RequestParam Long summaryId) {
        return ResponseEntity.ok(savedSummaryService.isSaved(userId, summaryId));
    }
    
    @DeleteMapping
    public ResponseEntity<Void> unsaveSummary(@RequestParam Long userId, @RequestParam Long summaryId) {
        savedSummaryService.unsaveSummary(userId, summaryId);
        return ResponseEntity.noContent().build();
    }
}
