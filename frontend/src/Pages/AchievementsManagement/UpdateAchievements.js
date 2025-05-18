import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import NavBar from '../../Components/NavBar/NavBar';
import VoiceInput from '../../Components/VoiceInput/VoiceInput';
import './UpdateAchievements.css';

function UpdateAchievements() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    category: '',
    postOwnerID: '',
    postOwnerName: '',
    imageUrl: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
  const [voiceHistory, setVoiceHistory] = useState({
    title: [],
    description: []
  });

  useEffect(() => {
    const fetchAchievement = async () => {
      try {
        const response = await fetch(`http://localhost:8080/achievements/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch achievement');
        }
        const data = await response.json();
        setFormData(data);
        if (data.imageUrl) {
          setPreviewImage(`http://localhost:8080/achievements/images/${data.imageUrl}`);
        }
      } catch (error) {
        console.error('Error fetching Achievements data:', error);
        alert('Error loading achievement data');
      }
    };
    fetchAchievement();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
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
    setIsLoading(true);

    try {
      let imageUrl = formData.imageUrl;
      
      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);
        
        const uploadResponse = await fetch('http://localhost:8080/achievements/upload', {
          method: 'POST',
          body: uploadFormData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Image upload failed');
        }
        imageUrl = await uploadResponse.text();
      }

      const updatedData = { ...formData, imageUrl };
      const response = await fetch(`http://localhost:8080/achievements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        alert('Achievement updated successfully!');
        window.location.href = '/allAchievements';
      } else {
        throw new Error('Failed to update achievement');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'An error occurred during update');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="UAupdate-achievements-container">
      <NavBar />
      <div className="UAupdate-achievements-content">
        <div className="UAupdate-achievements-form-card">
          <h1 className="UAupdate-achievements-title">Update Achievement</h1>
          <form onSubmit={handleSubmit} className="UAupdate-achievements-form">
            <div className="UAform-group">
              <label className="UAform-label">Image</label>
              {previewImage && (
                <div className="UAimage-preview">
                  <img
                    src={previewImage}
                    alt="Achievement Preview"
                    className="UApreview-img"
                  />
                </div>
              )}
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="UAfile-input"
              />
            </div>

            <div className="UAform-group">
              <label className="UAform-label">Title</label>
              <div className="UAinput-container">
                <input
                  className={`UAform-input ${isListening.title ? 'UAlistening' : ''}`}
                  name="title"
                  placeholder={isListening.title ? 'Listening...' : 'Enter achievement title'}
                  value={isListening.title ? `${formData.title} ${interimText.title}` : formData.title}
                  onChange={handleInputChange}
                  required
                />
                <VoiceInput 
                  onTextUpdate={handleVoiceInput} 
                  fieldName="title"
                  isListening={isListening.title}
                  onStartListening={() => startVoiceInput('title')}
                  onStopListening={() => stopVoiceInput('title')}
                />
                {(transcribedText.title || interimText.title) && (
                  <div className={`UAtranscribed-text ${isListening.title ? 'UAlistening' : 'UAcompleted'}`}>
                    {isListening.title ? 
                      `Recording: ${interimText.title}` : 
                      `Latest: ${transcribedText.title}`}
                  </div>
                )}
                {voiceHistory.title.length > 0 && (
                  <div className="UAvoice-history">
                    <p className="UAvoice-history-title">Voice Input History:</p>
                    {voiceHistory.title.map((text, index) => (
                      <div key={index} className="UAvoice-history-item">{text}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="UAform-group">
              <label className="UAform-label">Description</label>
              <div className="UAinput-container">
                <textarea
                  className={`UAform-input ${isListening.description ? 'UAlistening' : ''}`}
                  name="description"
                  placeholder={isListening.description ? 'Listening...' : 'Describe your achievement'}
                  value={isListening.description ? `${formData.description} ${interimText.description}` : formData.description}
                  onChange={handleInputChange}
                  rows="5"
                  required
                />
                <VoiceInput 
                  onTextUpdate={handleVoiceInput} 
                  fieldName="description"
                  isListening={isListening.description}
                  onStartListening={() => startVoiceInput('description')}
                  onStopListening={() => stopVoiceInput('description')}
                />
                {(transcribedText.description || interimText.description) && (
                  <div className={`UAtranscribed-text ${isListening.description ? 'UAlistening' : 'UAcompleted'}`}>
                    {isListening.description ? 
                      `Recording: ${interimText.description}` : 
                      `Latest: ${transcribedText.description}`}
                  </div>
                )}
                {voiceHistory.description.length > 0 && (
                  <div className="UAvoice-history">
                    <p className="UAvoice-history-title">Voice Input History:</p>
                    {voiceHistory.description.map((text, index) => (
                      <div key={index} className="UAvoice-history-item">{text}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="UAform-group">
              <label className="UAform-label">Category</label>
              <select
                className="UAform-input"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="" disabled>Select Category</option>
                <option value="Tech">Tech</option>
                <option value="Programming">Programming</option>
                <option value="Cooking">Cooking</option>
                <option value="Photography">Photography</option>
              </select>
            </div>

            <div className="UAform-group">
              <label className="UAform-label">Date</label>
              <input
                className="UAform-input"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>

            <button 
              type="submit" 
              className="UAsubmit-button"
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Achievement'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdateAchievements;