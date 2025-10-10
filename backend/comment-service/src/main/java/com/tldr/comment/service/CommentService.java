package com.tldr.comment.service;

import com.tldr.comment.dto.CommentDTO;
import com.tldr.comment.model.Comment;
import com.tldr.comment.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {
    
    @Autowired
    private CommentRepository commentRepository;
    
    public CommentDTO createComment(Comment comment) {
        Comment savedComment = commentRepository.save(comment);
        return convertToDTO(savedComment);
    }
    
    public CommentDTO getCommentById(Long id) {
        return commentRepository.findById(id)
                .map(this::convertToDTO)
                .orElse(null);
    }
    
    public Page<CommentDTO> getCommentsBySummary(Long summaryId, Pageable pageable) {
        return commentRepository.findBySummaryIdAndParentIdIsNullOrderByCreatedAtDesc(summaryId, pageable)
                .map(this::convertToDTOWithReplies);
    }
    
    public Long getCommentCount(Long summaryId) {
        return commentRepository.countBySummaryId(summaryId);
    }
    
    public void deleteComment(Long id) {
        commentRepository.deleteById(id);
    }
    
    private CommentDTO convertToDTO(Comment comment) {
        return new CommentDTO(
            comment.getId(),
            comment.getSummaryId(),
            comment.getUserId(),
            comment.getContent(),
            comment.getParentId(),
            comment.getCreatedAt(),
            null
        );
    }
    
    private CommentDTO convertToDTOWithReplies(Comment comment) {
        List<CommentDTO> replies = commentRepository.findByParentIdOrderByCreatedAtAsc(comment.getId())
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return new CommentDTO(
            comment.getId(),
            comment.getSummaryId(),
            comment.getUserId(),
            comment.getContent(),
            comment.getParentId(),
            comment.getCreatedAt(),
            replies
        );
    }
}
