import React, { useState } from 'react';
import axios from 'axios';
import { IoSend } from 'react-icons/io5';
import { FiSave, FiEdit, FiX } from 'react-icons/fi';
import { MdDelete } from 'react-icons/md';
import './Comment.css';

const CommentSection = ({ post, loggedInUserID, updatePostComments }) => {
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const validateComment = (content) => {
    const trimmed = content.trim();

    if (!trimmed) return 'Comment cannot be empty.';
    if (trimmed.length > 500) return 'Comment cannot exceed 500 characters.';

    const htmlTagPattern = /<\/?[a-z][\s\S]*>/i;
    if (htmlTagPattern.test(trimmed)) return 'HTML tags are not allowed.';

    const repeatPattern = /(.)\1{4,}/;
    if (repeatPattern.test(trimmed)) return 'Avoid repeating characters too much.';


    const bannedWords = ['badword1', 'badword2', 'badword3'];
    if (bannedWords.some(word => trimmed.toLowerCase().includes(word))) {
      return 'Inappropriate content is not allowed.';
    }

    const onlyMention = /^@\w+\s*$/;
    if (onlyMention.test(trimmed)) return 'You must add a message with your reply.';

    return null;
  };

  const handleAddComment = async () => {
    if (!loggedInUserID) {
      alert('Please log in to comment.');
      return;
    }

    const validationError = validateComment(newComment);
    if (validationError) {
      setError(validationError);
      return;
    }

    const content = newComment.trim();
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(`http://localhost:8080/posts/${post.id}/comment`, {
        userID: loggedInUserID,
        content,
      });
      updatePostComments(post.id, response.data.comments);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveComment = async (commentId, content) => {
    const validationError = validateComment(content);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await axios.put(`http://localhost:8080/posts/${post.id}/comment/${commentId}`, {
        userID: loggedInUserID,
        content,
      });
      updatePostComments(
        post.id,
        post.comments.map((c) => (c.id === commentId ? { ...c, content } : c))
      );
      setEditingComment({});
    } catch (error) {
      console.error('Error saving comment:', error);
      setError('Failed to save comment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    setIsLoading(true);
    setError(null);
    try {
      await axios.delete(`http://localhost:8080/posts/${post.id}/comment/${commentId}`, {
        params: { userID: loggedInUserID },
      });
      updatePostComments(
        post.id,
        post.comments.filter((c) => c.id !== commentId)
      );
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError('Failed to delete comment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // const handleReply = (username) => {
  //   setNewComment(`@${username} `);
  //   document.querySelector('.ANPcomment-input').focus();
  // };

  const handleReply = (username) => {
  const content = newComment;
  const validationError = validateComment(content);
  if (validationError) {
    setError(validationError);
    return;
  }

  setNewComment(`@${username} `);
  document.querySelector('.ANPcomment-input')?.focus(); 
};


  return (
    <div className="ANPcomment-section">
      {error && <div className="ANPerror-message">{error}</div>}
      <div className="ANPadd-comment">
        <input
          type="text"
          className="ANPcomment-input"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
          aria-label="Add a comment"
          disabled={isLoading}
        />
        <button
          className="ANPsend-comment-btn"
          onClick={handleAddComment}
          disabled={isLoading}
          aria-label="Send comment"
        >
          {isLoading ? '...' : <IoSend />}
        </button>
      </div>
      {post.comments?.map((comment) => (
        <div key={comment.id} className="ANPcomment">
          <div className="ANPcomment-content">
            <span className="ANPcomment-username">{comment.userFullName}</span>
            {editingComment.id === comment.id ? (
              <div className="ANPedit-comment-container">
                <input
                  type="text"
                  className="ANPedit-comment-input"
                  value={editingComment.content}
                  onChange={(e) =>
                    setEditingComment({ ...editingComment, content: e.target.value })
                  }
                  autoFocus
                  aria-label="Edit comment"
                  disabled={isLoading}
                />
                <div className="ANPedit-comment-actions">
                  <button
                    className="ANPcomment-action-btn ANPsave"
                    onClick={() => handleSaveComment(comment.id, editingComment.content)}
                    disabled={isLoading}
                    aria-label="Save comment"
                  >
                    <FiSave />
                  </button>
                  <button
                    className="ANPcomment-action-btn ANPcancel"
                    onClick={() => setEditingComment({})}
                    disabled={isLoading}
                    aria-label="Cancel edit"
                  >
                    <FiX />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="ANPcomment-text">{comment.content}</p>
                <button
                  className="ANPcomment-reply-btn"
                  onClick={() => handleReply(comment.userFullName)}
                  aria-label={`Reply to ${comment.userFullName}`}
                >
                  Reply
                </button>
                {(comment.userID === loggedInUserID || post.userID === loggedInUserID) && (
                  <div className="ANPcomment-actions">
                    {comment.userID === loggedInUserID && (
                      <>
                        <button
                          className="ANPcomment-action-btn ANPedit"
                          onClick={() =>
                            setEditingComment({ id: comment.id, content: comment.content })
                          }
                          disabled={isLoading}
                          aria-label="Edit comment"
                        >
                          <FiEdit />
                        </button>
                        <button
                          className="ANPcomment-action-btn ANPdelete"
                          onClick={() => handleDeleteComment(comment.id)}
                          disabled={isLoading}
                          aria-label="Delete comment"
                        >
                          <MdDelete />
                        </button>
                      </>
                    )}
                    {post.userID === loggedInUserID && comment.userID !== loggedInUserID && (
                      <button
                        className="ANPcomment-action-btn ANPdelete"
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={isLoading}
                        aria-label="Delete comment"
                      >
                        <MdDelete />
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommentSection;
