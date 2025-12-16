package com.tldr.summary.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SummaryDTO {
    private Long id;
    private String title;
    private String content;
    private String originalUrl;
    private Long userId;
    private String username;
    private String userBadge;
    private Set<String> tags;
    private LocalDateTime createdAt;
    private Integer voteCount;
    private Integer commentCount;
}
