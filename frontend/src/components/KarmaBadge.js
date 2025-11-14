// src/components/KarmaBadge.js
import React from 'react';
import './KarmaBadge.css';
import { motion } from 'framer-motion';

export default function KarmaBadge({ karma = 0 }) {
  const level = karma > 800 ? 'Legend' : karma > 400 ? 'Pro' : karma > 150 ? 'Rising' : 'Curious';
  return (
    <motion.div className="karma-card card" initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} transition={{duration:0.4}}>
      <div style={{display:'flex', alignItems:'center', gap:14}}>
        <div className="karma-ring">
          <div className="karma-num">{karma}</div>
        </div>
        <div>
          <div style={{fontWeight:800, fontSize:16}}>{level}</div>
          <div style={{fontSize:13, color:'var(--muted-text)'}}>Karma points — keep posting great summaries</div>
        </div>
      </div>
    </motion.div>
  );
}
