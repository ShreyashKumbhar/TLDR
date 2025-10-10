package com.tldr.saved.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SavedSummaryDTO {
    private Long id;
    private Long userId;
    private Long summaryId;
    private LocalDateTime savedAt;
}
