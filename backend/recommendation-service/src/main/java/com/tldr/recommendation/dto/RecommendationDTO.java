package com.tldr.recommendation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationDTO {
    private Long summaryId;
    private String title;
    private String content;
    private String originalUrl;
    private Long userId;
    private String username;
    private Double score; // Recommendation score (0.0 to 1.0)
    private String reason; // Why this was recommended
    private java.util.Set<String> tags;
    private Integer voteCount;
    private Integer commentCount;
    private java.time.LocalDateTime createdAt;
}

