package com.tldr.circle.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "circles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Circle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private CircleType type;

    @Column(length = 500)
    private String description;

    @Column(name = "creator_id")
    private Long creatorId; // null for GLOBAL and COUNTRY, set for LOCAL

    @Column(name = "country_code", length = 2)
    private String countryCode; // ISO 3166-1 alpha-2 code for COUNTRY type

    @Column(name = "follower_count")
    private Integer followerCount = 0;

    @Column(name = "post_count")
    private Integer postCount = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum CircleType {
        GLOBAL,    // Global circle (everyone sees this)
        COUNTRY,   // Country-specific circle
        LOCAL      // User-created local circle
    }
}

