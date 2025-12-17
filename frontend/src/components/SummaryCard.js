import React, { useState, useEffect } from 'react';
import { voteService, recommendationService, savedService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CommentSection from './CommentSection';

function SummaryCard({ summary, onSummaryUpdate }) {
  const [voteCount, setVoteCount] = useState(summary.voteCount || 0);
  const [userVote, setUserVote] = useState(0);
  const [commentCount, setCommentCount] = useState(summary.commentCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [loadingVote, setLoadingVote] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { user } = useAuth();
  const currentUserId = user?.id;

  // Fetch user's existing vote and saved status when component mounts
  useEffect(() => {
    if (currentUserId && summary?.id) {
      voteService.getVote(currentUserId, summary.id)
        .then(response => {
          if (response.data && response.data.value) {
            setUserVote(response.data.value);
          }
        })
        .catch(err => {
          // No vote found is fine, just means user hasn't voted
          if (err.response?.status !== 404) {
            console.error('Error fetching vote:', err);
          }
        });
      
      // Check if summary is saved
      savedService.isSaved(currentUserId, summary.id)
        .then(response => {
          setIsSaved(response.data);
        })
        .catch(err => {
          // Not saved is fine
          if (err.response?.status !== 404) {
            console.error('Error checking saved status:', err);
          }
        });
      
      // Track view behavior
      recommendationService.trackBehavior(currentUserId, summary.id, 'VIEW')
        .catch(err => console.error('Error tracking view:', err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, summary?.id]);

  const handleVote = async (value) => {
    if (!currentUserId) {
      alert('Please sign in to vote on summaries.');
      return;
    }

    if (loadingVote) return; // Prevent double-clicks

    try {
      setLoadingVote(true);
      const previousVote = userVote;
      let newVote = value;
      let voteChange = value;

      // If clicking the same button, remove the vote (Reddit-style)
      if (userVote === value) {
        await voteService.removeVote(currentUserId, summary.id);
        // Remove vote behaviors from recommendation service
        recommendationService.removeVoteBehaviors(currentUserId, summary.id)
          .catch(err => console.error('Error removing vote behaviors:', err));
        newVote = 0;
        voteChange = -value; // Remove the vote
      } else {
        // If switching from one vote to another, calculate the change
        if (userVote !== 0) {
          voteChange = value - userVote; // Change from previous vote
          // Remove old vote behavior before tracking new one
          recommendationService.removeVoteBehaviors(currentUserId, summary.id)
            .catch(err => console.error('Error removing old vote behaviors:', err));
        }
        await voteService.castVote(currentUserId, summary.id, value);
        // Track vote behavior only for new votes or vote changes
        if (previousVote === 0 || previousVote !== value) {
          const behaviorType = value === 1 ? 'UPVOTE' : 'DOWNVOTE';
          recommendationService.trackBehavior(
            currentUserId, 
            summary.id, 
            behaviorType
          ).catch(err => console.error('Error tracking vote:', err));
        }
      }

      // Update local state
      setUserVote(newVote);
      setVoteCount((prev) => prev + voteChange);

      // Update parent if callback provided
      if (onSummaryUpdate) {
        onSummaryUpdate({ ...summary, voteCount: voteCount + voteChange });
      }
    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to update vote. Please try again.');
    } finally {
      setLoadingVote(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/summary/${summary.id}`;
    try {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Link copied to clipboard!');
    }
  };

  const handleSave = async () => {
    if (!currentUserId) {
      alert('Please sign in to save summaries.');
      return;
    }

    try {
      if (isSaved) {
        await savedService.unsaveSummary(currentUserId, summary.id);
        setIsSaved(false);
      } else {
        await savedService.saveSummary(currentUserId, summary.id);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error saving/unsaving summary:', error);
      alert('Failed to save summary. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-user">
          <div className="user-avatar">
            {(summary.username || `User ${summary.userId}`).charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <span className="username">{summary.username || `User ${summary.userId}`}</span>
            {summary.userBadge && (
              <span className={`badge badge-${summary.userBadge.toLowerCase()}`}>
                {summary.userBadge}
              </span>
            )}
            <span className="post-time">• {formatDate(summary.createdAt)}</span>
          </div>
        </div>
        <button className="post-menu">⋯</button>
      </div>

      <div className="post-content">
        <h3 className="post-title">{summary.title}</h3>
        <p className="post-text">{summary.content}</p>
        
        <div className="post-tags">
          {summary.tags && summary.tags.map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      </div>

      <div className="post-actions">
        <div className="vote-buttons">
          <button
            className={`vote-button upvote ${userVote === 1 ? 'active' : ''}`}
            onClick={() => handleVote(1)}
            disabled={!currentUserId || loadingVote}
          >
            ▲
          </button>
          <span className="vote-count">{voteCount}</span>
          <button
            className={`vote-button downvote ${userVote === -1 ? 'active' : ''}`}
            onClick={() => handleVote(-1)}
            disabled={!currentUserId || loadingVote}
          >
            ▼
          </button>
        </div>
        <button
          className="action-button comment-button"
          onClick={() => setShowComments((prev) => !prev)}
        >
          💬 {commentCount}
        </button>
        <button className="action-button share-button" onClick={handleShare}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
            <polyline points="16,6 12,2 8,6"></polyline>
            <line x1="12" y1="2" x2="12" y2="15"></line>
          </svg>
        </button>
        <button className={`action-button save-button ${isSaved ? 'saved' : ''}`} onClick={handleSave}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      </div>

      {showComments && (
        <div className="post-comments">
          <CommentSection
            summaryId={summary.id}
            onCommentCountChange={(change) => {
              setCommentCount((prev) => prev + change);
              if (currentUserId && change > 0) {
                recommendationService.trackBehavior(currentUserId, summary.id, 'COMMENT')
                  .catch(err => console.error('Error tracking comment:', err));
              }
              if (onSummaryUpdate) {
                onSummaryUpdate({ ...summary, commentCount: commentCount + change });
              }
            }}
          />
        </div>
      )}
    </div>
  );
}

export default SummaryCard;
