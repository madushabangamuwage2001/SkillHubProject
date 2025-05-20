import React from 'react';
import { IoSend } from 'react-icons/io5';
import { FiSave, FiEdit, FiX } from 'react-icons/fi';
import { MdDelete } from 'react-icons/md';
import './Comment.css';

const CommentSection = ({
  post,
  loggedInUserID,
  newComment,
  setNewComment,
  editingComment,
  setEditingComment,
  handleAddComment,
  handleDeleteComment,
  handleSaveComment,
}) => {
  return (
    <div className="ANPcomment-section">
      <div className="ANPadd-comment">
        <input
          type="text"
          className="ANPcomment-input"
          placeholder="Add a comment..."
          value={newComment[post.id] || ''}
          onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
          onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
          aria-label="Add a comment"
        />
        <button
          className="ANPsend-comment-btn"
          onClick={() => handleAddComment(post.id)}
          aria-label="Send comment"
        >
          <IoSend />
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
                />
                <div className="ANPedit-comment-actions">
                  <button
                    className="ANPcomment-action-btn ANPsave"
                    onClick={() =>
                      handleSaveComment(post.id, comment.id, editingComment.content)
                    }
                    aria-label="Save comment"
                  >
                    <FiSave />
                  </button>
                  <button
                    className="ANPcomment-action-btn ANPcancel"
                    onClick={() => setEditingComment({})}
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
                  onClick={() =>
                    setNewComment({
                      ...newComment,
                      [post.id]: `@${comment.userFullName} `,
                    })
                  }
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
                          aria-label="Edit comment"
                        >
                          <FiEdit />
                        </button>
                        <button
                          className="ANPcomment-action-btn ANPdelete"
                          onClick={() => handleDeleteComment(post.id, comment.id)}
                          aria-label="Delete comment"
                        >
                          <MdDelete />
                        </button>
                      </>
                    )}
                    {post.userID === loggedInUserID && comment.userID !== loggedInUserID && (
                      <button
                        className="ANPcomment-action-btn ANPdelete"
                        onClick={() => handleDeleteComment(post.id, comment.id)}
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
