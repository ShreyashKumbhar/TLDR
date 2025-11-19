package com.tldr.comment.service;

import com.tldr.comment.dto.CommentDTO;
import com.tldr.comment.dto.NotificationDTO;
import com.tldr.comment.model.Comment;
import com.tldr.comment.model.CommentLike;
import com.tldr.comment.model.CommentNotification;
import com.tldr.comment.model.CommentReport;
import com.tldr.comment.repository.CommentLikeRepository;
import com.tldr.comment.repository.CommentNotificationRepository;
import com.tldr.comment.repository.CommentReportRepository;
import com.tldr.comment.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommentService {

    private final CommentRepository commentRepository;
    private final CommentLikeRepository commentLikeRepository;
    private final CommentNotificationRepository commentNotificationRepository;
    private final CommentReportRepository commentReportRepository;
    private final RestTemplate restTemplate;

    @Value("${services.user.base-url:http://user-service:8081}")
    private String userServiceBaseUrl;

    @Value("${services.summary.base-url:http://summary-service:8082}")
    private String summaryServiceBaseUrl;

    private final Map<Long, UserProfile> userCache = new ConcurrentHashMap<>();

    @Transactional
    public CommentDTO createComment(Comment comment) {
        comment.setLikesCount(0);
        comment.setReported(false);
        comment.setHidden(false);
        Comment savedComment = commentRepository.save(comment);
        updateSummaryCommentCount(savedComment.getSummaryId(), 1);
        if (savedComment.getParentId() != null) {
            notifyCommentReply(savedComment);
        }
        return convertToDTO(savedComment, null);
    }

    public CommentDTO getCommentById(Long id) {
        return commentRepository.findById(id)
                .map(comment -> convertToDTO(comment, null))
                .orElse(null);
    }

    public Page<CommentDTO> getCommentsBySummary(Long summaryId, Long viewerId, Pageable pageable) {
        return commentRepository.findBySummaryIdAndParentIdIsNullOrderByCreatedAtDesc(summaryId, pageable)
                .map(comment -> convertToDTO(comment, viewerId));
    }

    public Long getCommentCount(Long summaryId) {
        return commentRepository.countBySummaryId(summaryId);
    }

    @Transactional
    public boolean deleteComment(Long id, Long userId) {
        return commentRepository.findById(id)
                .map(comment -> {
                    boolean isOwner = comment.getUserId().equals(userId);
                    boolean isModerator = isModerator(userId);
                    if (!isOwner && !isModerator) {
                        return false;
                    }
                    int removed = deleteCommentRecursive(comment);
                    updateSummaryCommentCount(comment.getSummaryId(), -removed);
                    return true;
                })
                .orElse(false);
    }

    @Transactional
    public CommentDTO likeComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));

        if (commentLikeRepository.existsByCommentIdAndUserId(commentId, userId)) {
            return convertToDTO(comment, userId);
        }

        commentLikeRepository.save(new CommentLike(null, commentId, userId, null));
        comment.setLikesCount(comment.getLikesCount() + 1);
        Comment saved = commentRepository.save(comment);
        notifyCommentLike(saved, userId);
        return convertToDTO(saved, userId);
    }

    @Transactional
    public CommentDTO unlikeComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));

        commentLikeRepository.findByCommentIdAndUserId(commentId, userId)
                .ifPresent(like -> {
                    commentLikeRepository.delete(like);
                    comment.setLikesCount(Math.max(0, comment.getLikesCount() - 1));
                    commentRepository.save(comment);
                });

        return convertToDTO(comment, userId);
    }

    @Transactional
    public void reportComment(Long commentId, Long userId, String reason) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));

        if (commentReportRepository.existsByCommentIdAndReporterId(commentId, userId)) {
            return;
        }

        commentReportRepository.save(new CommentReport(null, commentId, userId, reason, null));
        comment.setReported(true);
        commentRepository.save(comment);
    }

    @Transactional
    public CommentDTO hideComment(Long commentId, Long userId) {
        ensureModerator(userId);
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));
        comment.setHidden(true);
        comment.setModeratedBy(userId);
        return convertToDTO(commentRepository.save(comment), userId);
    }

    @Transactional
    public CommentDTO restoreComment(Long commentId, Long userId) {
        ensureModerator(userId);
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));
        comment.setHidden(false);
        comment.setReported(false);
        comment.setModeratedBy(userId);
        return convertToDTO(commentRepository.save(comment), userId);
    }

    private CommentDTO convertToDTO(Comment comment, Long viewerId) {
        UserProfile author = resolveUserProfile(comment.getUserId());
        String username = author != null ? author.getUsername() : "User " + comment.getUserId();
        boolean likedByViewer = viewerId != null && commentLikeRepository.existsByCommentIdAndUserId(comment.getId(), viewerId);

        List<CommentDTO> replies = commentRepository.findByParentIdOrderByCreatedAtAsc(comment.getId())
                .stream()
                .map(reply -> convertToDTO(reply, viewerId))
                .collect(Collectors.toList());

        return new CommentDTO(
                comment.getId(),
                comment.getSummaryId(),
                comment.getUserId(),
                username,
                comment.getContent(),
                comment.getParentId(),
                comment.getCreatedAt(),
                comment.getLikesCount(),
                comment.isReported(),
                comment.isHidden(),
                likedByViewer,
                replies
        );
    }

    private int deleteCommentRecursive(Comment comment) {
        List<Comment> replies = commentRepository.findByParentIdOrderByCreatedAtAsc(comment.getId());
        int removed = 1;
        for (Comment reply : replies) {
            removed += deleteCommentRecursive(reply);
        }
        commentLikeRepository.deleteByCommentId(comment.getId());
        commentReportRepository.deleteByCommentId(comment.getId());
        commentNotificationRepository.deleteByCommentId(comment.getId());
        commentRepository.delete(comment);
        return removed;
    }

    public Page<NotificationDTO> getNotificationsForUser(Long userId, Pageable pageable) {
        return commentNotificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::mapNotificationToDto);
    }

    public void markNotificationRead(Long notificationId, Long userId) {
        commentNotificationRepository.findById(notificationId)
                .filter(n -> n.getRecipientUserId().equals(userId))
                .ifPresent(notification -> {
                    if (!notification.isRead()) {
                        notification.setRead(true);
                        commentNotificationRepository.save(notification);
                    }
                });
    }

    public void markAllNotificationsRead(Long userId) {
        commentNotificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(userId, Pageable.unpaged())
                .forEach(notification -> {
                    if (!notification.isRead()) {
                        notification.setRead(true);
                        commentNotificationRepository.save(notification);
                    }
                });
    }

    public NotificationDTO mapNotificationToDto(CommentNotification notification) {
        UserProfile actor = resolveUserProfile(notification.getActorUserId());
        return new NotificationDTO(
                notification.getId(),
                notification.getRecipientUserId(),
                notification.getActorUserId(),
                actor != null ? actor.getUsername() : "User " + notification.getActorUserId(),
                notification.getCommentId(),
                notification.getSummaryId(),
                notification.getType(),
                notification.getMessage(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }

    private void notifyCommentReply(Comment reply) {
        if (reply.getParentId() == null) {
            return;
        }
        commentRepository.findById(reply.getParentId()).ifPresent(parent -> {
            if (!parent.getUserId().equals(reply.getUserId())) {
                UserProfile actor = resolveUserProfile(reply.getUserId());
                String actorName = actor != null ? actor.getUsername() : "Someone";
                createNotification(
                        parent.getUserId(),
                        reply.getUserId(),
                        reply.getId(),
                        reply.getSummaryId(),
                        "COMMENT_REPLY",
                        String.format("%s replied to your comment", actorName)
                );
            }
        });
    }

    private void notifyCommentLike(Comment comment, Long actorUserId) {
        if (comment.getUserId().equals(actorUserId)) {
            return;
        }
        UserProfile actor = resolveUserProfile(actorUserId);
        String actorName = actor != null ? actor.getUsername() : "Someone";
        createNotification(
                comment.getUserId(),
                actorUserId,
                comment.getId(),
                comment.getSummaryId(),
                "COMMENT_LIKE",
                String.format("%s liked your comment", actorName)
        );
    }

    private void createNotification(Long recipientUserId, Long actorUserId, Long commentId, Long summaryId, String type, String message) {
        try {
            CommentNotification notification = new CommentNotification();
            notification.setRecipientUserId(recipientUserId);
            notification.setActorUserId(actorUserId);
            notification.setCommentId(commentId);
            notification.setSummaryId(summaryId);
            notification.setType(type);
            notification.setMessage(message);
            notification.setRead(false);
            commentNotificationRepository.save(notification);
        } catch (Exception ex) {
            log.warn("Failed to create notification: {}", ex.getMessage());
        }
    }

    private void updateSummaryCommentCount(Long summaryId, int change) {
        try {
            String url = String.format("%s/api/summaries/%d/comments?change=%d", summaryServiceBaseUrl, summaryId, change);
            restTemplate.exchange(url, HttpMethod.PUT, null, Void.class);
        } catch (Exception ex) {
            log.warn("Failed to update summary {} comment count: {}", summaryId, ex.getMessage());
        }
    }

    private UserProfile resolveUserProfile(Long userId) {
        return userCache.computeIfAbsent(userId, this::fetchUserProfile);
    }

    private UserProfile fetchUserProfile(Long userId) {
        try {
            String url = String.format("%s/api/users/%d", userServiceBaseUrl, userId);
            ResponseEntity<UserProfile> response = restTemplate.getForEntity(url, UserProfile.class);
            return response.getBody();
        } catch (Exception ex) {
            log.warn("Unable to fetch user profile for {}: {}", userId, ex.getMessage());
            return new UserProfile(userId, "User " + userId, "USER");
        }
    }

    private boolean isModerator(Long userId) {
        UserProfile profile = resolveUserProfile(userId);
        return profile != null && "MODERATOR".equalsIgnoreCase(profile.getRole());
    }

    private void ensureModerator(Long userId) {
        if (!isModerator(userId)) {
            throw new IllegalStateException("Only moderators can perform this action");
        }
    }

    private static class UserProfile {
        private Long id;
        private String username;
        private String role;

        public UserProfile() {}

        public UserProfile(Long id, String username, String role) {
            this.id = id;
            this.username = username;
            this.role = role;
        }

        public Long getId() { return id; }
        public String getUsername() { return username; }
        public String getRole() { return role; }
    }
}
