package com.tldr.comment.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentDTO {
    private Long id;
    private Long summaryId;
    private Long userId;
    private String username;
    private String content;
    private Long parentId;
    private LocalDateTime createdAt;
    private Integer likesCount;
    private boolean reported;
    private boolean hidden;
    private boolean likedByViewer;
    private List<CommentDTO> replies;
}
