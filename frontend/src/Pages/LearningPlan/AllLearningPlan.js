import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { FaEdit, FaSearch, FaBell, FaUser } from 'react-icons/fa';
import { RiDeleteBin6Fill } from 'react-icons/ri';
import { IoCreate, IoHome } from 'react-icons/io5';
import { HiCalendarDays } from 'react-icons/hi2';
import NavBar from '../../Components/NavBar/NavBar';
import Pro from '../../Components/NavBar/img/img.png';
import './AllLearningPlan.css';

function AllLearningPlan() {
  const [plans, setPlans] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [searchOwnerName, setSearchOwnerName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const userId = localStorage.getItem('userID');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/learningPlan?page=1`);
        const fetchedPlans = response.data;
        setPlans(fetchedPlans);
        setFilteredPlans(fetchedPlans);
      } catch (error) {
        console.error('Error fetching learning plans:', error);
        alert('Failed to load learning plans.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const fetchMorePlans = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/learningPlan?page=${page + 1}`);
      const newPlans = response.data.filter(
        (newPlan) => !plans.some((existingPlan) => existingPlan.id === newPlan.id)
      );
      if (newPlans.length === 0) {
        setHasMore(false);
        return;
      }
      setPlans((prev) => [...prev, ...newPlans]);
      setFilteredPlans((prev) => {
        const updatedPlans = [...prev, ...newPlans];
        return searchOwnerName
          ? updatedPlans.filter((plan) =>
              plan.postOwnerName?.toLowerCase().includes(searchOwnerName.toLowerCase())
            )
          : updatedPlans;
      });
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error('Error fetching more plans:', error);
      setHasMore(false);
    }
  };

  const getEmbedURL = (url) => {
    try {
      if (url.includes('youtube.com/watch')) {
        const videoId = new URL(url).searchParams.get('v');
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1].split('?')[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      return url;
    } catch (error) {
      console.error('Invalid URL:', url);
      return '';
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this learning plan?')) return;
    try {
      await axios.delete(`http://localhost:8080/learningPlan/${id}`);
      setPlans((prev) => prev.filter((plan) => plan.id !== id));
      setFilteredPlans((prev) => prev.filter((plan) => plan.id !== id));
      alert('Learning plan deleted successfully!');
    } catch (error) {
      console.error('Error deleting learning plan:', error);
      alert('Failed to delete learning plan.');
    }
  };

  const handleUpdate = (id) => {
    navigate(`/updateLearningPlan/${id}`);
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchOwnerName(value);
    setFilteredPlans(
      plans.filter((plan) =>
        plan.postOwnerName?.toLowerCase().includes(value)
      )
    );
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  

  const VideoPlayer = ({ videoUrl }) => (
    <div className="APvideo-container">
      <video
        controls
        controlsList="nodownload"
        preload="metadata"
        className="APplan-video"
        poster={`http://localhost:8080/learningPlan/thumbnails/${videoUrl}`}
      >
        <source src={`http://localhost:8080/learningPlan/planVideos/${videoUrl}`} type="video/mp4" />

        {/* <source src={`http://localhost:8080/learningPlan/videos/${videoUrl}`} type="video/webm" /> */}
        Your browser does not support the video tag.
      </video>
    </div>
  );

  const renderPlanByTemplate = (plan) => {
    if (!plan.templateID) {
      return <div className="APtemplate APtemplate-default">Invalid template ID</div>;
    }

    const commonContent = (
      <>
        <div className="APtemplate-header">
          <div className="APuser-info">
            <p className="APuser-name">{plan.postOwnerName || 'Anonymous'}</p>
          </div>
          {plan.postOwnerID === userId && (
            <div className="APaction-buttons">
              <FaEdit
                onClick={() => handleUpdate(plan.id)}
                className="APaction-icon APedit-icon"
                title="Edit Learning Plan"
                aria-label="Edit learning plan"
              />
              <RiDeleteBin6Fill
                onClick={() => handleDelete(plan.id)}
                className="APaction-icon APdelete-icon"
                title="Delete Learning Plan"
                aria-label="Delete learning plan"
              />
            </div>
          )}
        </div>
        <h3 className="APtemplate-title">{plan.title}</h3>
        <p className="APtemplate-dates">
          <HiCalendarDays /> {plan.startDate} to {plan.endDate}
        </p>
        <p className="APtemplate-category">{plan.category || 'Uncategorized'}</p>
        <hr className="APtemplate-divider" />
        <p className="APtemplate-description" style={{ whiteSpace: 'pre-line' }}>
          {plan.description}
        </p>
        {plan.tags?.length > 0 && (
          <div className="APtemplate-tags">
            {plan.tags.map((tag, index) => (
              <span key={index} className="APtemplate-tag">#{tag}</span>
            ))}
          </div>
        )}
      </>
    );

    switch (plan.templateID) {
      case 1:
        return (
          <div className="APtemplate APtemplate-1">
            {commonContent}
            {plan.imageUrl && (
              <img
                src={`http://localhost:8080/learningPlan/planImages/${plan.imageUrl}`}
                alt={plan.title}
                className="APtemplate-media"
                onError={(e) => (e.target.style.display = 'none')}
                loading="lazy"
              />
            )}
            {plan.videoUrl && <VideoPlayer videoUrl={plan.videoUrl} />}
            {plan.contentURL && (
              <iframe
                src={getEmbedURL(plan.contentURL)}
                title={plan.title}
                className="APtemplate-media"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              ></iframe>
            )}
          </div>
        );
      case 2:
        return (
          <div className="APtemplate APtemplate-2">
            {commonContent}
            {(plan.imageUrl || plan.videoUrl || plan.contentURL) && (
              <div className="APtemplate-media-split">
                {plan.imageUrl && (
                  <div className="APtemplate-media-split-item">
                    <img
                      src={`http://localhost:8080/learningPlan/planImages/${plan.imageUrl}`}
                      alt={plan.title}
                      className="APtemplate-media"
                      onError={(e) => (e.target.style.display = 'none')}
                      loading="lazy"
                    />
                  </div>
                )}
                {(plan.videoUrl || plan.contentURL) && (
                  <div className="APtemplate-media-split-item">
                    {plan.videoUrl && <VideoPlayer videoUrl={plan.videoUrl} />}
                    {plan.contentURL && (
                      <iframe
                        src={getEmbedURL(plan.contentURL)}
                        title={plan.title}
                        className="APtemplate-media"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                      ></iframe>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="APtemplate APtemplate-3">
            {plan.imageUrl && (
              <img
                src={`http://localhost:8080/learningPlan/planImages/${plan.imageUrl}`}
                alt={plan.title}
                className="APtemplate-media"
                onError={(e) => (e.target.style.display = 'none')}
                loading="lazy"
              />
            )}
            {plan.videoUrl && <VideoPlayer videoUrl={plan.videoUrl} />}
            {plan.contentURL && (
              <iframe
                src={getEmbedURL(plan.contentURL)}
                title={plan.title}
                className="APtemplate-media"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              ></iframe>
            )}
            {commonContent}
          </div>
        );
      default:
        return (
          <div className="APtemplate APtemplate-default">
            <p>Unknown template ID: {plan.templateID}</p>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="APloading-container" data-theme={theme}>
        <div className="APloading-spinner"></div>
        <p>Loading learning plans...</p>
      </div>
    );
  }

  return (
    <div className="APall-learning-plan-container" data-theme={theme}>
      <NavBar />
      <div className="APall-learning-plan-content">
        
        <div className="APall-learning-plan-header">
          <h1 className="APall-learning-plan-title">Explore Learning Plans</h1>
          <div className="APsearch-container">
            <input
              type="text"
              placeholder="Search by owner name"
              value={searchOwnerName}
              onChange={handleSearch}
              className="APsearch-input"
              aria-label="Search learning plans by owner name"
            />
            <button
              className="APbutton-primary"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>
        <button
          className="APadd-button"
          onClick={() => navigate('/addLearningPlan')}
          title="Add New Learning Plan"
          aria-label="Add new learning plan"
        >
          <IoCreate />
        </button>
        <InfiniteScroll
          dataLength={filteredPlans.length}
          next={fetchMorePlans}
          hasMore={hasMore}
          loader={
            <div className="APplans-grid">
              {Array(3).fill().map((_, i) => (
                <div key={i} className="APplan-card">
                  <Skeleton height={20} width="60%" style={{ marginBottom: '8px' }} />
                  <Skeleton height={24} width="80%" style={{ marginBottom: '8px' }} />
                  <Skeleton height={16} width="50%" style={{ marginBottom: '8px' }} />
                  <Skeleton height={100} />
                </div>
              ))}
            </div>
          }
        >
          <div className="APplans-grid">
            {filteredPlans.length === 0 ? (
              <div className="APno-plans">
                <div className="APno-plans-icon"></div>
                <p className="APno-plans-message">No learning plans found. Create your first plan!</p>
                <button
                  className="APcreate-button"
                  onClick={() => navigate('/addLearningPlan')}
                  aria-label="Create new learning plan"
                >
                  Create New Plan
                </button>
              </div>
            ) : (
              filteredPlans.map((plan) => (
                <div key={plan.id} className="APplan-card">
                  {renderPlanByTemplate(plan)}
                </div>
              ))
            )}
          </div>
        </InfiniteScroll>
        <nav className="APbottom-nav">
          <button onClick={() => navigate('/home')} aria-label="Home">
            <IoHome />
          </button>
          <button onClick={() => navigate('/search')} aria-label="Search">
            <FaSearch />
          </button>
          <button onClick={() => navigate('/addLearningPlan')} aria-label="Create Plan">
            <IoCreate />
          </button>
          <button onClick={() => navigate('/notifications')} aria-label="Notifications">
            <FaBell />
          </button>
          <button onClick={() => navigate('/userProfile')} aria-label="Profile">
            <FaUser />
          </button>
        </nav>
      </div>
    </div>
  );
}

export default AllLearningPlan;