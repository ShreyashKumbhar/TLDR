package com.tldr.comment.repository;

import com.tldr.comment.model.CommentReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CommentReportRepository extends JpaRepository<CommentReport, Long> {
    boolean existsByCommentIdAndReporterId(Long commentId, Long reporterId);
    Optional<CommentReport> findByCommentIdAndReporterId(Long commentId, Long reporterId);
    void deleteByCommentId(Long commentId);
}

