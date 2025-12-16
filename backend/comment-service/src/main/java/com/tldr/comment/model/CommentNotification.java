package com.tldr.comment.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "comment_notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "recipient_user_id", nullable = false)
    private Long recipientUserId;

    @Column(name = "actor_user_id", nullable = false)
    private Long actorUserId;

    @Column(name = "comment_id")
    private Long commentId; // Nullable for badge notifications

    @Column(name = "summary_id")
    private Long summaryId; // Nullable for badge notifications

    @Column(nullable = false)
    private String type;

    @Column(nullable = false, length = 500)
    private String message;

    @Column(name = "is_read")
    private boolean read = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

