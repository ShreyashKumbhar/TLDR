import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/api';

function TopBar() {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadUnreadCount();
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    } else {
      setUnreadCount(0);
    }
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
    <header className="top-bar">
      <div className="top-bar-content">
        <Link to="/search" className="search-link">
          <span className="search-icon">🔍</span>
        </Link>
        <Link to="/" className="logo-link">
          <h1>TLDR</h1>
        </Link>
        <div className="top-actions">
          {user ? (
            <>
              <Link to="/notifications" className="notification-link">
                <span className="notification-icon">🔔</span>
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
              </Link>
              <Link to="/messages" className="message-link">
                <span className="message-icon">💬</span>
              </Link>
            </>
          ) : (
            <Link to="/login" className="login-link">Log In</Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default TopBar;
