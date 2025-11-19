package com.tldr.user.config;

import com.tldr.user.model.User;
import com.tldr.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class SampleUserDataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }

        List<User> demoUsers = List.of(
                createUser("techfan", "techfan@example.com", "password123!", 128, "MODERATOR"),
                createUser("newsjunkie", "newsjunkie@example.com", "password123!", 92, "USER"),
                createUser("sciencegeek", "sciencegeek@example.com", "password123!", 77, "USER"),
                createUser("healthhero", "healthhero@example.com", "password123!", 64, "USER"),
                createUser("marketwatcher", "marketwatcher@example.com", "password123!", 58, "USER")
        );

        userRepository.saveAll(demoUsers);
    }

    private User createUser(String username, String email, String rawPassword, int karma, String role) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email.toLowerCase());
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setKarma(karma);
        user.setRole(role);
        user.setCreatedAt(LocalDateTime.now().minusDays(7));
        return user;
    }
}

