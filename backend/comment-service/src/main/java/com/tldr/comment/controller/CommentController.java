package com.tldr.comment.controller;

import com.tldr.comment.dto.CommentDTO;
import com.tldr.comment.model.Comment;
import com.tldr.comment.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "*")
public class CommentController {
    
    @Autowired
    private CommentService commentService;
    
    @PostMapping
    public ResponseEntity<CommentDTO> createComment(@RequestBody Comment comment) {
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
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(commentService.getCommentsBySummary(summaryId, pageable));
    }
    
    @GetMapping("/count/{summaryId}")
    public ResponseEntity<Long> getCommentCount(@PathVariable Long summaryId) {
        return ResponseEntity.ok(commentService.getCommentCount(summaryId));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        commentService.deleteComment(id);
        return ResponseEntity.noContent().build();
    }
}
