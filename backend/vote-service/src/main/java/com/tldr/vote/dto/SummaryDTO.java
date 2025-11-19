package com.tldr.vote.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SummaryDTO {
    private Long id;
    private String title;
    private String content;
    private String originalUrl;
    private Long userId;
    private Integer voteCount;
    private Integer commentCount;
}
