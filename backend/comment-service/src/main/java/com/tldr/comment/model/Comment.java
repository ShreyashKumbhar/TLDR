package com.tldr.comment.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Comment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "summary_id", nullable = false)
    private Long summaryId;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(nullable = false, length = 500)
    private String content;
    
    @Column(name = "parent_id")
    private Long parentId; // For nested comments

    @Column(name = "likes_count")
    private Integer likesCount = 0;

    @Column(name = "reported")
    private boolean reported = false;

    @Column(name = "hidden")
    private boolean hidden = false;

    @Column(name = "moderated_by")
    private Long moderatedBy;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        if (likesCount == null) {
            likesCount = 0;
        }
        if (reported == false) {
            reported = false;
        }
        if (hidden == false) {
            hidden = false;
        }
        createdAt = LocalDateTime.now();
    }
}
