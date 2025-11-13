package com.tldr.user.service;

import com.tldr.user.dto.UserDTO;
import com.tldr.user.dto.auth.*;
import com.tldr.user.exception.ResourceNotFoundException;
import com.tldr.user.model.PasswordResetToken;
import com.tldr.user.model.User;
import com.tldr.user.repository.PasswordResetTokenRepository;
import com.tldr.user.repository.UserRepository;
import com.tldr.user.security.JwtService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.util.HtmlUtils;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    private static final long PASSWORD_RESET_TOKEN_MINUTES = 30;

    public AuthResponse signup(SignupRequest request) {
        validateSignupRequest(request);

        String normalizedEmail = request.getEmail().trim().toLowerCase();
        String safeUsername = sanitize(request.getUsername());

        User user = new User();
        user.setUsername(safeUsername);
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setKarma(0);

        User savedUser = userRepository.save(user);
        String token = jwtService.generateToken(savedUser);
        return new AuthResponse(token, convertToDto(savedUser));
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, convertToDto(user));
    }

    public void requestPasswordReset(PasswordResetRequest request) {
        userRepository.findByEmail(request.getEmail().trim().toLowerCase()).ifPresent(user -> {
            passwordResetTokenRepository.deleteByUserId(user.getId());

            String token = UUID.randomUUID().toString();
            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .token(token)
                    .user(user)
                    .expiresAt(LocalDateTime.now().plusMinutes(PASSWORD_RESET_TOKEN_MINUTES))
                    .used(false)
                    .build();

            passwordResetTokenRepository.save(resetToken);

            log.info("Password reset token generated for user {}. Token: {}", user.getEmail(), token);
        });
    }

    @Transactional
    public void resetPassword(PasswordResetConfirmRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        PasswordResetToken resetToken = passwordResetTokenRepository
                .findByTokenAndUsedFalse(request.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired password reset token"));

        if (resetToken.isExpired()) {
            passwordResetTokenRepository.delete(resetToken);
            throw new IllegalArgumentException("Password reset token has expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
    }

    public UserDTO getCurrentUser(String token) {
        Long userId = jwtService.extractUserId(token);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return convertToDto(user);
    }

    private void validateSignupRequest(SignupRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        String normalizedEmail = request.getEmail().trim().toLowerCase();
        String safeUsername = sanitize(request.getUsername());

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("An account with that email already exists");
        }

        if (userRepository.existsByUsername(safeUsername)) {
            throw new IllegalArgumentException("Username is already taken");
        }
    }

    private String sanitize(String value) {
        return StringUtils.hasText(value) ? HtmlUtils.htmlEscape(value.trim()) : value;
    }

    private UserDTO convertToDto(User user) {
        return new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getKarma()
        );
    }
}

