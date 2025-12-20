import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { summaryService, savedService } from '../services/api';
import SummaryCard from '../components/SummaryCard';

function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [summaries, setSummaries] = useState([]);
  const [savedSummaries, setSavedSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');

  const getBadgeStyle = (badge) => {
    const styles = {
      PLATINUM: { backgroundColor: '#e8f5e9', color: '#2e7d32', borderColor: '#4caf50' },
      GOLD: { backgroundColor: '#fff9c4', color: '#f57f17', borderColor: '#fdd835' },
      SILVER: { backgroundColor: '#f5f5f5', color: '#616161', borderColor: '#9e9e9e' },
      BRONZE: { backgroundColor: '#ffe0b2', color: '#e65100', borderColor: '#ff9800' },
      NEWBIE: { backgroundColor: '#e3f2fd', color: '#1565c0', borderColor: '#42a5f5' }
    };
    return styles[badge] || styles.NEWBIE;
  };

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true, state: { from: '/profile' } });
      return;
    }
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await summaryService.getSummariesByUserId(user.id);
        setSummaries(response.data.content || []);
      } catch (err) {
        console.error('Error loading user summaries', err);
        setError('Unable to load your submissions right now.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user, navigate]);

  const loadSavedSummaries = async () => {
    if (!user) return;
    try {
      setLoadingSaved(true);
      const response = await savedService.getSavedSummaries(user.id);
      setSavedSummaries(response.data.content || []);
    } catch (err) {
      console.error('Error loading saved summaries', err);
    } finally {
      setLoadingSaved(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'saved' && savedSummaries.length === 0) {
      loadSavedSummaries();
    }
  }, [activeTab]);

  const handleDelete = async (summaryId) => {
    if (!user) return;
    const confirmed = window.confirm('Delete this summary? This action cannot be undone.');
    if (!confirmed) return;
    try {
      setDeleting(summaryId);
      await summaryService.deleteSummary(summaryId, user.id);
      setSummaries((prev) => prev.filter((summary) => summary.id !== summaryId));
    } catch (err) {
      console.error('Error deleting summary', err);
      alert('Unable to delete this summary. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="feed">
      <div className="profile-header">
        <div className="profile-avatar">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <div className="profile-info">
          <h2>{user.username}</h2>
          <p>{user.email}</p>
          <div className="profile-stats-row">
            <span><strong>{summaries.length}</strong> posts</span>
            <span><strong>{user.karma ?? 0}</strong> karma</span>
            <span><strong>{user.totalUpvotes ?? 0}</strong> upvotes</span>
          </div>
          <div className="profile-badge">
            Badge: <span className={`badge badge-${user.badge?.toLowerCase() || 'newbie'}`}>{user.badge ?? 'NEWBIE'}</span>
          </div>
        </div>
      </div>
      <div className="profile-actions">
        <Link to="/submit" className="button edit-profile-button">Submit a Summary</Link>
      </div>

      <div className="profile-tabs">
        <button 
          className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          My Posts
        </button>
        <button 
          className={`tab-button ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          Saved
        </button>
      </div>

      <div className="profile-posts">
        {activeTab === 'posts' && (
          <>
            {loading && <div className="loading">Loading your summaries...</div>}
            {!loading && error && <div className="error">{error}</div>}
            {!loading && !error && summaries.length === 0 && (
              <div className="post-card">
                <p>You haven't submitted anything yet.</p>
                <Link to="/submit" className="button">Share your first summary</Link>
              </div>
            )}

            {!loading && !error && summaries.length > 0 && (
              summaries.map((summary) => (
                <div key={summary.id} className="profile-post-wrapper">
                  <SummaryCard summary={summary} />
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(summary.id)}
                    disabled={deleting === summary.id}
                  >
                    {deleting === summary.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'saved' && (
          <>
            {loadingSaved && <div className="loading">Loading saved summaries...</div>}
            {!loadingSaved && savedSummaries.length === 0 && (
              <div className="post-card">
                <p>You haven't saved any summaries yet.</p>
              </div>
            )}

            {!loadingSaved && savedSummaries.length > 0 && (
              savedSummaries.map((summary) => (
                <SummaryCard key={summary.id} summary={summary} />
              ))
            )}
          </>
        )}
      </div>
    </div>
  );

}

export default ProfilePage;

