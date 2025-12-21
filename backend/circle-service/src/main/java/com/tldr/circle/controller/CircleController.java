package com.tldr.circle.controller;

import com.tldr.circle.dto.CircleDTO;
import com.tldr.circle.model.Circle;
import com.tldr.circle.service.CircleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/circles")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CircleController {
    
    private final CircleService circleService;
    
    @PostMapping
    public ResponseEntity<CircleDTO> createCircle(@RequestBody Map<String, Object> request) {
        String name = (String) request.get("name");
        String typeStr = (String) request.get("type");
        String description = (String) request.get("description");
        Long creatorId = request.get("creatorId") != null ? 
            Long.valueOf(request.get("creatorId").toString()) : null;
        String countryCode = (String) request.get("countryCode");
        
        Circle.CircleType type = Circle.CircleType.valueOf(typeStr.toUpperCase());
        
        try {
            CircleDTO circle = circleService.createCircle(name, type, description, creatorId, countryCode);
            return new ResponseEntity<>(circle, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CircleDTO> getCircleById(
            @PathVariable Long id,
            @RequestParam(required = false) Long userId) {
        CircleDTO circle = circleService.getCircleById(id, userId);
        return circle != null ? ResponseEntity.ok(circle) : ResponseEntity.notFound().build();
    }
    
    @GetMapping
    public ResponseEntity<Page<CircleDTO>> getAllCircles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long userId) {
        Page<CircleDTO> circles = circleService.getAllCircles(page, size, userId);
        return ResponseEntity.ok(circles);
    }
    
    @GetMapping("/type/{type}")
    public ResponseEntity<Page<CircleDTO>> getCirclesByType(
            @PathVariable String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long userId) {
        Circle.CircleType circleType = Circle.CircleType.valueOf(type.toUpperCase());
        Page<CircleDTO> circles = circleService.getCirclesByType(circleType, page, size, userId);
        return ResponseEntity.ok(circles);
    }
    
    @GetMapping("/search")
    public ResponseEntity<Page<CircleDTO>> searchCircles(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long userId) {
        Page<CircleDTO> circles = circleService.searchCircles(q, page, size, userId);
        return ResponseEntity.ok(circles);
    }
    
    @GetMapping("/followed")
    public ResponseEntity<List<CircleDTO>> getFollowedCircles(@RequestParam Long userId) {
        List<CircleDTO> circles = circleService.getFollowedCircles(userId);
        return ResponseEntity.ok(circles);
    }
    
    @PostMapping("/{circleId}/follow")
    public ResponseEntity<Void> followCircle(
            @PathVariable Long circleId,
            @RequestParam Long userId) {
        boolean success = circleService.followCircle(userId, circleId);
        return success ? ResponseEntity.ok().build() : ResponseEntity.badRequest().build();
    }
    
    @DeleteMapping("/{circleId}/follow")
    public ResponseEntity<Void> unfollowCircle(
            @PathVariable Long circleId,
            @RequestParam Long userId) {
        boolean success = circleService.unfollowCircle(userId, circleId);
        return success ? ResponseEntity.ok().build() : ResponseEntity.badRequest().build();
    }
    
    @PostMapping("/{circleId}/increment-post")
    public ResponseEntity<Void> incrementPostCount(@PathVariable Long circleId) {
        circleService.incrementPostCount(circleId);
        return ResponseEntity.ok().build();
    }
}

