import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUI } from '../context/UIContext';
import { summaryService } from '../services/api';
import SummaryCard from '../components/SummaryCard';

function TrendingPage() {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrending();
  }, []);

  const loadTrending = async () => {
    try {
      setLoading(true);
      const response = await summaryService.getTrendingDigest();
      setTrending(response.data);
    } catch (error) {
      console.error('Error loading trending:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feed wide-feed">
      <div className="feed-header">
        <h2>🔥 Trending</h2>
      </div>
      <p className="feed-description">
        Discover what's hot right now - the most engaging summaries from the community
      </p>

      {loading ? (
        <div className="loading">Loading trending summaries...</div>
      ) : (
        <>
          {trending.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📈</div>
              <h3>Trending Coming Soon</h3>
              <p>The trending feed will populate as more users engage with content.</p>
              <p>Be the first to submit and vote on summaries!</p>
              <div className="empty-actions">
                <Link to="/submit" className="action-button primary">Submit Summary</Link>
              </div>
            </div>
          ) : (
            <>
              <div className="trending-info">
                <p>Showing {trending.length} trending summaries</p>
              </div>
              {trending.map((summary, index) => (
                <div key={summary.id} className="trending-item">
                  <div className="trending-rank">#{index + 1}</div>
                  <SummaryCard summary={summary} />
                </div>
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default TrendingPage;
