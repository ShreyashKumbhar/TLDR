// src/pages/TrendingPage.js
import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import SummaryCard from '../components/SummaryCard';
import { summaryService } from '../services/api';
import StarsBackground from '../components/StarsBackground';
import './TrendingPage.css';

export default function TrendingPage() {
  const [trending, setTrending] = useState([]);

  const loadTrending = useCallback(async () => {
    try {
      const res = await summaryService.getTrending();

      // ⭐ FIX FOR PAGINATION SHAPE (same as HomePage)
      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.content || [];

      setTrending(list);
    } catch (err) {
      console.error('Failed to load trending:', err);
    }
  }, []);

  useEffect(() => {
    loadTrending();
  }, [loadTrending]);

  return (
    <div className="trending-page">

      <StarsBackground intensity={26} />

      <motion.h1
        className="trending-title"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        🔥 Trending (Last 24 Hours)
      </motion.h1>

      <div className="trending-feed">
        {trending.map((s, index) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.45,
              ease: 'easeOut',
              delay: index * 0.07
            }}
            className="t-feed-item"
          >
            <SummaryCard summary={s} onVote={loadTrending} />
          </motion.div>
        ))}
      </div>

    </div>
  );
}
