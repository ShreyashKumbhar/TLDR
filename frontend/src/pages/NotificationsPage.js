import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/api';

function NotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true, state: { from: '/notifications' } });
      return;
    }
    loadNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications(user.id, 0, 50);
      setNotifications(response.data.content || []);
      setError('');
    } catch (err) {
      console.error('Error loading notifications', err);
      setError('Unable to load notifications right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (notificationId, event) => {
    event?.stopPropagation();
    try {
      await notificationService.markRead(notificationId, user.id);
      setNotifications((prev) => prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (err) {
      console.error('Error marking notification read', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking notifications read', err);
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read when clicked
    if (!notification.read) {
      handleMarkRead(notification.id);
    }
    // Navigate to the home page - user can find the summary there
    // The summary will have the comment visible when they expand comments
    navigate('/');
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'COMMENT_REPLY':
        return '💬';
      case 'COMMENT_LIKE':
        return '❤️';
      default:
        return '🔔';
    }
  };

  if (!user) {
    return null;
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="container">
      <div className="summary-card">
        <div className="profile-submissions-header">
          <h3>Notifications {unreadCount > 0 && <span className="unread-count-badge">{unreadCount}</span>}</h3>
          {notifications.length > 0 && unreadCount > 0 && (
            <button className="button button-secondary" onClick={handleMarkAllRead}>
              Mark all read
            </button>
          )}
        </div>

        {loading && <div className="loading">Loading notifications...</div>}
        {!loading && error && <div className="error">{error}</div>}
        {!loading && !error && notifications.length === 0 && (
          <div className="empty-state">
            <p>You are all caught up! No new notifications.</p>
          </div>
        )}

        {!loading && !error && notifications.length > 0 && (
          <ul className="notification-list">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-icon">{getNotificationIcon(notification.type)}</div>
                <div className="notification-content">
                  <p className="notification-message">{notification.message}</p>
                  <span className="notification-timestamp">{formatTimeAgo(notification.createdAt)}</span>
                </div>
                {!notification.read && (
                  <button
                    className="notification-mark-read"
                    onClick={(e) => handleMarkRead(notification.id, e)}
                    title="Mark as read"
                  >
                    ×
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;

