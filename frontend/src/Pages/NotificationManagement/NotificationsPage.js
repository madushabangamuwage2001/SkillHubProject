import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './notification.css';
import { RiDeleteBin6Fill } from "react-icons/ri";
import { MdOutlineMarkChatRead } from "react-icons/md";
import NavBar from '../../Components/NavBar/NavBar';

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const userId = localStorage.getItem('userID');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8080/notifications/${userId}`);
        setNotifications(response.data);
        console.log('Fetched notifications:', response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        alert('Failed to load notifications.');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchNotifications();
    } else {
      alert('Please log in to view notifications.');
      setLoading(false);
    }
  }, [userId, refreshTrigger]);

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:8080/notifications/${id}/markAsRead`);
      setNotifications(notifications.map(n => (n.id === id ? { ...n, read: true } : n)));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      alert('Failed to mark notification as read.');
    }
  };

  const handleDelete = async (id) => {
    try {
      setDeletingIds(prev => [...prev, id]);
      await axios.delete(`http://localhost:8080/notifications/${id}`);
      setNotifications(prev => prev.filter(notification => notification.id !== id));
      alert('Notification deleted successfully');
    } catch (error) {
      console.error('Failed to delete notification:', error);
      alert('Failed to delete notification. Please try again.');
    } finally {
      setDeletingIds(prev => prev.filter(itemId => itemId !== id));
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const VideoPreview = ({ videoUrl }) => (
    <div className="video-preview-wrapper">
      <video controls className="video-preview" preload="metadata">
        <source src={`http://localhost:8080/notifications/videos/${videoUrl}`} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );

  return (
    <div className="notifications-container">
      <NavBar />
      <div className="notifications-content">
        <div className="notifications-header">
          <h1 className="notifications-title">Notifications</h1>
          <button
            type="button"
            onClick={handleRefresh}
            className="refresh-button"
            disabled={loading}
          >
            Refresh
          </button>
        </div>
        {loading ? (
          <div className="loading-container">
            <p>Loading notifications...</p>
          </div>
        ) : (
          <div className="notifications-grid">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <p className="no-notifications-message">No notifications found.</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div key={notification.id} className={`notification-card ${notification.read ? 'read' : 'unread'}`}>
                  <div className="notification-content">
                    <div className="notification-header">
                      <p className="noty-topic">{notification.message}</p>
                      <p className="noty-time">
                        {new Date(notification.createdAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    {notification.imageUrl && (
                      <img
                        src={`http://localhost:8080/notifications/images/${notification.imageUrl}`}
                        alt="Notification"
                        className="notification-media"
                      />
                    )}
                    {notification.videoUrl && <VideoPreview videoUrl={notification.videoUrl} />}
                  </div>
                  <div className="noty-action-btn-con">
                    {!notification.read && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="action-button mark-read-btn"
                        title="Mark as Read"
                      >
                        <MdOutlineMarkChatRead />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(notification.id)}
                      className="action-button delete-btn"
                      title="Delete Notification"
                      disabled={deletingIds.includes(notification.id)}
                    >
                      {deletingIds.includes(notification.id) ? 'Deleting...' : <RiDeleteBin6Fill />}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;
