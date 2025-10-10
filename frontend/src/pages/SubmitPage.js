import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { summaryService } from '../services/api';

function SubmitPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    originalUrl: '',
    userId: 1, // Default user for demo
    tags: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      await summaryService.createSummary({
        ...formData,
        tags: tagsArray
      });
      navigate('/');
    } catch (error) {
      console.error('Error creating summary:', error);
      alert('Error creating summary. Please try again.');
    }
  };

  return (
    <div className="container">
      <div className="summary-card">
        <h2 style={{ marginBottom: '20px' }}>Submit a New Summary</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              name="title"
              className="form-control"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Summary (TLDR)</label>
            <textarea
              name="content"
              className="form-control"
              value={formData.content}
              onChange={handleChange}
              placeholder="Provide a concise summary highlighting key points..."
              required
            />
          </div>

          <div className="form-group">
            <label>Original Article URL</label>
            <input
              type="url"
              name="originalUrl"
              className="form-control"
              value={formData.originalUrl}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Tags (comma-separated)</label>
            <input
              type="text"
              name="tags"
              className="form-control"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., technology, politics, science"
            />
          </div>

          <button type="submit" className="button">
            Submit Summary
          </button>
        </form>
      </div>
    </div>
  );
}

export default SubmitPage;
