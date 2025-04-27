import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaPhone, FaTools } from 'react-icons/fa';
import './UserProfile.css'
import NavBar from '../../Components/NavBar/NavBar';
export const fetchUserDetails = async (userId) => {
    try {
        const response = await fetch(`http://localhost:8080/user/${userId}`);
        if (response.ok) {
            return await response.json();
        } else {
            console.error('Failed to fetch user details');
            return null;
        }
    } catch (error) {
        console.error('Error fetching user details:', error);
        return null;
    }
};

function UserProfile() {
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userId = localStorage.getItem('userID');
        if (userId) {
            fetchUserDetails(userId).then((data) => setUserData(data));
        }
    }, []);

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete your profile?")) {
            const userId = localStorage.getItem('userID');
            fetch(`http://localhost:8080/user/${userId}`, {
                method: 'DELETE',
            })
                .then((response) => {
                    if (response.ok) {
                        alert("Profile deleted successfully!");
                        localStorage.removeItem('userID');
                        navigate('/'); // Redirect to home or login page
                    } else {
                        alert("Failed to delete profile.");
                    }
                })
                .catch((error) => console.error('Error:', error));
        }
    };

    return (
        <div>
            <div className='continer'>
                <NavBar />
                <div className='continSection'>
                    {userData && userData.id === localStorage.getItem('userID') && (
                        <div className="profile-card">
                            {userData.profilePicturePath && (
                                <img
                                    src={`http://localhost:8080/uploads/profile/${userData.profilePicturePath}`}
                                    alt="Profile"
                                    className="profile-image"
                                />
                            )}
                            <div className='pro_left_card'>
                                <div className='user_data_card'>
                                    <div className='user_data_card_new'>
                                        <p className='username_card'>{userData.fullname}</p>
                                        <p className='user_data_card_item_bio'> {userData.bio}</p>
                                    </div>
                                    <p className='user_data_card_item'><FaEnvelope className='user_data_card_icon' /> {userData.email}</p>
                                    <p className='user_data_card_item'><FaPhone className='user_data_card_icon' />  {userData.phone}</p>
                                    <p className='user_data_card_item'><FaTools className='user_data_card_icon' />{userData.skills.join(', ')}</p>
                                </div>
                                <div className="profile-actions">
                                    <button onClick={() => navigate(`/updateUserProfile/${userData.id}`)} className="update-button">
                                        Update
                                    </button>
                                    <button onClick={handleDelete} className="delete-button">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className='my_post_link'>
                    <div className='my_post_link_card' onClick={() => (window.location.href = '/myLearningPlan')}>
                        <div className='my_post_name_img1'></div>
                        <p className='my_post_link_card_name'>My Learning Plan</p>
                    </div>
                    <div className='my_post_link_card' onClick={() => (window.location.href = '/myAllPost')}>
                        <div className='my_post_name_img2'></div>
                        <p className='my_post_link_card_name'>My SkillPost</p>
                    </div>
                    <div className='my_post_link_card' onClick={() => (window.location.href = '/myAchievements')}>
                        <div className='my_post_name_img3'></div>
                        <p className='my_post_link_card_name'>My Achievements</p>
                    </div>
                </div>
                <br/><br/>
            </div>
        </div>
    );
}

export default UserProfile;
