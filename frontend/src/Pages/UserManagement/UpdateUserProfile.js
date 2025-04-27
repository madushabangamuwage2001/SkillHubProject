import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoMdAdd } from "react-icons/io";
import NavBar from '../../Components/NavBar/NavBar';
function UpdateUserProfile() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    phone: '',
    skills: [], // Added skills field
    bio: '', // Added bio field
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewImage, setPreviewImage] = useState(null); // State for previewing the selected image
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
        window.location.href = '/userProfile'; // Redirect to user profile page
      } else {
        alert('Failed to update profile.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <div className='continer'>
        <NavBar/>
        <div className='continSection'>
          <div className="from_continer">
            <p className="Auth_heading">Update User Profile</p>
            <form onSubmit={handleSubmit} className="Auth_form">
              <div className="Auth_formGroup">
                <label className="Auth_label">Full Name</label>
                <input
                  className="Auth_input"
                  type="text"
                  name="fullname"
                  placeholder="Full Name"
                  value={formData.fullname}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="Auth_formGroup">
                <label className="Auth_label">Email Address</label>
                <input
                  className="Auth_input"
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="Auth_formGroup">
                <label className="Auth_label">Password</label>
                <input
                  className="Auth_input"
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="Auth_formGroup">
                <label className="Auth_label">Phone</label>
                <input
                  className="Auth_input"
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
              <div className="Auth_formGroup">
                <label className="Auth_label">Skills</label>
                <div className='skil_dis_con'>
                  {formData.skills.map((skill, index) => (
                    <p className='skil_name' key={index}>
                      {skill} 
                      <span 
                        className='remve_skil' 
                        onClick={() => handleRemoveSkill(skill)}
                      >
                        x
                      </span>
                    </p>
                  ))}
                </div>
                <div className='skil_addbtn'>
                  <input
                    className="Auth_input"
                    type="text"
                    placeholder="Add Skill"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                  />
                  <IoMdAdd onClick={handleAddSkill} className="add_s_btn" />
                </div>
              </div>
              <div className="Auth_formGroup">
                <label className="Auth_label">Bio</label>
                <textarea
                  className="Auth_input"
                  name="bio"
                  placeholder="Bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
              <div className="Auth_formGroup">
                <label className="Auth_label">Profile Picture</label>
                <div className="profile-icon-container">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Selected Profile"
                      className="selected-image-preview"
                    />
                  ) : formData.profilePicturePath ? (
                    <img
                      src={`http://localhost:8080/uploads/profile/${formData.profilePicturePath}`}
                      alt="Current Profile"
                      className="selected-image-preview"
                    />
                  ) : (
                    <p>No profile picture selected</p>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                />
              </div>
              <button type="submit" className="Auth_button">Update</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdateUserProfile;
