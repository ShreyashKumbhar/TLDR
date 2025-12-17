import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './BottomNav.css';
import './BottomNav.css';

function BottomNav() {
  const location = useLocation();

  const renderIcon = (iconName) => {
    const iconClass = "nav-icon";
    switch (iconName) {
      case 'home':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
        );
      case 'star':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
          </svg>
        );
      case 'plus':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 4v16m8-8H4"></path>
          </svg>
        );
      case 'trending-up':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"></polyline>
            <polyline points="17,6 23,6 23,12"></polyline>
          </svg>
        );
      case 'user':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        );
      default:
        return null;
    }
  };

  const navItems = [
    { path: '/', icon: 'home', label: 'Home' },
    { path: '/foryou', icon: 'star', label: 'For You' },
    { path: '/submit', icon: 'plus', label: 'Add' },
    { path: '/trending', icon: 'trending-up', label: 'Trending' },
    { path: '/profile', icon: 'user', label: 'Profile' },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map(item => (
        <Link
          key={item.path}
          to={item.path}
          className={`bottom-nav-item ${location.pathname === item.path ? 'active' : ''}`}
        >
          {renderIcon(item.icon)}
          <span className="bottom-nav-label">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

export default BottomNav;