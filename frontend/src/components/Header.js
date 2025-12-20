import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI, Themes } from '../context/UIContext';
import { notificationService } from '../services/api';

function TopBar() {
  const { user, logout } = useAuth();
  const { theme } = useUI();
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="search-icon">
            <path d="M21 21L16.5 16.5M19 11C19 15.4183 15.4183 19 11 19S3 15.4183 3 11 6.58172 3 11 3 19 6.58172 19 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </Link>
        <Link to="/" className="logo-link">
          <img src={theme === Themes.DARK ? "/darklogo.png" : "/logo.png"} alt="TLDR" style={{height: '40px'}} />
        </Link>
        <div className="top-actions">
          {user ? (
            <>
              <Link to="/notifications" className="notification-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="notification-icon">
                  <path d="M18 8A6 6 0 0 0 6 8C6 14.22 3 16 3 16H21S18 14.22 18 8ZM13.73 21A1.999 1.999 0 0 1 12 22C10.89 22 10 21.11 10 20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
              </Link>
              <Link to="/messages" className="message-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="message-icon">
                  <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
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
