package com.tldr.circle.dto;

import com.tldr.circle.model.Circle;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CircleDTO {
    private Long id;
    private String name;
    private Circle.CircleType type;
    private String description;
    private Long creatorId;
    private String countryCode;
    private Integer followerCount;
    private Integer postCount;
    private LocalDateTime createdAt;
    private Boolean isFollowing; // Whether current user is following
}

