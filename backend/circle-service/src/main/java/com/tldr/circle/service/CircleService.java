package com.tldr.circle.service;

import com.tldr.circle.dto.CircleDTO;
import com.tldr.circle.model.Circle;
import com.tldr.circle.model.UserCircleFollowing;
import com.tldr.circle.repository.CircleRepository;
import com.tldr.circle.repository.UserCircleFollowingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CircleService {
    
    private final CircleRepository circleRepository;
    private final UserCircleFollowingRepository followingRepository;
    
    public CircleDTO createCircle(String name, Circle.CircleType type, String description, 
                                  Long creatorId, String countryCode) {
        // Validate name uniqueness
        if (circleRepository.findByName(name).isPresent()) {
            throw new IllegalArgumentException("Circle with name '" + name + "' already exists");
        }
        
        // Validate type-specific requirements
        if (type == Circle.CircleType.COUNTRY && (countryCode == null || countryCode.isEmpty())) {
            throw new IllegalArgumentException("Country code is required for COUNTRY type circles");
        }
        
        if (type == Circle.CircleType.LOCAL && creatorId == null) {
            throw new IllegalArgumentException("Creator ID is required for LOCAL type circles");
        }
        
        Circle circle = new Circle();
        circle.setName(name);
        circle.setType(type);
        circle.setDescription(description);
        circle.setCreatorId(creatorId);
        circle.setCountryCode(countryCode);
        
        Circle saved = circleRepository.save(circle);
        return convertToDTO(saved, null);
    }
    
    public CircleDTO getCircleById(Long id, Long userId) {
        return circleRepository.findById(id)
                .map(circle -> convertToDTO(circle, userId))
                .orElse(null);
    }
    
    public Page<CircleDTO> getAllCircles(int page, int size, Long userId) {
        Pageable pageable = PageRequest.of(page, size);
        return circleRepository.findAll(pageable)
                .map(circle -> convertToDTO(circle, userId));
    }
    
    public Page<CircleDTO> getCirclesByType(Circle.CircleType type, int page, int size, Long userId) {
        Pageable pageable = PageRequest.of(page, size);
        return circleRepository.findByTypeOrderByFollowerCountDesc(type, pageable)
                .map(circle -> convertToDTO(circle, userId));
    }
    
    public Page<CircleDTO> searchCircles(String searchTerm, int page, int size, Long userId) {
        Pageable pageable = PageRequest.of(page, size);
        return circleRepository.searchByName(searchTerm, pageable)
                .map(circle -> convertToDTO(circle, userId));
    }
    
    public List<CircleDTO> getFollowedCircles(Long userId) {
        List<Circle> circles = followingRepository.findCirclesByUserId(userId);
        return circles.stream()
                .map(circle -> convertToDTO(circle, userId))
                .collect(Collectors.toList());
    }
    
    @Transactional
    public boolean followCircle(Long userId, Long circleId) {
        if (followingRepository.existsByUserIdAndCircleId(userId, circleId)) {
            return false; // Already following
        }
        
        Circle circle = circleRepository.findById(circleId)
                .orElseThrow(() -> new IllegalArgumentException("Circle not found"));
        
        UserCircleFollowing following = new UserCircleFollowing();
        following.setUserId(userId);
        following.setCircle(circle);
        followingRepository.save(following);
        
        // Update follower count
        circle.setFollowerCount(circle.getFollowerCount() + 1);
        circleRepository.save(circle);
        
        return true;
    }
    
    @Transactional
    public boolean unfollowCircle(Long userId, Long circleId) {
        if (!followingRepository.existsByUserIdAndCircleId(userId, circleId)) {
            return false; // Not following
        }
        
        followingRepository.deleteByUserIdAndCircleId(userId, circleId);
        
        // Update follower count
        Circle circle = circleRepository.findById(circleId)
                .orElseThrow(() -> new IllegalArgumentException("Circle not found"));
        circle.setFollowerCount(Math.max(0, circle.getFollowerCount() - 1));
        circleRepository.save(circle);
        
        return true;
    }
    
    @Transactional
    public void incrementPostCount(Long circleId) {
        circleRepository.findById(circleId).ifPresent(circle -> {
            circle.setPostCount(circle.getPostCount() + 1);
            circleRepository.save(circle);
        });
    }
    
    @Transactional
    public void decrementPostCount(Long circleId) {
        circleRepository.findById(circleId).ifPresent(circle -> {
            circle.setPostCount(Math.max(0, circle.getPostCount() - 1));
            circleRepository.save(circle);
        });
    }
    
    private CircleDTO convertToDTO(Circle circle, Long userId) {
        CircleDTO dto = new CircleDTO();
        dto.setId(circle.getId());
        dto.setName(circle.getName());
        dto.setType(circle.getType());
        dto.setDescription(circle.getDescription());
        dto.setCreatorId(circle.getCreatorId());
        dto.setCountryCode(circle.getCountryCode());
        dto.setFollowerCount(circle.getFollowerCount());
        dto.setPostCount(circle.getPostCount());
        dto.setCreatedAt(circle.getCreatedAt());
        
        if (userId != null) {
            dto.setIsFollowing(followingRepository.existsByUserIdAndCircleId(userId, circle.getId()));
        } else {
            dto.setIsFollowing(false);
        }
        
        return dto;
    }
}

