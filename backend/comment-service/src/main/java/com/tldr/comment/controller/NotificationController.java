package com.tldr.comment.controller;

import com.tldr.comment.dto.NotificationDTO;
import com.tldr.comment.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class NotificationController {

    private final CommentService commentService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<NotificationDTO>> getNotificationsForUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(commentService.getNotificationsForUser(userId, pageable));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markNotificationRead(@PathVariable Long id, @RequestParam Long userId) {
        commentService.markNotificationRead(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/user/{userId}/read-all")
    public ResponseEntity<Void> markAllRead(@PathVariable Long userId) {
        commentService.markAllNotificationsRead(userId);
        return ResponseEntity.noContent().build();
    }
}
