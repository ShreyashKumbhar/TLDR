package com.tldr.saved.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "saved_summaries", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "summary_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SavedSummary {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "summary_id", nullable = false)
    private Long summaryId;
    
    @Column(name = "saved_at")
    private LocalDateTime savedAt;
    
    @PrePersist
    protected void onCreate() {
        savedAt = LocalDateTime.now();
    }
}
