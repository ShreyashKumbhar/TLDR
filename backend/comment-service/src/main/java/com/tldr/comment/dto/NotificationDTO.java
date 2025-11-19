package com.tldr.comment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long id;
    private Long recipientUserId;
    private Long actorUserId;
    private String actorUsername;
    private Long commentId;
    private Long summaryId;
    private String type;
    private String message;
    private boolean read;
    private LocalDateTime createdAt;
}

