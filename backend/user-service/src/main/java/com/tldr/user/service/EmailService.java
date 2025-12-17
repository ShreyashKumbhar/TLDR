package com.tldr.user.service;

import com.tldr.user.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:noreply@tldr.local}")
    private String fromAddress;

    @Value("${app.frontend.base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    public void sendPasswordResetEmail(User user, String token) {
        try {
            String encodedToken = URLEncoder.encode(token, StandardCharsets.UTF_8);
            String resetUrl = frontendBaseUrl + "/reset-password?token=" + encodedToken;

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(user.getEmail());
            message.setSubject("Reset your TLDR password");
            message.setText(buildEmailBody(user.getUsername(), resetUrl));

            mailSender.send(message);
            log.info("Password reset email sent to {}", user.getEmail());
        } catch (Exception ex) {
            // Don't break the flow if email sending fails, but log it clearly
            log.error("Failed to send password reset email to {}: {}", user.getEmail(), ex.getMessage(), ex);
        }
    }

    private String buildEmailBody(String username, String resetUrl) {
        return "Hi " + username + ",\n\n" +
               "We received a request to reset your TLDR account password.\n\n" +
               "To choose a new password, click the link below (or paste it into your browser):\n" +
               resetUrl + "\n\n" +
               "This link will expire in 30 minutes. If you didn't request a password reset, " +
               "you can safely ignore this email.\n\n" +
               "— TLDR Team";
    }
}


