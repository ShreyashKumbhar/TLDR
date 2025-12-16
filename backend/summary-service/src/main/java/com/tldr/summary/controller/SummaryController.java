package com.tldr.summary.controller;

import com.tldr.summary.dto.SummaryDTO;
import com.tldr.summary.model.Summary;
import com.tldr.summary.service.SummaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/summaries")
@CrossOrigin(origins = "*")
public class SummaryController {
    
    @Autowired
    private SummaryService summaryService;
    
    @PostMapping
    public ResponseEntity<?> createSummary(@RequestBody Summary summary) {
        try {
            SummaryDTO createdSummary = summaryService.createSummary(summary);
            return new ResponseEntity<>(createdSummary, HttpStatus.CREATED);
        } catch (IllegalArgumentException ex) {
            // User doesn't exist - return a clear error message
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", ex.getMessage(), 
                                 "message", "Your user account may have been lost. Please log out and log in again."));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<SummaryDTO> getSummaryById(@PathVariable Long id) {
        SummaryDTO summary = summaryService.getSummaryById(id);
        return summary != null ? ResponseEntity.ok(summary) : ResponseEntity.notFound().build();
    }
    
    @GetMapping
    public ResponseEntity<Page<SummaryDTO>> getAllSummaries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(summaryService.getAllSummaries(page, size));
    }
    
    @GetMapping("/top")
    public ResponseEntity<Page<SummaryDTO>> getTopSummaries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(summaryService.getTopSummaries(page, size));
    }
    
    @GetMapping("/tags")
    public ResponseEntity<Page<SummaryDTO>> getSummariesByTags(
            @RequestParam List<String> tags,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(summaryService.getSummariesByTags(tags, page, size));
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<SummaryDTO>> getSummariesByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(summaryService.getSummariesByUser(userId, page, size));
    }
    
    @GetMapping("/trending")
    public ResponseEntity<List<SummaryDTO>> getTrendingDigest() {
        return ResponseEntity.ok(summaryService.getTrendingDigest());
    }
    
    @PutMapping("/{id}/votes")
    public ResponseEntity<SummaryDTO> updateVoteCount(@PathVariable Long id, @RequestParam Integer change) {
        SummaryDTO summary = summaryService.updateVoteCount(id, change);
        return summary != null ? ResponseEntity.ok(summary) : ResponseEntity.notFound().build();
    }
    
    @PutMapping("/{id}/comments")
    public ResponseEntity<SummaryDTO> updateCommentCount(@PathVariable Long id, @RequestParam Integer change) {
        SummaryDTO summary = summaryService.updateCommentCount(id, change);
        return summary != null ? ResponseEntity.ok(summary) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSummary(@PathVariable Long id, @RequestParam Long userId) {
        boolean deleted = summaryService.deleteSummary(id, userId);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }
}
