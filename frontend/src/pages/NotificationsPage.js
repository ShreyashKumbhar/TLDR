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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications(user.id);
      setNotifications(response.data.content || []);
      setError('');
    } catch (err) {
      console.error('Error loading notifications', err);
      setError('Unable to load notifications right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (notificationId) => {
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

  if (!user) {
    return null;
  }

  return (
    <div className="container">
      <div className="summary-card">
        <div className="profile-submissions-header">
          <h3>Notifications</h3>
          {notifications.length > 0 && (
            <button className="button button-secondary" onClick={handleMarkAllRead}>
              Mark all read
            </button>
          )}
        </div>

        {loading && <div className="loading">Loading notifications...</div>}
        {!loading && error && <div className="error">{error}</div>}
        {!loading && !error && notifications.length === 0 && (
          <div className="empty-state">
            <p>You are all caught up!</p>
          </div>
        )}

        {!loading && !error && notifications.length > 0 && (
          <ul className="notification-list">
            {notifications.map((notification) => (
              <li key={notification.id} className={`notification-item ${notification.read ? 'read' : ''}`}>
                <div>
                  <p className="notification-message">{notification.message}</p>
                  <span className="notification-timestamp">
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                </div>
                {!notification.read && (
                  <button
                    className="button button-secondary"
                    onClick={() => handleMarkRead(notification.id)}
                  >
                    Mark read
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

