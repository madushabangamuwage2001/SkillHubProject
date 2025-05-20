import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoMdAdd } from "react-icons/io";
import NavBar from '../../Components/NavBar/NavBar';
import './UpdateUserProfile.css';

function UpdateUserProfile() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    phone: '',
    skills: [],
    bio: '',
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const navigate = useNavigate();
  const [skillInput, setSkillInput] = useState('');

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      setFormData({ ...formData, skills: [...formData.skills, skillInput] });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  useEffect(() => {
    fetch(`http://localhost:8080/user/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        return response.json();
      })
      .then((data) => setFormData(data))
      .catch((error) => console.error('Error:', error));
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    setProfilePicture(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8080/user/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        if (profilePicture) {
          const formData = new FormData();
          formData.append('file', profilePicture);
          await fetch(`http://localhost:8080/user/${id}/uploadProfilePicture`, {
            method: 'PUT',
            body: formData,
          });
        }
        alert('Profile updated successfully!');
        navigate('/userProfile');
      } else {
        alert('Failed to update profile.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="profile-update-container">
      <NavBar/>
      <div className="content-section">
        <div className="form-container">
          <h1 className="form-heading">Update User Profile</h1>
          <form onSubmit={handleSubmit} className="update-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                type="text"
                name="fullname"
                placeholder="Full Name"
                value={formData.fullname}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                className="form-input"
                type="text"
                name="phone"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => {
                  const re = /^[0-9\b]{0,10}$/;
                  if (re.test(e.target.value)) {
                    handleInputChange(e);
                  }
                }}
                maxLength="10"
                pattern="[0-9]{10}"
                title="Please enter exactly 10 digits."
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Skills</label>
              <div className="skil-container">
                {formData.skills.map((skill, index) => (
                  <div className="skill-tag" key={index}>
                    {skill} 
                    <span 
                      className="remove-skill" 
                      onClick={() => handleRemoveSkill(skill)}
                    >
                      x
                    </span>
                  </div>
                ))}
              </div>
              <div className="skill-input-group">
                <input
                  className="form-input skill-input"
                  type="text"
                  placeholder="Add Skill"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                />
                <button 
                  type="button" 
                  className="add-skill-btn" 
                  onClick={handleAddSkill}
                >
                  <IoMdAdd className="add-skill-icon" />
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea
                className="form-input"
                name="bio"
                placeholder="Bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Profile Picture</label>
              <div className="profile-image-section">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Selected Profile"
                    className="profile-preview"
                  />
                ) : formData.profilePicturePath ? (
                  <img
                    src={`http://localhost:8080/uploads/profile/${formData.profilePicturePath}`}
                    alt="Current Profile"
                    className="profile-preview"
                  />
                ) : (
                  <div className="profile-preview">No profile picture</div>
                )}
                <div className="file-input-container">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="file-input"
                  />
                </div>
              </div>
            </div>
            <button type="submit" className="update-button">Update Profile</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdateUserProfile;