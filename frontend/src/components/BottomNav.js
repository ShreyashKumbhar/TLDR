import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './BottomNav.css';
import './BottomNav.css';

function BottomNav() {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: '🏠', label: 'Home' },
    { path: '/foryou', icon: '⭐', label: 'For You' },
    { path: '/submit', icon: '➕', label: 'Add' },
    { path: '/trending', icon: '📈', label: 'Trending' },
    { path: '/profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map(item => (
        <Link
          key={item.path}
          to={item.path}
          className={`bottom-nav-item ${location.pathname === item.path ? 'active' : ''}`}
        >
          <span className="bottom-nav-icon">{item.icon}</span>
          <span className="bottom-nav-label">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

export default BottomNav;