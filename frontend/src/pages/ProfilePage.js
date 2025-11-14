import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { summaryService } from '../services/api';

function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true, state: { from: '/profile' } });
      return;
    }
    const loadSummaries = async () => {
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
    loadSummaries();
  }, [user, navigate]);

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
    <div className="container">
      <div className="profile-card">
        <div>
          <h2>{user.username}</h2>
          <p>{user.email}</p>
        </div>
        <div className="profile-stats">
          <div>
            <span className="profile-stat-label">Karma</span>
            <span className="profile-stat-value">{user.karma ?? 0}</span>
          </div>
          <div>
            <span className="profile-stat-label">Submissions</span>
            <span className="profile-stat-value">{summaries.length}</span>
          </div>
        </div>
        <Link to="/submit" className="button">Submit a Summary</Link>
      </div>

      <div className="summary-card">
        <div className="profile-submissions-header">
          <h3>Your submissions</h3>
        </div>

        {loading && <div className="loading">Loading your summaries...</div>}
        {!loading && error && <div className="error">{error}</div>}
        {!loading && !error && summaries.length === 0 && (
          <div className="empty-state">
            <p>You haven’t submitted anything yet.</p>
            <Link to="/submit" className="button">Share your first summary</Link>
          </div>
        )}

        {!loading && !error && summaries.length > 0 && (
          <ul className="profile-submissions">
            {summaries.map((summary) => (
              <li key={summary.id} className="profile-submission">
                <div>
                  <h4>{summary.title}</h4>
                  <p>{summary.content}</p>
                  <div className="summary-meta">
                    <span>{summary.voteCount || 0} votes</span>
                    <span>•</span>
                    <span>{summary.commentCount || 0} comments</span>
                  </div>
                </div>
                <button
                  className="button button-secondary"
                  onClick={() => handleDelete(summary.id)}
                  disabled={deleting === summary.id}
                >
                  {deleting === summary.id ? 'Deleting…' : 'Delete'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;

