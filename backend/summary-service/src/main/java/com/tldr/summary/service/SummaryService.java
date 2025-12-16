package com.tldr.summary.service;

import com.tldr.summary.dto.SummaryDTO;
import com.tldr.summary.model.Summary;
import com.tldr.summary.repository.SummaryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SummaryService {
    
    private final SummaryRepository summaryRepository;
    private final RestTemplate restTemplate;
    
    @Value("${services.user.base-url:http://user-service:8081}")
    private String userServiceBaseUrl;
    
    private final Map<Long, UserInfo> userCache = new ConcurrentHashMap<>();
    
    // Clear cache method for refreshing user info
    public void clearUserCache(Long userId) {
        if (userId != null) {
            userCache.remove(userId);
        } else {
            userCache.clear();
        }
    }
    
    public SummaryDTO createSummary(Summary summary) {
        // First, verify the user exists in user-service
        // This prevents creating summaries for non-existent users
        UserInfo userInfo = fetchUserInfo(summary.getUserId());
        if (userInfo == null || userInfo.getUsername().startsWith("User ")) {
            log.error("Cannot create summary: User {} does not exist in user-service. " +
                    "This may happen if user-service database was reset. Summary creation aborted.", summary.getUserId());
            throw new IllegalArgumentException("User does not exist. Please ensure you are logged in and try again.");
        }
        
        Summary savedSummary = summaryRepository.save(summary);
        // Clear cache for this user to force fresh fetch when displaying
        clearUserCache(savedSummary.getUserId());
        
        return convertToDTO(savedSummary);
    }
    
    public SummaryDTO getSummaryById(Long id) {
        return summaryRepository.findById(id)
                .map(this::convertToDTO)
                .orElse(null);
    }
    
    public Page<SummaryDTO> getAllSummaries(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return summaryRepository.findByOrderByCreatedAtDesc(pageable)
                .map(this::convertToDTO);
    }
    
    public Page<SummaryDTO> getTopSummaries(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return summaryRepository.findByOrderByVoteCountDesc(pageable)
                .map(this::convertToDTO);
    }
    
    public Page<SummaryDTO> getSummariesByTags(List<String> tags, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return summaryRepository.findByTagsIn(tags, pageable)
                .map(this::convertToDTO);
    }
    
    public Page<SummaryDTO> getSummariesByUser(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return summaryRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::convertToDTO);
    }
    
    public List<SummaryDTO> getTrendingDigest() {
        LocalDateTime yesterday = LocalDateTime.now().minusDays(1);
        Pageable pageable = PageRequest.of(0, 10);
        return summaryRepository.findTrendingSince(yesterday, pageable).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public SummaryDTO updateVoteCount(Long id, Integer change) {
        return summaryRepository.findById(id)
                .map(summary -> {
                    summary.setVoteCount(summary.getVoteCount() + change);
                    return convertToDTO(summaryRepository.save(summary));
                })
                .orElse(null);
    }
    
    public SummaryDTO updateCommentCount(Long id, Integer change) {
        return summaryRepository.findById(id)
                .map(summary -> {
                    summary.setCommentCount(summary.getCommentCount() + change);
                    return convertToDTO(summaryRepository.save(summary));
                })
                .orElse(null);
    }

    @Transactional
    public boolean deleteSummary(Long id, Long userId) {
        return summaryRepository.findById(id)
                .filter(summary -> summary.getUserId().equals(userId))
                .map(summary -> {
                    summaryRepository.delete(summary);
                    return true;
                })
                .orElse(false);
    }
    
    private SummaryDTO convertToDTO(Summary summary) {
        UserInfo userInfo = getUserInfo(summary.getUserId());
        return new SummaryDTO(
            summary.getId(),
            summary.getTitle(),
            summary.getContent(),
            summary.getOriginalUrl(),
            summary.getUserId(),
            userInfo != null ? userInfo.getUsername() : "User " + summary.getUserId(),
            userInfo != null ? userInfo.getBadge() : "NEWBIE",
            summary.getTags(),
            summary.getCreatedAt(),
            summary.getVoteCount(),
            summary.getCommentCount()
        );
    }
    
    private UserInfo getUserInfo(Long userId) {
        // Check cache first - but only if it's a real username (not fallback)
        UserInfo cached = userCache.get(userId);
        if (cached != null && !cached.getUsername().startsWith("User ")) {
            // Only use cache if it has a real username (not fallback)
            return cached;
        }
        
        // If cache has fallback value, remove it
        if (cached != null && cached.getUsername().startsWith("User ")) {
            userCache.remove(userId);
        }
        
        // Fetch fresh data
        UserInfo userInfo = fetchUserInfo(userId);
        if (userInfo != null && !userInfo.getUsername().startsWith("User ")) {
            // Only cache if we got real data (not fallback)
            userCache.put(userId, userInfo);
            log.debug("Cached user info for userId {}: {}", userId, userInfo.getUsername());
        } else {
            log.debug("Not caching fallback user info for userId {}", userId);
        }
        return userInfo;
    }
    
    private UserInfo fetchUserInfo(Long userId) {
        // Retry logic: try up to 5 times with increasing delays for new users
        // Increased retries for 404s since user might be created shortly
        int maxRetries = 5;
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                String url = String.format("%s/api/users/%d", userServiceBaseUrl, userId);
                if (attempt > 1) {
                    log.debug("Retry attempt {} for fetching user info from: {}", attempt, url);
                    // Add delay for retries (new users might need a moment to be fully saved)
                    try {
                        Thread.sleep(attempt * 300); // 300ms, 600ms, 900ms
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                } else {
                    log.debug("Fetching user info from: {}", url);
                }
                
                ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
                
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    Map<String, Object> user = response.getBody();
                    Object usernameObj = user.get("username");
                    Object badgeObj = user.get("badge");
                    
                    String username = usernameObj != null ? usernameObj.toString() : null;
                    String badge = badgeObj != null ? badgeObj.toString() : "NEWBIE";
                    
                    if (username != null && !username.isEmpty() && !username.equals("null")) {
                        log.info("Successfully fetched user info for userId {}: username={}, badge={}", userId, username, badge);
                        return new UserInfo(username, badge);
                    } else {
                        log.warn("User {} returned null, empty, or 'null' username on attempt {}. Response: {}", userId, attempt, user);
                        if (attempt < maxRetries) {
                            continue; // Retry
                        }
                    }
                } else {
                    log.warn("Failed to fetch user {}: HTTP status {} on attempt {}", userId, response.getStatusCode(), attempt);
                    if (attempt < maxRetries) {
                        continue; // Retry
                    }
                }
            } catch (org.springframework.web.client.ResourceAccessException ex) {
                log.warn("Cannot connect to user-service for userId {} (attempt {}/{}): {}", userId, attempt, maxRetries, ex.getMessage());
                if (attempt < maxRetries) {
                    continue; // Retry
                }
            } catch (org.springframework.web.client.HttpClientErrorException ex) {
                if (ex.getStatusCode().value() == 404) {
                    log.warn("User {} not found in user-service (attempt {}/{}). Response body: {}. User may not exist yet or user-service database was reset.", 
                            userId, attempt, maxRetries, ex.getResponseBodyAsString());
                    if (attempt < maxRetries) {
                        // Longer delay for 404s - user might need time to be created
                        try {
                            Thread.sleep(attempt * 500); // 500ms, 1000ms, 1500ms for 404s
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                            break;
                        }
                        continue; // Retry - user might be created shortly
                    }
                } else {
                    log.error("HTTP error fetching user {} (attempt {}/{}): {} - {}. Response: {}", 
                            userId, attempt, maxRetries, ex.getStatusCode(), ex.getMessage(), ex.getResponseBodyAsString());
                    if (attempt < maxRetries && ex.getStatusCode().value() >= 500) {
                        continue; // Retry on server errors
                    } else {
                        break; // Don't retry on client errors (4xx except 404)
                    }
                }
            } catch (Exception ex) {
                log.error("Unexpected error fetching user info for {} (attempt {}/{}): {}", userId, attempt, maxRetries, ex.getMessage());
                if (attempt < maxRetries) {
                    continue; // Retry
                }
            }
        }
        
        log.warn("Returning fallback user info for userId {} after {} attempts", userId, maxRetries);
        // Don't cache fallback values - return null so it will retry next time
        return new UserInfo("User " + userId, "NEWBIE");
    }
    
    private static class UserInfo {
        private final String username;
        private final String badge;
        
        UserInfo(String username, String badge) {
            this.username = username;
            this.badge = badge;
        }
        
        String getUsername() { return username; }
        String getBadge() { return badge; }
    }
}
