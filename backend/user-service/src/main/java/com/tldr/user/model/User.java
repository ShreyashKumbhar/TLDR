package com.tldr.user.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 40)
    private String username;
    
    @Column(nullable = false, unique = true, length = 120)
    private String email;
    
    @Column(nullable = false, length = 100)
    private String password;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    private Integer karma = 0;

    @Column(name = "total_upvotes")
    private Integer totalUpvotes = 0;

    private String badge = "NEWBIE";

    @Column(nullable = false)
    private String role = "USER";
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
