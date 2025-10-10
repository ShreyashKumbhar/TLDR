package com.tldr.vote.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VoteDTO {
    private Long id;
    private Long userId;
    private Long summaryId;
    private Integer value;
}
