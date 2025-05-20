import React, { useEffect, useState } from 'react';
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";
import NavBar from '../../Components/NavBar/NavBar';
import { IoIosCreate } from "react-icons/io";
import './MyAchievements.css';

function MyAchievements() {
  const [progressData, setProgressData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const userId = localStorage.getItem('userID');

  useEffect(() => {
    fetch('http://localhost:8080/achievements')
      .then((response) => response.json())
      .then((data) => {
        const userFilteredData = data.filter((achievement) => achievement.postOwnerID === userId);
        setProgressData(userFilteredData);
        setFilteredData(userFilteredData);
      })
      .catch((error) => console.error('Error fetching Achievements data:', error));
  }, []);

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
    <div className="MYAmy-achievements-container">
      <NavBar />
      <div className="MYAmy-achievements-content">
        <h1 className="MYAmy-achievements-title">My Achievements</h1>
        <button
          className="MYAadd-button"
          onClick={() => (window.location.href = '/addAchievements')}
          title="Add New Achievement"
        >
          <IoIosCreate className="MYAadd-button-icon" />
        </button>
        <div className="MYAachievements-grid">
          {filteredData.length === 0 ? (
            <div className="MYAno-achievements">
              <div className="MYAno-achievements-icon"></div>
              <p className="MYAno-achievements-message">No achievements found. Create your first achievement!</p>
              <button
                className="MYAcreate-button"
                onClick={() => (window.location.href = '/addAchievements')}
              >
                Create New Achievement
              </button>
            </div>
          ) : (
            filteredData.map((progress) => (
              <div key={progress.id} className="MYAachievement-card">
                <div className="MYAcard-header">
                  <div className="MYAuser-info">
                    <p className="MYAuser-name">{progress.postOwnerName}</p>
                    <p className="MYAachievement-date">{progress.date}</p>
                  </div>
                  {progress.postOwnerID === userId && (
                    <div className="MYAaction-buttons">
                      <FaEdit
                        onClick={() => (window.location.href = `/updateAchievements/${progress.id}`)}
                        className="MYAaction-icon MYAedit-icon"
                        title="Edit Achievement"
                      />
                      <RiDeleteBin6Fill
                        onClick={() => handleDelete(progress.id)}
                        className="MYAaction-icon MYAdelete-icon"
                        title="Delete Achievement"
                      />
                    </div>
                  )}
                </div>
                <div className="MYAcard-content">
                  <h3 className="MYAachievement-title">{progress.title}</h3>
                  <p className="MYAachievement-description" style={{ whiteSpace: "pre-line" }}>
                    {progress.description}
                  </p>
                  {progress.imageUrl && (
                    <img
                      src={`http://localhost:8080/achievements/images/${progress.imageUrl}`}
                      alt="Achievement"
                      className="MYAachievement-image"
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

export default MyAchievements;