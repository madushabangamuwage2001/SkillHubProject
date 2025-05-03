import React, { useState, useEffect } from 'react';
import NavBar from '../../Components/NavBar/NavBar';
import VoiceInput from '../../Components/VoiceInput/VoiceInput';

function AddAchievements() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    postOwnerID: '',
    category: '',
    postOwnerName: '',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); 
  const [isListening, setIsListening] = useState({
    title: false,
    description: false
  });
  const [interimText, setInterimText] = useState({
    title: '',
    description: ''
  });
  const [transcribedText, setTranscribedText] = useState({
    title: '',
    description: ''
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setImagePreview(file ? URL.createObjectURL(file) : null); 
  };

  useEffect(() => {
    const userId = localStorage.getItem('userID');
    if (userId) {
      setFormData((prevData) => ({ ...prevData, postOwnerID: userId }));
      fetch(`http://localhost:8080/user/${userId}`)
        .then((response) => response.json())
        .then((data) => {
          if (data && data.fullname) {
            setFormData((prevData) => ({ ...prevData, postOwnerName: data.fullname }));
          }
        })
        .catch((error) => console.error('Error fetching user data:', error));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleVoiceInput = (field, text, isFinal) => {
    if (isFinal) {
      setTranscribedText(prev => ({ ...prev, [field]: text }));
      if (field === 'title') {
        setFormData(prev => ({ ...prev, title: prev.title ? `${prev.title} ${text}` : text }));
        setInterimText(prev => ({ ...prev, title: '' }));
      } else if (field === 'description') {
        setFormData(prev => ({ ...prev, description: prev.description ? `${prev.description} ${text}` : text }));
        setInterimText(prev => ({ ...prev, description: '' }));
      }
      setIsListening(prev => ({ ...prev, [field]: false }));
    } else {
      setInterimText(prev => ({ ...prev, [field]: text }));
    }
  };

  const startVoiceInput = (field) => {
    setIsListening(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let imageUrl = '';
    if (image) {
      const formData = new FormData();
      formData.append('file', image);
      const uploadResponse = await fetch('http://localhost:8080/achievements/upload', {
        method: 'POST',
        body: formData,
      });
      imageUrl = await uploadResponse.text();
    }

    const response = await fetch('http://localhost:8080/achievements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, imageUrl }),
    });
    if (response.ok) {
      alert('Achievements added successfully!');
      window.location.href = '/myAchievements';
    } else {
      alert('Failed to add Achievements.');
    }
  };

  return (
    <div>
      <div className='continer'>
        <NavBar/>
        <div className='continSection'>
          <div className="from_continer">
            <p className="Auth_heading">Add Achievements</p>
            <form
              onSubmit={(e) => {
                handleSubmit(e);
                setFormData({
                  title: '',
                  description: '',
                  date: '',
                  category: '',
                  postOwnerID: formData.postOwnerID,
                  postOwnerName: formData.postOwnerName,
                });
                setImage(null);
                setImagePreview(null); 
              }}
              className='from_data'
            >
              <div className="Auth_formGroup">
                <label className="Auth_label">Upload Image</label>
                {imagePreview && ( 
                  <div className="image-preview-achi">
                    <img src={imagePreview} alt="Preview" className="image-preview-achi" />
                  </div>
                )}
                <input
                  className="Auth_input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  required
                />
                
              </div>
              <div className="Auth_formGroup">
                <label className="Auth_label">Title</label>
                <div className="input-with-voice">
                  <input
                    className={`Auth_input ${isListening.title ? 'listening' : ''}`}
                    name="title"
                    placeholder={isListening.title ? 'Listening...' : 'Title'}
                    value={isListening.title ? `${formData.title} ${interimText.title}` : formData.title}
                    onChange={handleChange}
                    required
                  />
                  <VoiceInput 
                    onTextUpdate={handleVoiceInput} 
                    fieldName="title"
                    isListening={isListening.title}
                    onStartListening={() => startVoiceInput('title')}
                  />
                  {(transcribedText.title || interimText.title) && (
                    <div className="transcribed-text">
                      {isListening.title ? 
                        `Listening: ${interimText.title}` : 
                        `Last input: ${transcribedText.title}`}
                    </div>
                  )}
                </div>
              </div>
              <div className="Auth_formGroup">
                <label className="Auth_label">Description</label>
                <div className="input-with-voice">
                  <textarea
                    className={`Auth_input ${isListening.description ? 'listening' : ''}`}
                    name="description"
                    placeholder={isListening.description ? 'Listening...' : 'Description'}
                    value={isListening.description ? `${formData.description} ${interimText.description}` : formData.description}
                    onChange={handleChange}
                    required
                    rows={5}
                  />
                  <VoiceInput 
                    onTextUpdate={handleVoiceInput} 
                    fieldName="description"
                    isListening={isListening.description}
                    onStartListening={() => startVoiceInput('description')}
                  />
                  {(transcribedText.description || interimText.description) && (
                    <div className="transcribed-text">
                      {isListening.description ? 
                        `Listening: ${interimText.description}` : 
                        `Last input: ${transcribedText.description}`}
                    </div>
                  )}
                </div>
              </div>
              <div className="Auth_formGroup">
                <label className="Auth_label">Category</label>
                <select
                  className="Auth_input"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Select Category</option>
                  <option value="Tech">Tech</option>
                  <option value="Programming">Programming</option>
                  <option value="Cooking">Cooking</option>
                  <option value="Photography">Photography</option>
                </select>
              </div>
              <div className="Auth_formGroup">
                <label className="Auth_label">Date</label>
                <input
                  className="Auth_input"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" className="Auth_button">ADD</button>
            </form >
          </div >
        </div >
      </div >
    </div >
  );
}

export default AddAchievements;
