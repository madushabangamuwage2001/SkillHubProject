import React from 'react';
import axios from 'axios';
import { BiSolidLike } from 'react-icons/bi';
import { FaCommentAlt } from 'react-icons/fa';
import './PostInteractions.css';

const PostInteractions = ({ post, loggedInUserID, setPosts, setFilteredPosts }) => {
  const handleLike = async (postId) => {
    if (!loggedInUserID) {
      alert('Please log in to like a post.');
      return;
    }
    try {
      const response = await axios.put(`http://localhost:8080/posts/${postId}/like`, null, {
        params: { userID: loggedInUserID },
      });
      const updatedPost = response.data;
      setPosts((prev) =>
        prev.map((post) => (post.id === postId ? { ...post, likes: updatedPost.likes } : post))
      );
      setFilteredPosts((prev) =>
        prev.map((post) => (post.id === postId ? { ...post, likes: updatedPost.likes } : post))
      );
    } catch (error) {
      console.error('Error liking post:', error);
      alert('Failed to like post.');
    }
  };

  return (
    <div className="ANPpost-interactions">
      <button
        className={`ANPlike-btn ${post.likes?.[loggedInUserID] ? 'ANPliked' : ''}`}
        onClick={() => handleLike(post.id)}
        aria-label={post.likes?.[loggedInUserID] ? 'Unlike post' : 'Like post'}
      >
        <BiSolidLike /> {post.likes ? Object.values(post.likes).filter(Boolean).length : 0}
      </button>
      <span className="ANPcomment-count">
        <FaCommentAlt /> {post.comments?.length || 0} Comments
      </span>
    </div>
  );
};

export default PostInteractions;