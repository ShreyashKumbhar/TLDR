package com.tldr.user.controller;

import com.tldr.user.dto.UserDTO;
import com.tldr.user.model.User;
import com.tldr.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    public ResponseEntity<UserDTO> createUser(@RequestBody User user) {
        UserDTO createdUser = userService.createUser(user);
        return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<UserDTO> getUserByUsername(@PathVariable String username) {
        return ResponseEntity.ok(userService.getUserByUsername(username));
    }

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PutMapping("/{id}/karma")
    public ResponseEntity<UserDTO> updateKarma(@PathVariable Long id, @RequestParam Integer change) {
        return ResponseEntity.ok(userService.updateKarma(id, change));
    }

    @PutMapping("/{id}/upvotes")
    public ResponseEntity<UserDTO> updateTotalUpvotes(@PathVariable Long id, @RequestParam Integer change) {
        return ResponseEntity.ok(userService.updateTotalUpvotes(id, change));
    }
}
