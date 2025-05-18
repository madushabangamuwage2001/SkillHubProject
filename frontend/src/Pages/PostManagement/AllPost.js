import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IoSend, IoCreate } from 'react-icons/io5';
import { FaEdit, FaUserGraduate, FaCommentAlt } from 'react-icons/fa';
import { RiDeleteBin6Fill } from 'react-icons/ri';
import { BiSolidLike } from 'react-icons/bi';
import { MdDelete } from 'react-icons/md';
import { GrUpdate } from 'react-icons/gr';
import { FiSave } from 'react-icons/fi';
import { TbPencilCancel } from 'react-icons/tb';
import Modal from 'react-modal';
import NavBar from '../../Components/NavBar/NavBar';
import Pro from '../../Components/NavBar/img/img.png';
import { fetchUserDetails } from '../../Pages/UserManagement/UserProfile';
import './AllPost.css';

Modal.setAppElement('#root');

function AllPost() {
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
  const [userProfileImage, setUserProfileImage] = useState(null);
  const [googleProfileImage, setGoogleProfileImage] = useState(null);
  const [userType, setUserType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const loggedInUserID = localStorage.getItem('userID');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const postResponse = await axios.get('http://localhost:8080/posts');
        const fetchedPosts = postResponse.data;
        setPosts(fetchedPosts);
        setFilteredPosts(fetchedPosts);

        const userIDs = [...new Set(fetchedPosts.map((post) => post.userID))];
        const ownerPromises = userIDs.map(async (userID) => {
          try {
            const res = await axios.get(`http://localhost:8080/user/${userID}`);
            return { userID, fullName: res.data.fullname || 'Anonymous' };
          } catch (error) {
            if (error.response?.status === 404) {
              setPosts((prev) => prev.filter((post) => post.userID !== userID));
              setFilteredPosts((prev) => prev.filter((post) => post.userID !== userID));
              return { userID, fullName: 'Anonymous' };
            }
            console.error(`Error fetching user ${userID}:`, error);
            return { userID, fullName: 'Anonymous' };
          }
        });
        const owners = await Promise.all(ownerPromises);
        setPostOwners(owners.reduce((acc, owner) => ({ ...acc, [owner.userID]: owner.fullName }), {}));

        if (loggedInUserID) {
          const followResponse = await axios.get(`http://localhost:8080/user/${loggedInUserID}/followedUsers`);
          setFollowedUsers(followResponse.data);
        }

        const storedUserType = localStorage.getItem('userType');
        setUserType(storedUserType);
        if (storedUserType === 'google') {
          const googleImage = localStorage.getItem('googleProfileImage');
          setGoogleProfileImage(googleImage);
        } else if (loggedInUserID) {
          const data = await fetchUserDetails(loggedInUserID);
          if (data?.profilePicturePath) {
            setUserProfileImage(`http://localhost:8080/uploads/profile/${data.profilePicturePath}`);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to load posts.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [loggedInUserID]);

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await axios.delete(`http://localhost:8080/posts/${postId}`);
      setPosts((prev) => prev.filter((post) => post.id !== postId));
      setFilteredPosts((prev) => prev.filter((post) => post.id !== postId));
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
    setShowMyPosts((prev) => {
      const newShowMyPosts = !prev;
      setFilteredPosts(newShowMyPosts ? posts.filter((post) => post.userID === loggedInUserID) : posts);
      return newShowMyPosts;
    });
  };

  const handleLike = async (postId) => {
    if (!loggedInUserID) {
      alert('Please log in to like a post.');
      return;
    }
    try {
      const response = await axios.put(`http://localhost:8080/posts/${postId}/like`, null, {
        params: { userID: loggedInUserID },
      });
      const updatedLikes = response.data.likes;
      setPosts((prev) =>
        prev.map((post) => (post.id === postId ? { ...post, likes: updatedLikes } : post))
      );
      setFilteredPosts((prev) =>
        prev.map((post) => (post.id === postId ? { ...post, likes: updatedLikes } : post))
      );
    } catch (error) {
      console.error('Error liking post:', error);
      alert('Failed to like post.');
    }
  };

  const handleFollowToggle = async (postOwnerID) => {
    if (!loggedInUserID) {
      alert('Please log in to follow/unfollow users.');
      return;
    }
    try {
      if (followedUsers.includes(postOwnerID)) {
        await axios.put(`http://localhost:8080/user/${loggedInUserID}/unfollow`, {
          unfollowUserID: postOwnerID,
        });
        setFollowedUsers((prev) => prev.filter((id) => id !== postOwnerID));
      } else {
        await axios.put(`http://localhost:8080/user/${loggedInUserID}/follow`, {
          followUserID: postOwnerID,
        });
        setFollowedUsers((prev) => [...prev, postOwnerID]);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      alert('Failed to update follow status.');
    }
  };

  const handleAddComment = async (postId) => {
    if (!loggedInUserID) {
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
        userID: loggedInUserID,
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
      setNewComment((prev) => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment.');
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await axios.delete(`http://localhost:8080/posts/${postId}/comment/${commentId}`, {
        params: { userID: loggedInUserID },
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
      await axios.put(`http://localhost:8080/posts/${postId}/comment/${commentId}`, {
        userID: loggedInUserID,
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

  if (isLoading) {
    return (
      <div className="ANPloading-container">
        <div className="ANPloading-spinner"></div>
        <p>Loading posts...</p>
      </div>
    );
  }

  return (
    <div className="ANPall-posts-container">
      <NavBar />
      <div className="ANPall-posts-content">
        <div className="ANPposts-header">
          <h1 className="ANPposts-title">Explore Posts</h1>
          <div className="ANPposts-controls">
            <input
              type="text"
              className="ANPsearch-input"
              placeholder="Search by title, description, or category"
              value={searchQuery}
              onChange={handleSearch}
            />
            <button
              className={`ANPtoggle-my-posts-btn ${showMyPosts ? 'ANPactive' : ''}`}
              onClick={handleMyPostsToggle}
            >
              {showMyPosts ? 'All Posts' : 'My Posts'}
            </button>
          </div>
        </div>
        <button
          className="ANPcreate-post-btn"
          onClick={() => navigate('/addNewPost')}
          title="Create New Post"
        >
          <IoCreate />
        </button>
        <div className="ANPposts-grid">
          {filteredPosts.length === 0 ? (
            <div className="ANPno-posts">
              <div className="ANPno-posts-icon"></div>
              <p className="ANPno-posts-message">
                {showMyPosts ? 'You haven’t created any posts yet.' : 'No posts found.'}
              </p>
              <button className="ANPcreate-post-link" onClick={() => navigate('/addNewPost')}>
                Create New Post
              </button>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div key={post.id} className="ANPpost-card">
                <div className="ANPpost-header">
                  <div className="ANPuser-info">
                    {googleProfileImage ? (
                      <img
                        src={googleProfileImage}
                        alt="Profile"
                        className="ANPuser-avatar"
                        onError={(e) => (e.target.src = Pro)}
                        onClick={() => navigate('/googalUserPro')}
                      />
                    ) : userProfileImage ? (
                      <img
                        src={userProfileImage}
                        alt="Profile"
                        className="ANPuser-avatar"
                        onError={(e) => (e.target.src = Pro)}
                        onClick={() => navigate('/userProfile')}
                      />
                    ) : (
                      <FaUserGraduate
                        className="ANPuser-avatar-icon"
                        onClick={() => navigate('/userProfile')}
                      />
                    )}
                    <div className="ANPuser-details">
                      <span className="ANPuser-name">{postOwners[post.userID] || 'Anonymous'}</span>
                      <span className="ANPpost-date">
                        {new Date(post.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                  {post.userID !== loggedInUserID && (
                    <button
                      className={`ANPfollow-btn ${followedUsers.includes(post.userID) ? 'ANPunfollow' : ''}`}
                      onClick={() => handleFollowToggle(post.userID)}
                    >
                      {followedUsers.includes(post.userID) ? 'Unfollow' : 'Follow'}
                    </button>
                  )}
                  {post.userID === loggedInUserID && (
                    <div className="ANPpost-actions">
                      <button
                        className="ANPaction-btn ANPedit-btn"
                        onClick={() => handleUpdate(post.id)}
                        title="Edit Post"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="ANPaction-btn ANPdelete-btn"
                        onClick={() => handleDelete(post.id)}
                        title="Delete Post"
                      >
                        <RiDeleteBin6Fill />
                      </button>
                    </div>
                  )}
                </div>
                <div className="ANPpost-content">
                  <h2 className="ANPpost-title">{post.title}</h2>
                  <p className="ANPpost-description" style={{ whiteSpace: 'pre-line' }}>
                    {post.description}
                  </p>
                  <p className="ANPpost-category">Category: {post.category || 'Uncategorized'}</p>
                </div>
                <div className="ANPmedia-grid">
                  {post.media.length === 3 ? (
                    <div className="ANPthree-image-layout">
                      <div className="ANPmain-image">
                        <img
                          className="ANPmedia-preview"
                          src={`http://localhost:8080${post.media[0]}`}
                          alt="Main media"
                          onClick={() => openModal(post.media[0])}
                        />
                      </div>
                      <div className="ANPsecondary-images">
                        <img
                          className="ANPmedia-preview"
                          src={`http://localhost:8080${post.media[1]}`}
                          alt="Second media"
                          onClick={() => openModal(post.media[1])}
                        />
                        <img
                          className="ANPmedia-preview"
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
                        className={`ANPmedia-item ${post.media.length > 4 && index === 3 ? 'ANPmedia-overlay' : ''}`}
                        onClick={() => openModal(mediaUrl)}
                      >
                        {mediaUrl.endsWith('.mp4') ? (
                          <video className="ANPmedia-preview">
                            <source src={`http://localhost:8080${mediaUrl}`} type="video/mp4" />
                          </video>
                        ) : (
                          <img
                            className="ANPmedia-preview"
                            src={`http://localhost:8080${mediaUrl}`}
                            alt={`Media ${index}`}
                          />
                        )}
                        {post.media.length > 4 && index === 3 && (
                          <div className="ANPoverlay-text">+{post.media.length - 4}</div>
                        )}
                      </div>
                    ))
                  )}
                </div>
                <div className="ANPpost-footer">
                  <div className="ANPinteraction-bar">
                    <button
                      className={`ANPlike-btn ${post.likes?.[loggedInUserID] ? 'ANPliked' : ''}`}
                      onClick={() => handleLike(post.id)}
                    >
                      <BiSolidLike />{' '}
                      {Object.values(post.likes || {}).filter((liked) => liked).length}
                    </button>
                    <span className="ANPcomment-count">
                      <FaCommentAlt /> {post.comments?.length || 0}
                    </span>
                  </div>
                  <div className="ANPcomment-section">
                    <div className="ANPadd-comment">
                      <input
                        type="text"
                        className="ANPcomment-input"
                        placeholder="Add a comment..."
                        value={newComment[post.id] || ''}
                        onChange={(e) =>
                          setNewComment({ ...newComment, [post.id]: e.target.value })
                        }
                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                      />
                      <button
                        className="ANPsend-comment-btn"
                        onClick={() => handleAddComment(post.id)}
                      >
                        <IoSend />
                      </button>
                    </div>
                    {post.comments?.map((comment) => (
                      <div key={comment.id} className="ANPcomment">
                        <div className="ANPcomment-content">
                          <span className="ANPcomment-username">{comment.userFullName}</span>
                          {editingComment.id === comment.id ? (
                            <input
                              type="text"
                              className="ANPedit-comment-input"
                              value={editingComment.content}
                              onChange={(e) =>
                                setEditingComment({ ...editingComment, content: e.target.value })
                              }
                              autoFocus
                            />
                          ) : (
                            <p className="ANPcomment-text">{comment.content}</p>
                          )}
                        </div>
                        {(comment.userID === loggedInUserID || post.userID === loggedInUserID) && (
                          <div className="ANPcomment-actions">
                            {comment.userID === loggedInUserID &&
                              (editingComment.id === comment.id ? (
                                <>
                                  <button
                                    className="ANPcomment-action-btn ANPsave"
                                    onClick={() =>
                                      handleSaveComment(post.id, comment.id, editingComment.content)
                                    }
                                  >
                                    <FiSave />
                                  </button>
                                  <button
                                    className="ANPcomment-action-btn ANPcancel"
                                    onClick={() => setEditingComment({})}
                                  >
                                    <TbPencilCancel />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    className="ANPcomment-action-btn ANPedit"
                                    onClick={() =>
                                      setEditingComment({ id: comment.id, content: comment.content })
                                    }
                                  >
                                    <GrUpdate />
                                  </button>
                                  <button
                                    className="ANPcomment-action-btn ANPdelete"
                                    onClick={() => handleDeleteComment(post.id, comment.id)}
                                  >
                                    <MdDelete />
                                  </button>
                                </>
                              ))}
                            {post.userID === loggedInUserID && comment.userID !== loggedInUserID && (
                              <button
                                className="ANPcomment-action-btn ANPdelete"
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
        className="ANPmedia-modal"
        overlayClassName="ANPmedia-modal-overlay"
      >
        <button className="ANPclose-modal-btn" onClick={closeModal} title="Close">
          ×
        </button>
        {selectedMedia?.endsWith('.mp4') ? (
          <video controls className="ANPmodal-media">
            <source src={`http://localhost:8080${selectedMedia}`} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <img
            src={`http://localhost:8080${selectedMedia}`}
            alt="Full Media"
            className="ANPmodal-media"
          />
        )}
      </Modal>
    </div>
  );
}

export default AllPost;