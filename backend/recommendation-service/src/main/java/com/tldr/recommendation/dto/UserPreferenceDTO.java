package com.tldr.recommendation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserPreferenceDTO {
    private Long userId;
    private Map<String, Double> tagPreferences;
    private Map<Long, Double> authorPreferences;
    private Double preferenceScore;
    private Integer totalInteractions;
}

