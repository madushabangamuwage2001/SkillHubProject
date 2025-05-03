import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoMdAdd } from "react-icons/io";
import NavBar from '../../Components/NavBar/NavBar';
import VoiceInput from '../../Components/VoiceInput/VoiceInput';

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
  const [isListening, setIsListening] = useState({
    fullname: false,
    bio: false
  });
  const [interimText, setInterimText] = useState({
    fullname: '',
    bio: ''
  });
  const [transcribedText, setTranscribedText] = useState({
    fullname: '',
    bio: ''
  });
  const [voiceHistory, setVoiceHistory] = useState({
    fullname: [],
    bio: []
  });

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

  const handleVoiceInput = (field, text, isFinal) => {
    if (isFinal) {
      const finalText = text.trim();
      setTranscribedText(prev => ({ ...prev, [field]: finalText }));
      setVoiceHistory(prev => ({
        ...prev,
        [field]: [...prev[field], finalText]
      }));
      
      setFormData(prev => ({
        ...prev,
        [field]: prev[field] ? `${prev[field]} ${finalText}` : finalText
      }));
    } else {
      setInterimText(prev => ({ ...prev, [field]: text }));
    }
  };

  const startVoiceInput = (field) => {
    setIsListening(prev => ({ ...prev, [field]: true }));
    setInterimText(prev => ({ ...prev, [field]: '' }));
  };

  const stopVoiceInput = (field) => {
    setIsListening(prev => ({ ...prev, [field]: false }));
    setTimeout(() => {
      setTranscribedText(prev => ({ ...prev, [field]: '' }));
    }, 3000);
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
                <div className="input-with-voice">
                  <input
                    className={`Auth_input ${isListening.fullname ? 'listening' : ''}`}
                    type="text"
                    name="fullname"
                    placeholder={isListening.fullname ? 'Listening...' : 'Full Name'}
                    value={isListening.fullname ? `${formData.fullname} ${interimText.fullname}` : formData.fullname}
                    onChange={handleInputChange}
                    required
                  />
                  <VoiceInput 
                    onTextUpdate={handleVoiceInput} 
                    fieldName="fullname"
                    isListening={isListening.fullname}
                    onStartListening={() => startVoiceInput('fullname')}
                    onStopListening={() => stopVoiceInput('fullname')}
                  />
                  {(transcribedText.fullname || interimText.fullname) && (
                    <div className={`transcribed-text ${isListening.fullname ? 'listening' : 'completed'}`}>
                      {isListening.fullname ? 
                        `Recording: ${interimText.fullname}` : 
                        `Latest: ${transcribedText.fullname}`}
                    </div>
                  )}
                  {voiceHistory.fullname.length > 0 && (
                    <div className="voice-history">
                      <p className="voice-history-title">Voice Input History:</p>
                      {voiceHistory.fullname.map((text, index) => (
                        <div key={index} className="voice-history-item">{text}</div>
                      ))}
                    </div>
                  )}
                </div>
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
                <div className="input-with-voice">
                  <textarea
                    className={`Auth_input ${isListening.bio ? 'listening' : ''}`}
                    name="bio"
                    placeholder={isListening.bio ? 'Listening...' : 'Bio'}
                    value={isListening.bio ? `${formData.bio} ${interimText.bio}` : formData.bio}
                    onChange={handleInputChange}
                    rows={3}
                  />
                  <VoiceInput 
                    onTextUpdate={handleVoiceInput} 
                    fieldName="bio"
                    isListening={isListening.bio}
                    onStartListening={() => startVoiceInput('bio')}
                    onStopListening={() => stopVoiceInput('bio')}
                  />
                  {(transcribedText.bio || interimText.bio) && (
                    <div className={`transcribed-text ${isListening.bio ? 'listening' : 'completed'}`}>
                      {isListening.bio ? 
                        `Recording: ${interimText.bio}` : 
                        `Latest: ${transcribedText.bio}`}
                    </div>
                  )}
                  {voiceHistory.bio.length > 0 && (
                    <div className="voice-history">
                      <p className="voice-history-title">Voice Input History:</p>
                      {voiceHistory.bio.map((text, index) => (
                        <div key={index} className="voice-history-item">{text}</div>
                      ))}
                    </div>
                  )}
                </div>
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
