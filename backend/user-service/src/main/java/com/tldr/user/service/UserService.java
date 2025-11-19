package com.tldr.user.service;

import com.tldr.user.dto.UserDTO;
import com.tldr.user.exception.ResourceNotFoundException;
import com.tldr.user.model.User;
import com.tldr.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.util.HtmlUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

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

    private UserDTO convertToDTO(User user) {
        return new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getKarma(),
                user.getRole()
        );
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
