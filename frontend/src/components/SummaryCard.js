import React, { useState, useEffect } from 'react';
import { voteService, recommendationService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CommentSection from './CommentSection';

function SummaryCard({ summary, onSummaryUpdate }) {
  const [voteCount, setVoteCount] = useState(summary.voteCount || 0);
  const [userVote, setUserVote] = useState(0);
  const [commentCount, setCommentCount] = useState(summary.commentCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [loadingVote, setLoadingVote] = useState(false);
  const { user } = useAuth();
  const currentUserId = user?.id;

  // Fetch user's existing vote when component mounts
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
          recommendationService.trackBehavior(
            currentUserId, 
            summary.id, 
            value === 1 ? 'UPVOTE' : 'DOWNVOTE'
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
    <div className="summary-card">
      <div className="summary-header">
        <div className="vote-section">
          <button
            className={`vote-button vote-up ${userVote === 1 ? 'active' : ''}`}
            onClick={() => handleVote(1)}
            disabled={!currentUserId || loadingVote}
            title={currentUserId ? (userVote === 1 ? 'Remove upvote' : 'Upvote') : 'Sign in to vote'}
          >
            ▲
          </button>
          <span className="vote-count">{voteCount}</span>
          <button
            className={`vote-button vote-down ${userVote === -1 ? 'active' : ''}`}
            onClick={() => handleVote(-1)}
            disabled={!currentUserId || loadingVote}
            title={currentUserId ? (userVote === -1 ? 'Remove downvote' : 'Downvote') : 'Sign in to vote'}
          >
            ▼
          </button>
        </div>

        <div className="summary-content">
          <h3 className="summary-title">{summary.title}</h3>
          <p className="summary-text">{summary.content}</p>
          
          <div style={{ marginBottom: '10px' }}>
            {summary.tags && summary.tags.map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>

          <div className="summary-meta">
            <span className="summary-author">
              {summary.username || `User ${summary.userId}`}
              {summary.userBadge && (
                <span className={`badge badge-${summary.userBadge.toLowerCase()}`}>
                  {summary.userBadge}
                </span>
              )}
            </span>
            <span>•</span>
            <span>{formatDate(summary.createdAt)}</span>
            <span>•</span>
            <span>{commentCount} comments</span>
            <span>•</span>
            <a 
              href={summary.originalUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="original-link"
            >
              Read Full Article →
            </a>
          </div>
          <div className="summary-actions">
            <button
              className="button button-secondary"
              onClick={() => setShowComments((prev) => !prev)}
            >
              {showComments ? 'Hide Comments' : 'View Comments'}
            </button>
          </div>
        </div>
      </div>
      {showComments && (
        <CommentSection
          summaryId={summary.id}
          onCommentCountChange={(change) => {
            setCommentCount((prev) => prev + change);
            // Track comment behavior
            if (currentUserId && change > 0) {
              recommendationService.trackBehavior(currentUserId, summary.id, 'COMMENT')
                .catch(err => console.error('Error tracking comment:', err));
            }
            // Update parent if callback provided
            if (onSummaryUpdate) {
              onSummaryUpdate({ ...summary, commentCount: commentCount + change });
            }
          }}
        />
      )}
    </div>
  );
}

export default SummaryCard;
