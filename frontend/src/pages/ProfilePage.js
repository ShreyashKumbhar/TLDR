// src/pages/ProfilePage.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import StarsBackground from '../components/StarsBackground';
import { useAuth } from '../context/AuthContext';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user } = useAuth();
  const [karma] = useState(user?.karma || 0);

  // Level thresholds (gamified)
  const levels = [
    { level: 1, name: "Novice", color: "#7A7DBE", xp: 50 },
    { level: 2, name: "Contributor", color: "#8BC28C", xp: 120 },
    { level: 3, name: "Analyst", color: "#E6A56D", xp: 200 },
    { level: 4, name: "Oracle", color: "#D96BD1", xp: 350 },
    { level: 5, name: "Legend", color: "#FFDF72", xp: 500 }
  ];

  // Current level
  const currentLevel = (() => {
    let curr = levels[0];
    for (let lvl of levels) {
      if (karma >= lvl.xp) curr = lvl;
    }
    return curr;
  })();

  // Progress
  const nextLevel = levels.find(l => l.xp > karma);
  const xpForNext = nextLevel ? nextLevel.xp : currentLevel.xp;
  const xpProgress = Math.min((karma / xpForNext) * 100, 100);

  return (
    <div className="profile-page">

      {/* Stars BG */}
      <StarsBackground intensity={26} />

      {/* Doodles */}
      <div className="profile-doodle-left"></div>
      <div className="profile-doodle-right"></div>

      <motion.div
        className="glass-profile profile-card"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        {/* Top — Avatar + Name */}
        <div className="profile-top">
          <div className="avatar">
            {user?.username?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div>
            <h1 className="profile-name">{user?.username}</h1>
            <div className="profile-email">{user?.email}</div>
          </div>
        </div>

        {/* Level Badge */}
        <motion.div
          className="level-badge"
          style={{ background: currentLevel.color }}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          Level {currentLevel.level} — {currentLevel.name}
        </motion.div>

        {/* XP Progress */}
        <div className="xp-bar-wrapper">
          <div className="xp-bar" style={{ width: xpProgress + "%" }}></div>
        </div>

        <div className="xp-text">
          {karma} XP
          {nextLevel ? (
            <> • {xpForNext - karma} XP to next level</>
          ) : (
            <> • Max Level</>
          )}
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Karma</div>
            <div className="stat-value">{karma}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Posts</div>
            <div className="stat-value">{user?.totalPosts || 0}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Saved</div>
            <div className="stat-value">{user?.savedCount || 0}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Votes</div>
            <div className="stat-value">{user?.voteCount || 0}</div>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
