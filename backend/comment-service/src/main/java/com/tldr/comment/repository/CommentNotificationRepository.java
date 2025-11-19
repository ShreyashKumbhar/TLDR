package com.tldr.comment.repository;

import com.tldr.comment.model.CommentNotification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentNotificationRepository extends JpaRepository<CommentNotification, Long> {
    Page<CommentNotification> findByRecipientUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    void deleteByCommentId(Long commentId);
    long countByRecipientUserIdAndReadFalse(Long userId);
}

