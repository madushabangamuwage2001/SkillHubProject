import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { FaEdit, FaSearch, FaBell, FaUser } from 'react-icons/fa';
import { RiDeleteBin6Fill } from 'react-icons/ri';
import { IoCreate, IoHome } from 'react-icons/io5';
import NavBar from '../../Components/NavBar/NavBar';
import Pro from '../../Components/NavBar/img/img.png';
import './AllAchievements.css';

function AllAchievements() {
  const [progressData, setProgressData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const userId = localStorage.getItem('userID');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/achievements?page=1`);
        const fetchedAchievements = response.data;
        setProgressData(fetchedAchievements);
        setFilteredData(fetchedAchievements);
      } catch (error) {
        console.error('Error fetching Achievements data:', error);
        alert('Failed to load achievements.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const fetchMoreAchievements = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/achievements?page=${page + 1}`);
      const newAchievements = response.data.filter(
        (newAchievement) => !progressData.some((existingAchievement) => existingAchievement.id === newAchievement.id)
      );
      if (newAchievements.length === 0) {
        setHasMore(false);
        return;
      }
      setProgressData((prev) => [...prev, ...newAchievements]);
      setFilteredData((prev) => {
        const updatedAchievements = [...prev, ...newAchievements];
        return searchQuery
          ? updatedAchievements.filter(
              (achievement) =>
                achievement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                achievement.description.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : updatedAchievements;
      });
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error('Error fetching more achievements:', error);
      setHasMore(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredData(
      progressData.filter(
        (achievement) =>
          achievement.title.toLowerCase().includes(query) ||
          achievement.description.toLowerCase().includes(query)
      )
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this achievement?')) return;
    try {
      await axios.delete(`http://localhost:8080/achievements/${id}`);
      setProgressData((prev) => prev.filter((achievement) => achievement.id !== id));
      setFilteredData((prev) => prev.filter((achievement) => achievement.id !== id));
      alert('Achievement deleted successfully!');
    } catch (error) {
      console.error('Error deleting achievement:', error);
      alert('Failed to delete achievement.');
    }
  };

  const handleUpdate = (id) => {
    navigate(`/updateAchievements/${id}`);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  

  if (isLoading) {
    return (
      <div className="ALAachievements-container" data-theme={theme}>
        <div className="ALAloading-container">
          <div className="ALAloading-spinner"></div>
          <p>Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ALAachievements-container" data-theme={theme}>
      <NavBar />
      <div className="ALAachievements-content">
        
        <div className="ALAachievements-header">
          <h1 className="ALAachievements-title">Your Achievements</h1>
          <div className="ALAsearch-container">
            <input
              type="text"
              className="ALAsearch-input"
              placeholder="Search achievements by title or description..."
              value={searchQuery}
              onChange={handleSearch}
              aria-label="Search achievements by title or description"
            />
            <button
              className="ALAbutton-primary"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>
        <button
          className="ALAadd-button"
          onClick={() => navigate('/addAchievements')}
          title="Add New Achievement"
          aria-label="Add new achievement"
        >
          <IoCreate />
        </button>
        <InfiniteScroll
          dataLength={filteredData.length}
          next={fetchMoreAchievements}
          hasMore={hasMore}
          loader={
            <div className="ALAachievements-grid">
              {Array(3).fill().map((_, i) => (
                <div key={i} className="ALAachievement-card">
                  <Skeleton height={20} width="60%" style={{ marginBottom: '8px' }} />
                  <Skeleton height={24} width="80%" style={{ marginBottom: '8px' }} />
                  <Skeleton height={16} width="50%" style={{ marginBottom: '8px' }} />
                  <Skeleton height={100} />
                </div>
              ))}
            </div>
          }
        >
          <div className="ALAachievements-grid">
            {filteredData.length === 0 ? (
              <div className="ALAno-achievements">
                <div className="ALAno-achievements-icon"></div>
                <p className="ALAno-achievements-message">No achievements found. Create your first achievement!</p>
                <button
                  className="ALAcreate-button"
                  onClick={() => navigate('/addAchievements')}
                  aria-label="Create new achievement"
                >
                  Create New Achievement
                </button>
              </div>
            ) : (
              filteredData.map((progress) => (
                <div key={progress.id} className="ALAachievement-card">
                  <div className="ALAcard-header">
                    <div className="ALAuser-info">
                      <p className="ALAuser-name">{progress.postOwnerName || 'Anonymous'}</p>
                      <p className="ALAachievement-date">{progress.date}</p>
                    </div>
                    {progress.postOwnerID === userId && (
                      <div className="ALAaction-buttons">
                        <FaEdit
                          onClick={() => handleUpdate(progress.id)}
                          className="ALAaction-icon ALAedit-icon"
                          title="Edit Achievement"
                          aria-label="Edit achievement"
                        />
                        <RiDeleteBin6Fill
                          onClick={() => handleDelete(progress.id)}
                          className="ALAaction-icon ALAdelete-icon"
                          title="Delete Achievement"
                          aria-label="Delete achievement"
                        />
                      </div>
                    )}
                  </div>
                  <div className="ALAcard-content">
                    <h3 className="ALAachievement-title">{progress.title}</h3>
                    <p className="ALAachievement-description" style={{ whiteSpace: 'pre-line' }}>
                      {progress.description}
                    </p>
                    {progress.imageUrl && (
                      <img
                        src={`http://localhost:8080/achievements/images/${progress.imageUrl}`}
                        alt={progress.title}
                        className="ALAachievement-image"
                        onError={(e) => (e.target.style.display = 'none')}
                        loading="lazy"
                      />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </InfiniteScroll>
        <nav className="ALAbottom-nav">
          <button onClick={() => navigate('/home')} aria-label="Home">
            <IoHome />
          </button>
          <button onClick={() => navigate('/search')} aria-label="Search">
            <FaSearch />
          </button>
          <button onClick={() => navigate('/addAchievements')} aria-label="Create Achievement">
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

export default AllAchievements;