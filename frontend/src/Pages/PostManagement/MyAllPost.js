import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IoSend, IoCreate } from 'react-icons/io5';
import { FaEdit, FaCommentAlt } from 'react-icons/fa';
import { RiDeleteBin6Fill } from 'react-icons/ri';
import { BiSolidLike } from 'react-icons/bi';
import { MdDelete } from 'react-icons/md';
import { GrUpdate } from 'react-icons/gr';
import { FiSave } from 'react-icons/fi';
import { TbPencilCancel } from 'react-icons/tb';
import Modal from 'react-modal';
import NavBar from '../../Components/NavBar/NavBar';
import './MyAllPost.css';

Modal.setAppElement('#root');

function MyAllPost() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [postOwners, setPostOwners] = useState({});
  const [showMyPosts, setShowMyPosts] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [followedUsers, setFollowedUsers] = useState([]);
  const [newComment, setNewComment] = useState({});
  const [editingComment, setEditingComment] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const loggedInUserID = localStorage.getItem('userID');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:8080/posts');
        const userID = localStorage.getItem('userID');
        const userPosts = response.data.filter((post) => post.userID === userID);

        setPosts(userPosts);
        setFilteredPosts(userPosts);

        const userIDs = [...new Set(userPosts.map((post) => post.userID))];
        const ownerPromises = userIDs.map((userID) =>
          axios
            .get(`http://localhost:8080/user/${userID}`)
            .then((res) => ({
              userID,
              fullName: res.data.fullname || 'Anonymous',
            }))
            .catch((error) => {
              console.error(`Error fetching user details for userID ${userID}:`, error);
              return { userID, fullName: 'Anonymous' };
            })
        );
        const owners = await Promise.all(ownerPromises);
        setPostOwners(owners.reduce((acc, owner) => ({ ...acc, [owner.userID]: owner.fullName }), {}));
      } catch (error) {
        console.error('Error fetching posts:', error);
        alert('Failed to load posts.');
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    const fetchFollowedUsers = async () => {
      const userID = localStorage.getItem('userID');
      if (userID) {
        try {
          const response = await axios.get(`http://localhost:8080/user/${userID}/followedUsers`);
          setFollowedUsers(response.data);
        } catch (error) {
          console.error('Error fetching followed users:', error);
        }
      }
    };

    fetchFollowedUsers();
  }, []);

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await axios.delete(`http://localhost:8080/posts/${postId}`);
      setPosts(posts.filter((post) => post.id !== postId));
      setFilteredPosts(filteredPosts.filter((post) => post.id !== postId));
      alert('Post deleted successfully!');
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post.');
    }
  };

  const handleUpdate = (postId) => {
    navigate(`/updatePost/${postId}`);
  };

  const handleMyPostsToggle = () => {
    setShowMyPosts(!showMyPosts);
    setFilteredPosts(showMyPosts ? posts : posts.filter((post) => post.userID === loggedInUserID));
  };

  const handleLike = async (postId) => {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      alert('Please log in to like a post.');
      return;
    }
    try {
      const response = await axios.put(`http://localhost:8080/posts/${postId}/like`, null, {
        params: { userID },
      });
      setPosts((prev) =>
        prev.map((post) => (post.id === postId ? { ...post, likes: response.data.likes } : post))
      );
      setFilteredPosts((prev) =>
        prev.map((post) => (post.id === postId ? { ...post, likes: response.data.likes } : post))
      );
    } catch (error) {
      console.error('Error liking post:', error);
      alert('Failed to like post.');
    }
  };

  const handleFollowToggle = async (postOwnerID) => {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      alert('Please log in to follow/unfollow users.');
      return;
    }
    try {
      if (followedUsers.includes(postOwnerID)) {
        await axios.put(`http://localhost:8080/user/${userID}/unfollow`, {
          unfollowUserID: postOwnerID,
        });
        setFollowedUsers(followedUsers.filter((id) => id !== postOwnerID));
      } else {
        await axios.put(`http://localhost:8080/user/${userID}/follow`, {
          followUserID: postOwnerID,
        });
        setFollowedUsers([...followedUsers, postOwnerID]);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      alert('Failed to update follow status.');
    }
  };

  const handleAddComment = async (postId) => {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      alert('Please log in to comment.');
      return;
    }
    const content = (newComment[postId] || '').trim();
    if (!content) {
      alert('Comment cannot be empty.');
      return;
    }
    try {
      const response = await axios.post(`http://localhost:8080/posts/${postId}/comment`, {
        userID,
        content,
      });
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, comments: response.data.comments } : post
        )
      );
      setFilteredPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, comments: response.data.comments } : post
        )
      );
      setNewComment({ ...newComment, [postId]: '' });
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment.');
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      const userID = localStorage.getItem('userID');
      await axios.delete(`http://localhost:8080/posts/${postId}/comment/${commentId}`, {
        params: { userID },
      });
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, comments: post.comments.filter((c) => c.id !== commentId) }
            : post
        )
      );
      setFilteredPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, comments: post.comments.filter((c) => c.id !== commentId) }
            : post
        )
      );
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment.');
    }
  };

  const handleSaveComment = async (postId, commentId, content) => {
    if (!content.trim()) {
      alert('Comment cannot be empty.');
      return;
    }
    try {
      const userID = localStorage.getItem('userID');
      await axios.put(`http://localhost:8080/posts/${postId}/comment/${commentId}`, {
        userID,
        content,
      });
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: post.comments.map((c) =>
                  c.id === commentId ? { ...c, content } : c
                ),
              }
            : post
        )
      );
      setFilteredPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: post.comments.map((c) =>
                  c.id === commentId ? { ...c, content } : c
                ),
              }
            : post
        )
      );
      setEditingComment({});
    } catch (error) {
      console.error('Error saving comment:', error);
      alert('Failed to save comment.');
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.description.toLowerCase().includes(query) ||
        (post.category || '').toLowerCase().includes(query)
    );
    setFilteredPosts(showMyPosts ? filtered.filter((post) => post.userID === loggedInUserID) : filtered);
  };

  const openModal = (mediaUrl) => {
    setSelectedMedia(mediaUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedMedia(null);
    setIsModalOpen(false);
  };

  return (
    <div className="MAPmy-posts-container">
      <NavBar />
      <div className="MAPmy-posts-content">
        <div className="MAPposts-header">
          <h1 className="MAPposts-title">My Posts</h1>
          <div className="MAPposts-controls">
            <input
              type="text"
              className="MAPsearch-input"
              placeholder="Search by title, description, or category"
              value={searchQuery}
              onChange={handleSearch}
            />
            <button
              className={`MAPtoggle-my-posts-btn ${showMyPosts ? 'MAPactive' : ''}`}
              onClick={handleMyPostsToggle}
            >
              {showMyPosts ? 'All Posts' : 'My Posts'}
            </button>
          </div>
        </div>
        <button
          className="MAPcreate-post-btn"
          onClick={() => navigate('/addNewPost')}
          title="Create New Post"
        >
          <IoCreate />
        </button>
        <div className="MAPposts-grid">
          {filteredPosts.length === 0 ? (
            <div className="MAPno-posts">
              <div className="MAPno-posts-icon"></div>
              <p className="MAPno-posts-message">No posts found. Create your first post!</p>
              <button className="MAPcreate-post-link" onClick={() => navigate('/addNewPost')}>
                Create New Post
              </button>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div key={post.id} className="MAPpost-card">
                <div className="MAPpost-header">
                  <div className="MAPuser-info">
                    <span className="MAPuser-name">{postOwners[post.userID] || 'Anonymous'}</span>
                    <span className="MAPpost-date">
                      {new Date(post.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  {post.userID !== loggedInUserID && (
                    <button
                      className={`MAPfollow-btn ${followedUsers.includes(post.userID) ? 'MAPunfollow' : ''}`}
                      onClick={() => handleFollowToggle(post.userID)}
                    >
                      {followedUsers.includes(post.userID) ? 'Unfollow' : 'Follow'}
                    </button>
                  )}
                  {post.userID === loggedInUserID && (
                    <div className="MAPpost-actions">
                      <button
                        className="MAPaction-btn MAPedit-btn"
                        onClick={() => handleUpdate(post.id)}
                        title="Edit Post"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="MAPaction-btn MAPdelete-btn"
                        onClick={() => handleDelete(post.id)}
                        title="Delete Post"
                      >
                        <RiDeleteBin6Fill />
                      </button>
                    </div>
                  )}
                </div>
                <div className="MAPpost-content">
                  <h2 className="MAPpost-title">{post.title}</h2>
                  <p className="MAPpost-description" style={{ whiteSpace: 'pre-line' }}>
                    {post.description}
                  </p>
                  <p className="MAPpost-category">Category: {post.category || 'Uncategorized'}</p>
                </div>
                <div className="MAPmedia-grid">
                  {post.media.length === 3 ? (
                    <div className="MAPthree-image-layout">
                      <div className="MAPmain-image">
                        <img
                          className="MAPmedia-preview"
                          src={`http://localhost:8080${post.media[0]}`}
                          alt="Main media"
                          onClick={() => openModal(post.media[0])}
                        />
                      </div>
                      <div className="MAPsecondary-images">
                        <img
                          className="MAPmedia-preview"
                          src={`http://localhost:8080${post.media[1]}`}
                          alt="Second media"
                          onClick={() => openModal(post.media[1])}
                        />
                        <img
                          className="MAPmedia-preview"
                          src={`http://localhost:8080${post.media[2]}`}
                          alt="Third media"
                          onClick={() => openModal(post.media[2])}
                        />
                      </div>
                    </div>
                  ) : (
                    post.media.slice(0, 4).map((mediaUrl, index) => (
                      <div
                        key={index}
                        className={`MAPmedia-item ${post.media.length > 4 && index === 3 ? 'MAPmedia-overlay' : ''}`}
                        onClick={() => openModal(mediaUrl)}
                      >
                        {mediaUrl.endsWith('.mp4') ? (
                          <video className="MAPmedia-preview">
                            <source src={`http://localhost:8080${mediaUrl}`} type="video/mp4" />
                          </video>
                        ) : (
                          <img
                            className="MAPmedia-preview"
                            src={`http://localhost:8080${mediaUrl}`}
                            alt={`Media ${index}`}
                          />
                        )}
                        {post.media.length > 4 && index === 3 && (
                          <div className="MAPoverlay-text">+{post.media.length - 4}</div>
                        )}
                      </div>
                    ))
                  )}
                </div>
                <div className="MAPpost-footer">
                  <div className="MAPinteraction-bar">
                    <button
                      className={`MAPlike-btn ${post.likes?.[loggedInUserID] ? 'MAPliked' : ''}`}
                      onClick={() => handleLike(post.id)}
                    >
                      <BiSolidLike />{' '}
                      {Object.values(post.likes || {}).filter((liked) => liked).length}
                    </button>
                    <span className="MAPcomment-count">
                      <FaCommentAlt /> {post.comments?.length || 0}
                    </span>
                  </div>
                  <div className="MAPcomment-section">
                    <div className="MAPadd-comment">
                      <input
                        type="text"
                        className="MAPcomment-input"
                        placeholder="Add a comment..."
                        value={newComment[post.id] || ''}
                        onChange={(e) =>
                          setNewComment({ ...newComment, [post.id]: e.target.value })
                        }
                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                      />
                      <button
                        className="MAPsend-comment-btn"
                        onClick={() => handleAddComment(post.id)}
                      >
                        <IoSend />
                      </button>
                    </div>
                    {post.comments?.map((comment) => (
                      <div key={comment.id} className="MAPcomment">
                        <div className="MAPcomment-content">
                          <span className="MAPcomment-username">{comment.userFullName}</span>
                          {editingComment.id === comment.id ? (
                            <input
                              type="text"
                              className="MAPedit-comment-input"
                              value={editingComment.content}
                              onChange={(e) =>
                                setEditingComment({ ...editingComment, content: e.target.value })
                              }
                              autoFocus
                            />
                          ) : (
                            <p className="MAPcomment-text">{comment.content}</p>
                          )}
                        </div>
                        {(comment.userID === loggedInUserID || post.userID === loggedInUserID) && (
                          <div className="MAPcomment-actions">
                            {comment.userID === loggedInUserID &&
                              (editingComment.id === comment.id ? (
                                <>
                                  <button
                                    className="MAPcomment-action-btn MAPsave"
                                    onClick={() =>
                                      handleSaveComment(post.id, comment.id, editingComment.content)
                                    }
                                  >
                                    <FiSave />
                                  </button>
                                  <button
                                    className="MAPcomment-action-btn MAPcancel"
                                    onClick={() => setEditingComment({})}
                                  >
                                    <TbPencilCancel />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    className="MAPcomment-action-btn MAPedit"
                                    onClick={() =>
                                      setEditingComment({ id: comment.id, content: comment.content })
                                    }
                                  >
                                    <GrUpdate />
                                  </button>
                                  <button
                                    className="MAPcomment-action-btn MAPdelete"
                                    onClick={() => handleDeleteComment(post.id, comment.id)}
                                  >
                                    <MdDelete />
                                  </button>
                                </>
                              ))}
                            {post.userID === loggedInUserID && comment.userID !== loggedInUserID && (
                              <button
                                className="MAPcomment-action-btn MAPdelete"
                                onClick={() => handleDeleteComment(post.id, comment.id)}
                              >
                                <MdDelete />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Media Modal"
        className="MAPmedia-modal"
        overlayClassName="MAPmedia-modal-overlay"
      >
        <button className="MAPclose-modal-btn" onClick={closeModal} title="Close">
          ×
        </button>
        {selectedMedia?.endsWith('.mp4') ? (
          <video controls className="MAPmodal-media">
            <source src={`http://localhost:8080${selectedMedia}`} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <img
            src={`http://localhost:8080${selectedMedia}`}
            alt="Full Media"
            className="MAPmodal-media"
          />
        )}
      </Modal>
    </div>
  );
}

export default MyAllPost;