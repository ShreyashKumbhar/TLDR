// src/pages/SubmitPage.js
import React, { useState } from 'react';
import { summaryService } from '../services/api';
import { motion } from 'framer-motion';
import './SubmitPage.css';
import StarsBackground from '../components/StarsBackground';

export default function SubmitPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [originalUrl, setOriginalUrl] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title,
        content,
        originalUrl,
        tags: tags.split(',').map(t => t.trim()),
      };

      await summaryService.createSummary(payload);

      setStatus("success");
      setTitle("");
      setContent("");
      setOriginalUrl("");
      setTags("");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <div className="submit-wrapper">

      {/* Floating stars */}
      <StarsBackground intensity={28} />

      {/* Doodle Background */}
      <div className="submit-doodle-left" />
      <div className="submit-doodle-right" />

      {/* Page Title */}
      <motion.h1
        className="submit-title page-title soft-rise"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        Submit a News Summary
      </motion.h1>

      {/* Form Card */}
      <motion.form
        className="submit-form glass-card fade-route"
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >

        {/* Title */}
        <div className="form-group">
          <label>Title</label>
          <input
            className="input"
            placeholder="Enter a short descriptive title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Summary */}
        <div className="form-group">
          <label>Summary</label>
          <textarea
            className="input textarea"
            placeholder="Write a concise news summary..."
            value={content}
            onChange={e => setContent(e.target.value)}
            required
          />
        </div>

        {/* URL */}
        <div className="form-group">
          <label>Original Article URL</label>
          <input
            className="input"
            placeholder="https://example.com/news-article"
            value={originalUrl}
            onChange={e => setOriginalUrl(e.target.value)}
          />
        </div>

        {/* Tags */}
        <div className="form-group">
          <label>Tags (comma separated)</label>
          <input
            className="input"
            placeholder="technology, ai, space"
            value={tags}
            onChange={e => setTags(e.target.value)}
          />
        </div>

        {/* Submit Button */}
        <motion.button
          className="btn submit-btn"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          Publish
        </motion.button>

        {/* Status Messages */}
        {status === "success" && (
          <motion.div
            className="status success"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Summary posted 🎉
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            className="status error"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Something went wrong 😕
          </motion.div>
        )}

      </motion.form>
    </div>
  );
}
