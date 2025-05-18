import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './notification.css';  // Change this line to use existing CSS file
import { RiDeleteBin6Fill } from "react-icons/ri";
import { MdOutlineMarkChatRead } from "react-icons/md";
import NavBar from '../../Components/NavBar/NavBar';
import { FaVideo } from "react-icons/fa";

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const userId = localStorage.getItem('userID');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/notifications/${userId}`);
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        alert('Failed to load notifications.');
      }
    };

    if (userId) {
      fetchNotifications();
    } else {
      alert('Please log in to view notifications.');
    }
  }, [userId]);

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:8080/notifications/${id}/markAsRead`);
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      alert('Failed to mark notification as read.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await axios.delete(`http://localhost:8080/notifications/${id}`);
        setNotifications(notifications.filter((n) => n.id !== id));
      } catch (error) {
        console.error('Error deleting notification:', error);
        alert('Failed to delete notification.');
      }
    }
  };

  const VideoPreview = ({ videoUrl }) => (
    <div className="video-preview-wrapper">
      <video
        controls
        className="video-preview"
        preload="metadata"
      >
        <source src={`http://localhost:8080/notifications/videos/${videoUrl}`} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );

  return (
    <div className="notifications-container">
      <NavBar />
      <div className="notifications-content">
        <h1 className="notifications-title">Notifications</h1>
        <div className="notifications-grid">
          {notifications.length === 0 ? (
            <div className="no-notifications">
              <div className="no-notifications-icon"></div>
              <p className="no-notifications-message">No notifications found.</p>
            </div>
          ) : (
            notifications.map((notification) => (
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
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="action-button mark-read-btn"
                      title="Mark as Read"
                    >
                      <MdOutlineMarkChatRead />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="action-button delete-btn"
                    title="Delete Notification"
                  >
                    <RiDeleteBin6Fill />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationsPage;