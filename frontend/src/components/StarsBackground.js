// src/components/StarsBackground.js
import React from 'react';
import './StarsBackground.css';

export default function StarsBackground({ intensity = 40, className = '' }) {
  // create star array
  const stars = Array.from({ length: intensity }).map((_, i) => {
    const size = Math.random() * 2 + 0.6;
    const left = Math.random() * 100;
    const top = Math.random() * 100;
    const delay = Math.random() * 20;
    const opacity = 0.08 + Math.random() * 0.25;
    return (
      <div
        key={i}
        className="star"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          left: `${left}%`,
          top: `${top}%`,
          animationDelay: `${delay}s`,
          opacity
        }}
      />
    );
  });

  return <div className={`stars-wrap ${className}`}>{stars}</div>;
}
