// src/components/SummaryCard.js
import React from 'react';
import './SummaryCard.css';
import VoteButton from './VoteButton';
import { motion } from 'framer-motion';

export default function SummaryCard({ summary, onVote }) {
  const { id, title, content, tags = [], userName, voteCount = 0, createdAt } = summary;

  return (
    <motion.article
      className="summary-card fade-in"
      whileHover={{ scale: 1.015 }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <div className="summary-inner">

        {/* ---- LEFT: Vote Button ---- */}
        <div className="vote-section">
          <VoteButton
            initialValue={0}
            summaryId={id}
            onVote={(v) => onVote && onVote(v)}
          />
        </div>

        {/* ---- RIGHT: Content ---- */}
        <div className="content-section">

          {/* Title + Meta */}
          <div className="title-row">
            <div>
              <div className="summary-title">{title}</div>
              <div className="summary-meta">
                by <strong>{userName || 'anonymous'}</strong> · {new Date(createdAt).toLocaleString()}
              </div>
            </div>

            <div className="vote-badge">{voteCount}</div>
          </div>

          {/* Summary text */}
          <p className="summary-text">
            {content}
          </p>

          {/* Tags + Actions */}
          <div className="footer-row">
            <div className="tag-list">
              {tags.map(t => (
                <span className="tag" key={t}>#{t}</span>
              ))}
            </div>

            <div className="actions">
              <a href={summary.originalUrl || '#'} target="_blank" rel="noreferrer" className="btn btn-ghost small-btn">
                Read Source
              </a>
              <a href={`/summaries/${id}`} className="btn small-btn">
                Open
              </a>
            </div>
          </div>

        </div>
      </div>
    </motion.article>
  );
}
