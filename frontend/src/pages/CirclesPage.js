import React, { useState, useEffect } from 'react';
import { circleService, summaryService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import SummaryCard from '../components/SummaryCard';

function CirclesPage() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [circle, setCircle] = useState(null);
  const [circles, setCircles] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [filter, setFilter] = useState('all'); // all, global, country, local
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [viewingCircle, setViewingCircle] = useState(false);

  useEffect(() => {
    if (id) {
      // Viewing a specific circle - show its summaries
      loadCircle(id);
      loadCircleSummaries(id);
      setViewingCircle(true);
    } else {
      // Browsing all circles
      loadCircles();
      setViewingCircle(false);
    }
  }, [id, filter, page]);

  const loadCircle = async (circleId) => {
    setLoading(true);
    try {
      const response = await circleService.getCircleById(circleId, user?.id);
      setCircle(response.data);
    } catch (error) {
      console.error('Error loading circle:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCircleSummaries = async (circleId) => {
    setLoading(true);
    try {
      const response = await circleService.getSummariesByCircle(circleId, 0, 50);
      setSummaries(response.data.content || response.data || []);
    } catch (error) {
      console.error('Error loading circle summaries:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCircles = async () => {
    setLoading(true);
    try {
      let response;
      if (filter === 'all') {
        response = await circleService.getAllCircles(page, 20, user?.id);
      } else {
        response = await circleService.getCirclesByType(filter.toUpperCase(), page, 20, user?.id);
      }
      setCircles(response.data.content || response.data || []);
    } catch (error) {
      console.error('Error loading circles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (circleId) => {
    if (!user) return;
    try {
      await circleService.followCircle(circleId, user.id);
      if (id) {
        loadCircle(id);
      } else {
        loadCircles();
      }
    } catch (error) {
      console.error('Error following circle:', error);
    }
  };

  const handleUnfollow = async (circleId) => {
    if (!user) return;
    try {
      await circleService.unfollowCircle(circleId, user.id);
      if (id) {
        loadCircle(id);
      } else {
        loadCircles();
      }
    } catch (error) {
      console.error('Error unfollowing circle:', error);
    }
  };

  // If viewing a specific circle, show its summaries
  if (viewingCircle && circle) {
    return (
      <div className="feed">
        <div className="feed-header">
          <h2>{circle.name}</h2>
        </div>
        <p className="feed-description">
          {circle.description || `Posts from ${circle.name}`}
        </p>

        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            {circle.followerCount || 0} followers • {circle.postCount || 0} posts
          </div>
          {user && (
            <button
              className={`button ${circle.isFollowing ? 'secondary' : ''}`}
              onClick={() => circle.isFollowing ? handleUnfollow(circle.id) : handleFollow(circle.id)}
            >
              {circle.isFollowing ? '✓ Following' : '+ Follow'}
            </button>
          )}
        </div>

        {loading ? (
          <div className="loading">Loading posts...</div>
        ) : summaries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No posts yet</h3>
            <p>Be the first to post in this circle!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {summaries.map(summary => (
              <SummaryCard key={summary.id} summary={summary} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Browsing all circles
  return (
    <div className="feed">
      <div className="feed-header">
        <h2>Browse Circles</h2>
      </div>
      <p className="feed-description">
        Discover and follow circles to see relevant content
      </p>

      <div className="sort-buttons" style={{ marginBottom: '24px' }}>
        <button
          className={`sort-button ${filter === 'all' ? 'active' : ''}`}
          onClick={() => { setFilter('all'); setPage(0); }}
        >
          All
        </button>
        <button
          className={`sort-button ${filter === 'global' ? 'active' : ''}`}
          onClick={() => { setFilter('global'); setPage(0); }}
        >
          Global
        </button>
        <button
          className={`sort-button ${filter === 'country' ? 'active' : ''}`}
          onClick={() => { setFilter('country'); setPage(0); }}
        >
          Countries
        </button>
        <button
          className={`sort-button ${filter === 'local' ? 'active' : ''}`}
          onClick={() => { setFilter('local'); setPage(0); }}
        >
          Local
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading circles...</div>
      ) : circles.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🌍</div>
          <h3>No circles found</h3>
          <p>Try a different filter or check back later.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {circles.map(circle => (
            <div key={circle.id} className="post-card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/circles/${circle.id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>
                    {circle.name}
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    {circle.type} {circle.countryCode && `• ${circle.countryCode}`}
                  </div>
                  {circle.description && (
                    <p style={{ margin: '0 0 12px 0', color: 'var(--text-on-surface)' }}>
                      {circle.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    <span>👥 {circle.followerCount || 0} followers</span>
                    <span>📝 {circle.postCount || 0} posts</span>
                  </div>
                </div>
                {user && (
                  <button
                    className={`button ${circle.isFollowing ? 'secondary' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      circle.isFollowing ? handleUnfollow(circle.id) : handleFollow(circle.id);
                    }}
                    style={{ marginLeft: '16px' }}
                  >
                    {circle.isFollowing ? '✓ Following' : '+ Follow'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CirclesPage;

