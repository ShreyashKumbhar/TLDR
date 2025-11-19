package com.tldr.comment.controller;

import com.tldr.comment.dto.CommentDTO;
import com.tldr.comment.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CommentController {
    
    private final CommentService commentService;
    
    @PostMapping
    public ResponseEntity<CommentDTO> createComment(@RequestBody com.tldr.comment.model.Comment comment) {
        CommentDTO createdComment = commentService.createComment(comment);
        return new ResponseEntity<>(createdComment, HttpStatus.CREATED);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CommentDTO> getCommentById(@PathVariable Long id) {
        CommentDTO comment = commentService.getCommentById(id);
        return comment != null ? ResponseEntity.ok(comment) : ResponseEntity.notFound().build();
    }
    
    @GetMapping("/summary/{summaryId}")
    public ResponseEntity<Page<CommentDTO>> getCommentsBySummary(
            @PathVariable Long summaryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long viewerId) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(commentService.getCommentsBySummary(summaryId, viewerId, pageable));
    }
    
    @GetMapping("/count/{summaryId}")
    public ResponseEntity<Long> getCommentCount(@PathVariable Long summaryId) {
        return ResponseEntity.ok(commentService.getCommentCount(summaryId));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id, @RequestParam Long userId) {
        boolean deleted = commentService.deleteComment(id, userId);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @PostMapping("/{id}/likes")
    public ResponseEntity<CommentDTO> likeComment(@PathVariable Long id, @RequestParam Long userId) {
        return ResponseEntity.ok(commentService.likeComment(id, userId));
    }

    @DeleteMapping("/{id}/likes")
    public ResponseEntity<CommentDTO> unlikeComment(@PathVariable Long id, @RequestParam Long userId) {
        return ResponseEntity.ok(commentService.unlikeComment(id, userId));
    }

    @PostMapping("/{id}/report")
    public ResponseEntity<Void> reportComment(@PathVariable Long id, @RequestParam Long userId, @RequestParam String reason) {
        commentService.reportComment(id, userId, reason);
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/{id}/moderate/hide")
    public ResponseEntity<CommentDTO> hideComment(@PathVariable Long id, @RequestParam Long userId) {
        return ResponseEntity.ok(commentService.hideComment(id, userId));
    }

    @PostMapping("/{id}/moderate/restore")
    public ResponseEntity<CommentDTO> restoreComment(@PathVariable Long id, @RequestParam Long userId) {
        return ResponseEntity.ok(commentService.restoreComment(id, userId));
    }
}
