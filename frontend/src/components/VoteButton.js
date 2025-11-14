// src/components/VoteButton.js
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './VoteButton.css';

export default function VoteButton({ summaryId, initialValue = 0, onVote }) {
  const [value, setValue] = useState(initialValue);
  const [burst, setBurst] = useState(null);

  const handleVote = (v) => {
    const newVal = value === v ? 0 : v;
    setValue(newVal);
    setBurst(newVal);              // trigger glow animation
    onVote && onVote(newVal);
  };

  return (
    <div className="vote-wrapper">

      {/* UPVOTE */}
      <motion.button
        className={`vote-btn up ${value === 1 ? 'active' : ''}`}
        whileTap={{ scale: 0.82 }}
        whileHover={{ scale: 1.15 }}
        onClick={() => handleVote(1)}
      >
        ▲
      </motion.button>

      {/* ANIMATED VOTE NUMBER */}
      <AnimatePresence mode="wait">
        <motion.div
          key={value}
          className="vote-number"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.25 }}
        >
          {value}
        </motion.div>
      </AnimatePresence>

      {/* DOWNVOTE */}
      <motion.button
        className={`vote-btn down ${value === -1 ? 'active' : ''}`}
        whileTap={{ scale: 0.82 }}
        whileHover={{ scale: 1.15 }}
        onClick={() => handleVote(-1)}
      >
        ▼
      </motion.button>

      {/* BURST GLOW */}
      <AnimatePresence>
        {burst !== null && burst !== 0 && (
          <motion.div
            key={`burst-${burst}`}
            className={`vote-burst ${burst === 1 ? 'burst-up' : 'burst-down'}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.45, opacity: 0.55 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            onAnimationEnd={() => setBurst(null)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
