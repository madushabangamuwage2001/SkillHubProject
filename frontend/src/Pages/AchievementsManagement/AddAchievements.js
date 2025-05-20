import React, { useState, useEffect } from 'react';
import NavBar from '../../Components/NavBar/NavBar';
import VoiceInput from '../../Components/VoiceInput/VoiceInput';
import './AddAchievements.css';

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
  const [isListening, setIsListening] = useState({ title: false, description: false });
  const [interimText, setInterimText] = useState({ title: '', description: '' });
  const [error, setError] = useState('');

  // Fetch user data and set formData
  useEffect(() => {
    const userId = localStorage.getItem('userID');
    if (userId) {
      setFormData((prev) => ({ ...prev, postOwnerID: userId }));
      fetch(`${process.env.REACT_APP_API_URL}/user/${userId}`)
        .then((response) => response.json())
        .then((data) => {
          if (data?.fullname) {
            setFormData((prev) => ({ ...prev, postOwnerName: data.fullname }));
          }
        })
        .catch((error) => console.error('Error fetching user data:', error));
    }
  }, []);

  // Clean up image preview URL
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImage(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const handleVoiceInput = (field, text, isFinal) => {
    if (isFinal) {
      setFormData((prev) => ({
        ...prev,
        [field]: prev[field] ? `${prev[field]} ${text}` : text,
      }));
      setInterimText((prev) => ({ ...prev, [field]: '' }));
      setIsListening((prev) => ({ ...prev, [field]: false }));
    } else {
      setInterimText((prev) => ({ ...prev, [field]: text }));
    }
  };

  const startVoiceInput = (field) => {
    setIsListening((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      let imageUrl = '';
      if (image) {
        const imageFormData = new FormData();
        imageFormData.append('file', image);
        const uploadResponse = await fetch(`http://localhost:8080/achievements/upload`, {
          method: 'POST',
          body: imageFormData,
        });
        if (!uploadResponse.ok) throw new Error('Image upload failed');
        imageUrl = await uploadResponse.text();
      }

      const response = await fetch(`http://localhost:8080/achievements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, imageUrl }),
      });

      if (response.ok) {
        alert('Achievement added successfully!');
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
        window.location.href = '/myAchievements';
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add achievement');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="ADAachievements-container">
      <NavBar />
      <div className="ADAachievements-content">
        <div className="ADAachievements-form-card">
          <h1 className="ADAachievements-title">Add New Achievement</h1>
          {error && <div className="ADAerror-message" role="alert">{error}</div>}

          <form onSubmit={handleSubmit} className="ADAachievements-form">
            <div className="ADAform-group">
              <label htmlFor="image-upload" className="ADAform-label">Upload Image</label>
              {imagePreview && (
                <div className="ADAimage-preview">
                  <img
                    src={imagePreview}
                    alt="Selected achievement preview"
                    className="ADApreview-img"
                  />
                </div>
              )}
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="ADAfile-input"
                required
                aria-describedby="image-upload-help"
              />
              <small id="image-upload-help" className="ADAform-help">
                Upload an image to showcase your achievement.
              </small>
            </div>

            <div className="ADAform-group">
              <label htmlFor="title" className="ADAform-label">Title</label>
              <div className="ADAinput-container">
                <input
                  id="title"
                  name="title"
                  placeholder={isListening.title ? 'Listening...' : 'Enter achievement title'}
                  value={isListening.title ? `${formData.title} ${interimText.title}` : formData.title}
                  onChange={handleChange}
                  className={`ADAform-input ${isListening.title ? 'ADAlistening' : ''}`}
                  required
                  aria-describedby="title-transcribed"
                  aria-busy={isListening.title}
                />
                <VoiceInput
                  onTextUpdate={handleVoiceInput}
                  fieldName="title"
                  isListening={isListening.title}
                  onStartListening={() => startVoiceInput('title')}
                />
                {interimText.title && (
                  <div id="title-transcribed" className="ADAtranscribed-text">
                    {isListening.title
                      ? `Listening: ${interimText.title}`
                      : `Last input: ${interimText.title}`}
                  </div>
                )}
              </div>
            </div>

            <div className="ADAform-group">
              <label htmlFor="description" className="ADAform-label">Description</label>
              <div className="ADAinput-container">
                <textarea
                  id="description"
                  name="description"
                  placeholder={isListening.description ? 'Listening...' : 'Describe your achievement'}
                  value={isListening.description ? `${formData.description} ${interimText.description}` : formData.description}
                  onChange={handleChange}
                  className={`ADAform-input ${isListening.description ? 'ADAlistening' : ''}`}
                  required
                  aria-describedby="description-transcribed"
                  aria-busy={isListening.description}
                />
                <VoiceInput
                  onTextUpdate={handleVoiceInput}
                  fieldName="description"
                  isListening={isListening.description}
                  onStartListening={() => startVoiceInput('description')}
                />
                {interimText.description && (
                  <div id="description-transcribed" className="ADAtranscribed-text">
                    {isListening.description
                      ? `Listening: ${interimText.description}`
                      : `Last input: ${interimText.description}`}
                  </div>
                )}
              </div>
            </div>

            <div className="ADAform-group">
              <label htmlFor="category" className="ADAform-label">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="ADAform-input"
                required
                aria-describedby="category-help"
              >
                <option value="" disabled>Select Category</option>
                <option value="Tech">Tech</option>
                <option value="Programming">Programming</option>
                <option value="Cooking">Cooking</option>
                <option value="Photography">Photography</option>
              </select>
              <small id="category-help" className="ADAform-help">
                Choose a category for your achievement.
              </small>
            </div>

            <div className="ADAform-group">
              <label htmlFor="date" className="ADAform-label">Date</label>
              <input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                className="ADAform-input"
                required
              />
            </div>

            <button type="submit" className="ADAsubmit-button">
              Add Achievement
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddAchievements;