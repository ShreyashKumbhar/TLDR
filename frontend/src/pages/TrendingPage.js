import React, { useState, useEffect } from 'react';
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
    <div className="feed">
      <div className="feed-header">
        <h2>🔥 Trending</h2>
      </div>
      <p className="feed-description">
        Top summaries from the last 24 hours
      </p>

      {loading ? (
        <div className="loading">Loading trending summaries...</div>
      ) : (
        <>
          {trending.length === 0 ? (
            <div className="post-card">
              <p>No trending summaries yet. Be the first to submit!</p>
            </div>
          ) : (
            trending.map(summary => (
              <SummaryCard key={summary.id} summary={summary} />
            ))
          )}
        </>
      )}
    </div>
  );
}

export default TrendingPage;
