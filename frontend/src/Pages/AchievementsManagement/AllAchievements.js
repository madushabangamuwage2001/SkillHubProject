import React, { useEffect, useState } from 'react';
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";
import NavBar from '../../Components/NavBar/NavBar';
import { IoIosCreate } from "react-icons/io";
import './AllAchievements.css';

function AllAchievements() {
  const [progressData, setProgressData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const userId = localStorage.getItem('userID');

  useEffect(() => {
    fetch('http://localhost:8080/achievements')
      .then((response) => response.json())
      .then((data) => {
        setProgressData(data);
        setFilteredData(data);
      })
      .catch((error) => console.error('Error fetching Achievements data:', error));
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = progressData.filter(
      (achievement) =>
        achievement.title.toLowerCase().includes(query) ||
        achievement.description.toLowerCase().includes(query)
    );
    setFilteredData(filtered);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this achievement?')) {
      try {
        const response = await fetch(`http://localhost:8080/achievements/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert('Achievement deleted successfully!');
          setFilteredData(filteredData.filter((progress) => progress.id !== id));
        } else {
          alert('Failed to delete achievement.');
        }
      } catch (error) {
        console.error('Error deleting achievement:', error);
      }
    }
  };

  return (
    <div className="ALAachievements-container">
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
            />
          </div>
        </div>
        <button
          className="ALAadd-button"
          onClick={() => (window.location.href = '/addAchievements')}
          title="Add New Achievement"
        >
          <IoIosCreate className="ALAadd-button-icon" />
        </button>
        <div className="ALAachievements-grid">
          {filteredData.length === 0 ? (
            <div className="ALAno-achievements">
              <div className="ALAno-achievements-icon"></div>
              <p className="ALAno-achievements-message">No achievements found. Create your first achievement!</p>
              <button
                className="ALAcreate-button"
                onClick={() => (window.location.href = '/addAchievements')}
              >
                Create New Achievement
              </button>
            </div>
          ) : (
            filteredData.map((progress) => (
              <div key={progress.id} className="ALAachievement-card">
                <div className="ALAcard-header">
                  <div className="ALAuser-info">
                    <p className="ALAuser-name">{progress.postOwnerName}</p>
                    <p className="ALAachievement-date">{progress.date}</p>
                  </div>
                  {progress.postOwnerID === userId && (
                    <div className="ALAaction-buttons">
                      <FaEdit
                        onClick={() => (window.location.href = `/updateAchievements/${progress.id}`)}
                        className="ALAaction-icon ALAedit-icon"
                        title="Edit Achievement"
                      />
                      <RiDeleteBin6Fill
                        onClick={() => handleDelete(progress.id)}
                        className="ALAaction-icon ALAdelete-icon"
                        title="Delete Achievement"
                      />
                    </div>
                  )}
                </div>
                <div className="ALAcard-content">
                  <h3 className="ALAachievement-title">{progress.title}</h3>
                  <p className="ALAachievement-description" style={{ whiteSpace: "pre-line" }}>
                    {progress.description}
                  </p>
                  {progress.imageUrl && (
                    <img
                      src={`http://localhost:8080/achievements/images/${progress.imageUrl}`}
                      alt="Achievement"
                      className="ALAachievement-image"
                    />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default AllAchievements;