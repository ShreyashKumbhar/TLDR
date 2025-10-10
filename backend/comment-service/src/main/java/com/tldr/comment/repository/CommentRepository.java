package com.tldr.comment.repository;

import com.tldr.comment.model.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    Page<Comment> findBySummaryIdAndParentIdIsNullOrderByCreatedAtDesc(Long summaryId, Pageable pageable);
    List<Comment> findByParentIdOrderByCreatedAtAsc(Long parentId);
    Long countBySummaryId(Long summaryId);
}
