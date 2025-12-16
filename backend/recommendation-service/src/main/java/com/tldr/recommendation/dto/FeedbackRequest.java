package com.tldr.recommendation.dto;

import lombok.Data;

@Data
public class FeedbackRequest {
    private Long userId;
    private Long summaryId;
    private String feedbackType; // THUMBS_UP, THUMBS_DOWN, NOT_INTERESTED, HIDE
}

