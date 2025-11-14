// src/components/CommentThread.js
import React from 'react';
import { motion } from 'framer-motion';
import './CommentThread.css';

export default function CommentThread({ comments = [], depth = 0 }) {

  return (
    <div className="comment-thread">
      {comments.map((c, idx) => (
        <motion.div
          key={c.id}
          className="comment-bubble"
          style={{ marginLeft: depth * 26 }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.07, duration: 0.38 }}
        >

          {/* HEADER */}
          <div className="comment-header">
            <div className="comment-user">
              <div className="comment-avatar">
                {c.userName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="comment-username">{c.userName || "anonymous"}</span>
            </div>

            <span className="comment-date">
              {new Date(c.createdAt).toLocaleString()}
            </span>
          </div>

          {/* CONTENT */}
          <div className="comment-content">{c.content}</div>

          {/* FOOTER */}
          <div className="comment-footer">
            <button
              className="reply-btn"
              onClick={() => alert("Reply feature coming soon ✨")}
            >
              Reply ↩
            </button>
          </div>

          {/* CHILDREN */}
          {c.children && c.children.length > 0 && (
            <CommentThread comments={c.children} depth={depth + 1} />
          )}

        </motion.div>
      ))}
    </div>
  );
}
