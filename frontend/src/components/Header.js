import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/api';

function Header() {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadUnreadCount();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    } else {
      setUnreadCount(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadUnreadCount = async () => {
    if (!user) return;
    try {
      const response = await notificationService.getUnreadCount(user.id);
      setUnreadCount(response.data || 0);
    } catch (err) {
      console.error('Error loading unread count', err);
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo-link">
          <h1>TLDR</h1>
        </Link>
        <nav className="nav">
          <Link to="/">Home</Link>
          {user && <Link to="/foryou">For You</Link>}
          <Link to="/trending">Trending</Link>
          <Link to="/submit">Submit</Link>
          {user && <Link to="/profile">Profile</Link>}
        </nav>
        <div className="header-actions">
          {user ? (
            <>
              <Link to="/notifications" className="notification-bell-link">
                <span className="notification-bell">🔔</span>
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
              </Link>
              <Link to="/profile" className="button button-secondary">
                {user.username}
              </Link>
              <button className="button button-secondary logout-button" onClick={logout}>
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="button button-secondary">Log In</Link>
              <Link to="/signup" className="button">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
