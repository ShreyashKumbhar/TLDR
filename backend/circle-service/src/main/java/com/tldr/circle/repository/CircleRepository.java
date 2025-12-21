package com.tldr.circle.repository;

import com.tldr.circle.model.Circle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CircleRepository extends JpaRepository<Circle, Long> {
    
    Optional<Circle> findByName(String name);
    
    Page<Circle> findByTypeOrderByFollowerCountDesc(Circle.CircleType type, Pageable pageable);
    
    @Query("SELECT c FROM Circle c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Circle> searchByName(@Param("searchTerm") String searchTerm, Pageable pageable);
}

