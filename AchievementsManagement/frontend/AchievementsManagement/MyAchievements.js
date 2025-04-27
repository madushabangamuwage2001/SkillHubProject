import React, { useEffect, useState } from 'react';
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";
import NavBar from '../../Components/NavBar/NavBar'
import { IoIosCreate } from "react-icons/io";
function MyAchievements() {
  const [progressData, setProgressData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [showMyPosts, setShowMyPosts] = useState(false); // Track filter mode
  const userId = localStorage.getItem('userID');

  useEffect(() => {
    fetch('http://localhost:8080/achievements')
      .then((response) => response.json())
      .then((data) => {
        const userFilteredData = data.filter((achievement) => achievement.postOwnerID === userId); // Filter added
        setProgressData(userFilteredData);
        setFilteredData(userFilteredData); // Initially show filtered data
      })
      .catch((error) => console.error('Error fetching Achievements data:', error));
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this Achievements?')) {
      try {
        const response = await fetch(`http://localhost:8080/achievements/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert('Achievements deleted successfully!');
          setFilteredData(filteredData.filter((progress) => progress.id !== id));
        } else {
          alert('Failed to delete Achievements.');
        }
      } catch (error) {
        console.error('Error deleting Achievements:', error);
      }
    }
  };

  return (
    <div>
      <div className='continer'>
        <NavBar />
        <div className='continSection'>
          <div className='add_new_btn' onClick={() => (window.location.href = '/addAchievements')}>
            <IoIosCreate className='add_new_btn_icon' />
          </div>
          <div className='post_card_continer'>
            {filteredData.length === 0 ? (
              <div className='not_found_box'>
                <div className='not_found_img'></div>
                <p className='not_found_msg'>No posts found. Please create a new post.</p>
                <button
                  className='not_found_btn'
                  onClick={() => (window.location.href = '/addAchievements')}
                >
                  Create New Post
                </button>
              </div>
            ) : (
              filteredData.map((progress) => (
                <div key={progress.id} className='post_card'>
                  <div className='user_details_card'>
                    <div className='name_section_post_achi'>
                      <p className='name_section_post_owner_name'>{progress.postOwnerName}</p>
                      <div >
                        <p className='date_card_dte'> {progress.date}</p>
                      </div>
                    </div>
                    {progress.postOwnerID === userId && (
                      <div>
                        <div className='action_btn_icon_post'>
                          <FaEdit
                            onClick={() => (window.location.href = `/updateAchievements/${progress.id}`)} className='action_btn_icon' />
                          <RiDeleteBin6Fill
                            onClick={() => handleDelete(progress.id)}
                            className='action_btn_icon' />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className='dis_con'>
                    <p className='topic_cont'>{progress.title}</p>
                    <p className='dis_con_pera' style={{ whiteSpace: "pre-line" }}>{progress.description}</p>

                    {progress.imageUrl && (
                      <img
                        src={`http://localhost:8080/achievements/images/${progress.imageUrl}`}
                        alt="Achievement"
                        className='achievement_image'
                      />
                    )}
                  </div>

                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyAchievements;
