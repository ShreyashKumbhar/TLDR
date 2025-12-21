package com.tldr.circle.repository;

import com.tldr.circle.model.Circle;
import com.tldr.circle.model.UserCircleFollowing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserCircleFollowingRepository extends JpaRepository<UserCircleFollowing, Long> {
    
    boolean existsByUserIdAndCircleId(Long userId, Long circleId);
    
    void deleteByUserIdAndCircleId(Long userId, Long circleId);
    
    @Query("SELECT ucf.circle FROM UserCircleFollowing ucf WHERE ucf.userId = :userId")
    List<Circle> findCirclesByUserId(@Param("userId") Long userId);
}

