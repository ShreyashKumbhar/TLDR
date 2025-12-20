import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { summaryService } from '../services/api';
import { useAuth } from '../context/AuthContext';

function SubmitPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    originalUrl: '',
    tags: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    try {
      const tagsArray = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag);

      await summaryService.createSummary({
        title: formData.title.trim(),
        content: formData.content.trim(),
        originalUrl: formData.originalUrl.trim(),
        userId: user.id,
        tags: tagsArray
      });

      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error creating summary:', error);
      const message = error.response?.data?.message || 'Error creating summary. Please try again.';
      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="feed">
        <div className="feed-background">
          <div className="background-pattern"></div>
        </div>
        <div className="feed-header">
          <h2>Submit Summary</h2>
        </div>
        <p className="feed-description">
          Share knowledge with the community
        </p>
        <div className="submit-placeholder">
          <div className="placeholder-icon">📝</div>
          <h3>Sign in to contribute</h3>
          <p>You need an account to share new summaries with the community.</p>
          <div className="empty-actions">
            <Link to="/login" className="action-button primary">Sign In</Link>
            <Link to="/signup" className="action-button secondary">Create Account</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="feed">
      <div className="feed-background">
        <div className="background-pattern"></div>
      </div>
      <div className="feed-header">
        <h2>Submit Summary</h2>
      </div>
      <p className="feed-description">
        Share valuable insights and help others learn faster
      </p>
      <div className="submit-container">
        <div className="summary-card submit-form">
          <div className="submit-intro">
            <h3>Contribute to the Knowledge Base</h3>
            <p>Help others discover and understand important topics by submitting high-quality summaries.</p>
          </div>

          {errorMessage && <div className="error">{errorMessage}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                type="text"
                name="title"
                className="form-control"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter a clear, descriptive title"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="content">Summary (TLDR)</label>
              <textarea
                id="content"
                name="content"
                className="form-control"
                value={formData.content}
                onChange={handleChange}
                placeholder="Provide a concise summary highlighting key points..."
                rows="6"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="originalUrl">Original Article URL</label>
              <input
                id="originalUrl"
                type="url"
                name="originalUrl"
                className="form-control"
                value={formData.originalUrl}
                onChange={handleChange}
                placeholder="https://example.com/article"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="tags">Tags (comma-separated)</label>
              <input
                id="tags"
                type="text"
                name="tags"
                className="form-control"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g., technology, politics, science"
              />
            </div>

            <button type="submit" className="button" disabled={submitting}>
              {submitting ? 'Submitting...' : '🚀 Submit Summary'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SubmitPage;
