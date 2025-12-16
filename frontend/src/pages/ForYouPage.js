import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { recommendationService } from '../services/api';
import SummaryCard from '../components/SummaryCard';

function ForYouPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true, state: { from: '/foryou' } });
      return;
    }
    loadRecommendations();
    
    // Refresh recommendations periodically (every 30 seconds) to catch preference updates
    const refreshInterval = setInterval(() => {
      loadRecommendations();
    }, 30000);
    
    return () => clearInterval(refreshInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const response = await recommendationService.getRecommendations(user.id, 20);
      setRecommendations(response.data || []);
      setError('');
    } catch (err) {
      console.error('Error loading recommendations', err);
      setError('Unable to load recommendations right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (summaryId, feedbackType) => {
    if (!user) return;
    try {
      await recommendationService.submitFeedback(user.id, summaryId, feedbackType);
      // Remove the item from recommendations
      setRecommendations(prev => prev.filter(r => r.summaryId !== summaryId));
    } catch (err) {
      console.error('Error submitting feedback', err);
    }
  };

  const handleSummaryUpdate = (updatedSummary) => {
    setRecommendations((prevRecommendations) =>
      prevRecommendations.map((r) =>
        r.summaryId === updatedSummary.id ? { ...r, ...updatedSummary } : r
      )
    );
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h2>For You</h2>
        <p className="page-subtitle">
          Personalized recommendations based on your interests and activity
        </p>
        <button 
          onClick={loadRecommendations} 
          className="refresh-button"
          style={{ marginTop: '10px', padding: '8px 16px', cursor: 'pointer' }}
        >
          🔄 Refresh Recommendations
        </button>
      </div>

      {loading && <div className="loading">Loading personalized recommendations...</div>}
      {!loading && error && <div className="error">{error}</div>}
      
      {!loading && !error && recommendations.length === 0 && (
        <div className="empty-state">
          <p>We need more information about your preferences to provide recommendations.</p>
          <p>Start by exploring summaries, voting, and commenting!</p>
        </div>
      )}

      {!loading && !error && recommendations.length > 0 && (
        <>
          <div className="recommendations-info">
            <p>Found {recommendations.length} personalized recommendations for you</p>
          </div>
          <div className="recommendations-list">
            {recommendations.map((recommendation) => (
              <RecommendationCard
                key={recommendation.summaryId}
                recommendation={recommendation}
                onFeedback={handleFeedback}
                onSummaryUpdate={handleSummaryUpdate}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function RecommendationCard({ recommendation, onFeedback, onSummaryUpdate }) {
  const [showFeedback, setShowFeedback] = useState(false);

  // Convert recommendation to summary format for SummaryCard
  const summary = {
    id: recommendation.summaryId,
    title: recommendation.title,
    content: recommendation.content,
    originalUrl: recommendation.originalUrl,
    userId: recommendation.userId,
    username: recommendation.username,
    tags: recommendation.tags || [],
    voteCount: recommendation.voteCount || 0,
    commentCount: recommendation.commentCount || 0,
    createdAt: recommendation.createdAt
  };

  return (
    <div className="recommendation-card-wrapper">
      <div className="recommendation-badge">
        <span className="recommendation-score">{(recommendation.score * 100).toFixed(0)}% match</span>
        <span className="recommendation-reason">{recommendation.reason}</span>
      </div>
      <SummaryCard summary={summary} onSummaryUpdate={onSummaryUpdate} />
      <div className="recommendation-feedback">
        <button
          className="feedback-button feedback-positive"
          onClick={() => {
            onFeedback(recommendation.summaryId, 'THUMBS_UP');
            setShowFeedback(false);
          }}
          title="I'm interested in this kind of content"
        >
          👍 Interested
        </button>
        <button
          className="feedback-button feedback-negative"
          onClick={() => {
            onFeedback(recommendation.summaryId, 'NOT_INTERESTED');
            setShowFeedback(false);
          }}
          title="Not interested"
        >
          ✕ Not interested
        </button>
      </div>
    </div>
  );
}

export default ForYouPage;

