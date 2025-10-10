import React, { useState } from 'react';
import { voteService } from '../services/api';

function SummaryCard({ summary }) {
  const [voteCount, setVoteCount] = useState(summary.voteCount || 0);
  const [userVote, setUserVote] = useState(0);
  const currentUserId = 1; // Demo user ID

  const handleVote = async (value) => {
    try {
      if (userVote === value) {
        // Remove vote
        await voteService.removeVote(currentUserId, summary.id);
        setUserVote(0);
        setVoteCount(voteCount - value);
      } else {
        // Cast or change vote
        await voteService.castVote(currentUserId, summary.id, value);
        setVoteCount(voteCount - userVote + value);
        setUserVote(value);
      }
    } catch (error) {
      console.error('Error voting:', error);
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
            className={`vote-button ${userVote === 1 ? 'active' : ''}`}
            onClick={() => handleVote(1)}
          >
            ▲
          </button>
          <span className="vote-count">{voteCount}</span>
          <button 
            className={`vote-button ${userVote === -1 ? 'active' : ''}`}
            onClick={() => handleVote(-1)}
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
            <span>{formatDate(summary.createdAt)}</span>
            <span>•</span>
            <span>{summary.commentCount || 0} comments</span>
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
        </div>
      </div>
    </div>
  );
}

export default SummaryCard;
