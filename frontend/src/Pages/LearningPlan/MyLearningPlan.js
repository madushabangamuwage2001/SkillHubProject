import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MyLearningPlan.css';
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { IoIosCreate } from "react-icons/io";
import NavBar from '../../Components/NavBar/NavBar';
import { HiCalendarDateRange } from "react-icons/hi2";

function MyLearningPlan() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const userId = localStorage.getItem('userID');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:8080/learningPlan');
        const userPosts = response.data.filter(post => post.postOwnerID === userId);
        setPosts(userPosts);
        setFilteredPosts(userPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, []);

  const getEmbedURL = (url) => {
    try {
      if (url.includes('youtube.com/watch')) {
        const videoId = new URL(url).searchParams.get('v');
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      return url;
    } catch (error) {
      console.error('Invalid URL:', url);
      return '';
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this learning plan?');
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:8080/learningPlan/${id}`);
        alert('Learning plan deleted successfully!');
        setFilteredPosts(filteredPosts.filter((post) => post.id !== id));
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete learning plan.');
      }
    }
  };

  const handleUpdate = (id) => {
    window.location.href = `/updateLearningPlan/${id}`;
  };

  const VideoPlayer = ({ videoUrl }) => (
    <div className="MLPvideo-container">
      <video 
        controls
    
        className="MLPpost-video"
      >
        <source src={`http://localhost:8080/learningPlan/planVideos/${videoUrl}`} type="video/mp4" />
        
        Your browser does not support the video tag.
      </video>
    </div>
  );

  const renderPostByTemplate = (post) => {
    if (!post.templateID) {
      return <div className="MLPtemplate MLPtemplate-default">Invalid template ID</div>;
    }

    switch (post.templateID) {
      case 1:
        return (
          <div className="MLPtemplate MLPtemplate-1">
            <div className="MLPtemplate-header">
              <div className="MLPuser-info">
                <p className="MLPuser-name">{post.postOwnerName}</p>
              </div>
              <div className="MLPaction-buttons">
                <FaEdit
                  onClick={() => handleUpdate(post.id)}
                  className="MLPaction-icon MLPedit-icon"
                  title="Edit Learning Plan"
                />
                <RiDeleteBin6Fill
                  onClick={() => handleDelete(post.id)}
                  className="MLPaction-icon MLPdelete-icon"
                  title="Delete Learning Plan"
                />
              </div>
            </div>
            <h3 className="MLPtemplate-title">{post.title}</h3>
            <p className="MLPtemplate-dates"><HiCalendarDateRange /> {post.startDate} to {post.endDate}</p>
            <p className="MLPtemplate-category">{post.category}</p>
            <hr className="MLPtemplate-divider" />
            <p className="MLPtemplate-description" style={{ whiteSpace: "pre-line" }}>{post.description}</p>
            <div className="MLPtemplate-tags">
              {post.tags?.map((tag, index) => (
                <span key={index} className="MLPtemplate-tag">#{tag}</span>
              ))}
            </div>
            {post.imageUrl && (
              <img
                src={`http://localhost:8080/learningPlan/planImages/${post.imageUrl}`}
                alt={post.title}
                className="MLPtemplate-media"
              />
            )}
            {post.videoUrl && <VideoPlayer videoUrl={post.videoUrl} />}
            {post.contentURL && (
              <iframe
                src={getEmbedURL(post.contentURL)}
                title={post.title}
                className="MLPtemplate-media"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            )}
          </div>
        );
      case 2:
        return (
          <div className="MLPtemplate MLPtemplate-2">
            <div className="MLPtemplate-header">
              <div className="MLPuser-info">
                <p className="MLPuser-name">{post.postOwnerName}</p>
              </div>
              <div className="MLPaction-buttons">
                <FaEdit
                  onClick={() => handleUpdate(post.id)}
                  className="MLPaction-icon MLPedit-icon"
                  title="Edit Learning Plan"
                />
                <RiDeleteBin6Fill
                  onClick={() => handleDelete(post.id)}
                  className="MLPaction-icon MLPdelete-icon"
                  title="Delete Learning Plan"
                />
              </div>
            </div>
            <h3 className="MLPtemplate-title">{post.title}</h3>
            <p className="MLPtemplate-dates"><HiCalendarDateRange /> {post.startDate} to {post.endDate}</p>
            <p className="MLPtemplate-category">{post.category}</p>
            <hr className="MLPtemplate-divider" />
            <p className="MLPtemplate-description" style={{ whiteSpace: "pre-line" }}>{post.description}</p>
            <div className="MLPtemplate-tags">
              {post.tags?.map((tag, index) => (
                <span key={index} className="MLPtemplate-tag">#{tag}</span>
              ))}
            </div>
            <div className="MLPtemplate-media-split">
              <div className="MLPtemplate-media-split-item">
                {post.imageUrl && (
                  <img
                    src={`http://localhost:8080/learningPlan/planImages/${post.imageUrl}`}
                    alt={post.title}
                    className="MLPtemplate-media"
                  />
                )}
              </div>
              <div className="MLPtemplate-media-split-item">
                {post.videoUrl && <VideoPlayer videoUrl={post.videoUrl} />}
                {post.contentURL && (
                  <iframe
                    src={getEmbedURL(post.contentURL)}
                    title={post.title}
                    className="MLPtemplate-media"
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                )}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="MLPtemplate MLPtemplate-3">
            <div className="MLPtemplate-header">
              <div className="MLPuser-info">
                <p className="MLPuser-name">{post.postOwnerName}</p>
              </div>
              <div className="MLPaction-buttons">
                <FaEdit
                  onClick={() => handleUpdate(post.id)}
                  className="MLPaction-icon MLPedit-icon"
                  title="Edit Learning Plan"
                />
                <RiDeleteBin6Fill
                  onClick={() => handleDelete(post.id)}
                  className="MLPaction-icon MLPdelete-icon"
                  title="Delete Learning Plan"
                />
              </div>
            </div>
            {post.imageUrl && (
              <img
                src={`http://localhost:8080/learningPlan/planImages/${post.imageUrl}`}
                alt={post.title}
                className="MLPtemplate-media"
              />
            )}
            {post.videoUrl && <VideoPlayer videoUrl={post.videoUrl} />}
            {post.contentURL && (
              <iframe
                src={getEmbedURL(post.contentURL)}
                title={post.title}
                className="MLPtemplate-media"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            )}
            <h3 className="MLPtemplate-title">{post.title}</h3>
            <p className="MLPtemplate-dates"><HiCalendarDateRange /> {post.startDate} to {post.endDate}</p>
            <p className="MLPtemplate-category">{post.category}</p>
            <hr className="MLPtemplate-divider" />
            <p className="MLPtemplate-description" style={{ whiteSpace: "pre-line" }}>{post.description}</p>
            <div className="MLPtemplate-tags">
              {post.tags?.map((tag, index) => (
                <span key={index} className="MLPtemplate-tag">#{tag}</span>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="MLPtemplate MLPtemplate-default">
            <p>Unknown template ID: {post.templateID}</p>
          </div>
        );
    }
  };

  return (
    <div className="MLPmy-learning-plan-container">
      <NavBar />
      <div className="MLPmy-learning-plan-content">
        <h1 className="MLPmy-learning-plan-title">My Learning Plans</h1>
        <button
          className="MLPadd-button"
          onClick={() => (window.location.href = '/addLearningPlan')}
          title="Add New Learning Plan"
        >
          <IoIosCreate className="MLPadd-button-icon" />
        </button>
        <div className="MLPplans-grid">
          {filteredPosts.length === 0 ? (
            <div className="MLPno-plans">
              <div className="MLPno-plans-icon"></div>
              <p className="MLPno-plans-message">No learning plans found. Create your first plan!</p>
              <button
                className="MLPcreate-button"
                onClick={() => (window.location.href = '/addLearningPlan')}
              >
                Create New Plan
              </button>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div key={post.id} className="MLPplan-card">
                {renderPostByTemplate(post)}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default MyLearningPlan;