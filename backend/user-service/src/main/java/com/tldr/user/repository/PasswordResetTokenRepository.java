package com.tldr.user.repository;

import com.tldr.user.model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByTokenAndUsedFalse(String token);
    void deleteByExpiresAtBefore(LocalDateTime cutoff);
    void deleteByUserId(Long userId);
}

