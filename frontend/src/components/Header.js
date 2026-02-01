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
        <div className="top-bar-left"></div>
        <Link to="/" className="logo-link">
          <img src={theme === Themes.DARK ? "/darklogo.png" : "/logo.png"} alt="TLDR" style={{height: '56px'}} />
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
