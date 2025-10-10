package com.tldr.vote.controller;

import com.tldr.vote.dto.VoteDTO;
import com.tldr.vote.model.Vote;
import com.tldr.vote.service.VoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/votes")
@CrossOrigin(origins = "*")
public class VoteController {
    
    @Autowired
    private VoteService voteService;
    
    @PostMapping
    public ResponseEntity<VoteDTO> castVote(@RequestBody Vote vote) {
        VoteDTO voteDTO = voteService.castVote(vote);
        return new ResponseEntity<>(voteDTO, HttpStatus.CREATED);
    }
    
    @GetMapping
    public ResponseEntity<VoteDTO> getVote(@RequestParam Long userId, @RequestParam Long summaryId) {
        VoteDTO vote = voteService.getVote(userId, summaryId);
        return vote != null ? ResponseEntity.ok(vote) : ResponseEntity.notFound().build();
    }
    
    @GetMapping("/count/{summaryId}")
    public ResponseEntity<Integer> getVoteCount(@PathVariable Long summaryId) {
        return ResponseEntity.ok(voteService.getVoteCount(summaryId));
    }
    
    @DeleteMapping
    public ResponseEntity<Void> removeVote(@RequestParam Long userId, @RequestParam Long summaryId) {
        voteService.removeVote(userId, summaryId);
        return ResponseEntity.noContent().build();
    }
}
