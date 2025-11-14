// src/pages/HomePage.js
import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import SummaryCard from '../components/SummaryCard';
import { summaryService } from '../services/api';
import StarsBackground from '../components/StarsBackground';
import './HomePage.css';

export default function HomePage() {
  const [summaries, setSummaries] = useState([]);

  const loadSummaries = useCallback(async () => {
    try {
      const res = await summaryService.getAllSummaries();

      // ⭐ THIS is the important fix:
      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.content || [];

      setSummaries(list);
    } catch (err) {
      console.error('Failed to load summaries:', err);
    }
  }, []);

  useEffect(() => {
    loadSummaries();
  }, [loadSummaries]);

  return (
    <div className="home-page">

      {/* Decorative floating doodles */}
      <div className="home-doodle-left" />
      <div className="home-doodle-right" />

      <StarsBackground intensity={40} />

      <motion.h1
        className="home-title"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Latest Summaries
      </motion.h1>

      <motion.div
        className="home-feed"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.12 }
          }
        }}
      >

        {summaries.map((s) => (
          <motion.div
            key={s.id}
            variants={{
              hidden: { opacity: 0, y: 16 },
              visible: { opacity: 1, y: 0 }
            }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="feed-item"
          >
            <SummaryCard summary={s} onVote={loadSummaries} />
          </motion.div>
        ))}

      </motion.div>
    </div>
  );
}
