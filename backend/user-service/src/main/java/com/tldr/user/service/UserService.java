package com.tldr.user.service;

import com.tldr.user.dto.UserDTO;
import com.tldr.user.exception.ResourceNotFoundException;
import com.tldr.user.model.User;
import com.tldr.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.HtmlUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RestTemplate restTemplate;

    @Value("${services.comment.base-url:http://comment-service:8084}")
    private String commentServiceBaseUrl;

    public UserDTO createUser(User user) {
        if (user == null) {
            throw new IllegalArgumentException("User payload is required");
        }

        String normalizedEmail = normalizeEmail(user.getEmail());
        String safeUsername = sanitize(user.getUsername());

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("An account with that email already exists");
        }

        if (userRepository.existsByUsername(safeUsername)) {
            throw new IllegalArgumentException("Username is already taken");
        }

        user.setEmail(normalizedEmail);
        user.setUsername(safeUsername);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (user.getKarma() == null) {
            user.setKarma(0);
        }

        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }

    public UserDTO getUserById(Long id) {
        return userRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public UserDTO getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .map(this::convertToDTO)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public UserDTO updateKarma(Long userId, Integer karmaChange) {
        return userRepository.findById(userId)
                .map(user -> {
                    user.setKarma(user.getKarma() + karmaChange);
                    return convertToDTO(userRepository.save(user));
                })
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public UserDTO updateTotalUpvotes(Long userId, Integer change) {
        return userRepository.findById(userId)
                .map(user -> {
                    String oldBadge = user.getBadge();
                    int newTotal = (user.getTotalUpvotes() == null ? 0 : user.getTotalUpvotes()) + (change == null ? 0 : change);
                    if (newTotal < 0) newTotal = 0;
                    user.setTotalUpvotes(newTotal);
                    String newBadge = determineBadge(newTotal);
                    user.setBadge(newBadge);
                    
                    User savedUser = userRepository.save(user);
                    
                    // Notify if badge changed to a higher tier
                    if (!oldBadge.equals(newBadge) && isBadgeUpgrade(oldBadge, newBadge)) {
                        notifyBadgeUnlocked(userId, newBadge);
                    }
                    
                    return convertToDTO(savedUser);
                })
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private boolean isBadgeUpgrade(String oldBadge, String newBadge) {
        // Define badge hierarchy
        List<String> badgeHierarchy = List.of("NEWBIE", "BRONZE", "SILVER", "GOLD", "PLATINUM");
        int oldIndex = badgeHierarchy.indexOf(oldBadge);
        int newIndex = badgeHierarchy.indexOf(newBadge);
        return newIndex > oldIndex;
    }

    private void notifyBadgeUnlocked(Long userId, String badge) {
        try {
            String url = String.format("%s/api/notifications/badge?userId=%d&badge=%s", 
                    commentServiceBaseUrl, userId, badge);
            restTemplate.postForEntity(url, null, Void.class);
            log.info("Sent badge notification for user {} with badge {}", userId, badge);
        } catch (Exception ex) {
            log.warn("Failed to send badge notification for user {}: {}", userId, ex.getMessage());
        }
    }

    private UserDTO convertToDTO(User user) {
        return new UserDTO(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getTotalUpvotes(),
            user.getKarma(),
            user.getRole(),
            user.getBadge()
        );
    }

    private String determineBadge(int totalUpvotes) {
        if (totalUpvotes >= 1000) return "PLATINUM";
        if (totalUpvotes >= 200) return "GOLD";
        if (totalUpvotes >= 50) return "SILVER";
        if (totalUpvotes >= 10) return "BRONZE";
        return "NEWBIE";
    }

    private String normalizeEmail(String email) {
        if (!StringUtils.hasText(email)) {
            throw new IllegalArgumentException("Email is required");
        }
        return email.trim().toLowerCase();
    }

    private String sanitize(String value) {
        if (!StringUtils.hasText(value)) {
            throw new IllegalArgumentException("Username is required");
        }
        return HtmlUtils.htmlEscape(value.trim());
    }
}
