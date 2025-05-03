import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import NavBar from '../../Components/NavBar/NavBar';
import VoiceInput from '../../Components/VoiceInput/VoiceInput';

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
      
      // Upload new image if selected
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

      // Update achievement data
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
    <div>
      <div className='continer'>
        <NavBar/>
        <div className='continSection'>
          <div className="from_continer">
            <p className="Auth_heading">Update Achievement</p>
            <form onSubmit={handleSubmit} className='from_data'>
              {/* Image Upload Section */}
              <div className="Auth_formGroup">
                <label className="Auth_label">Current Image</label>
                {previewImage && (
                  <div style={{ marginBottom: '15px' }}>
                    <img
                      src={previewImage}
                      alt="Current Achievement"
                      style={{ 
                        width: '100%', 
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                )}
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="Auth_input"
                  style={{ padding: '8px' }}
                />
              </div>

              {/* Title Input */}
              <div className="Auth_formGroup">
                <label className="Auth_label">Title</label>
                <div className="input-with-voice">
                  <input
                    className={`Auth_input ${isListening.title ? 'listening' : ''}`}
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
                    <div className={`transcribed-text ${isListening.title ? 'listening' : 'completed'}`}>
                      {isListening.title ? 
                        `Recording: ${interimText.title}` : 
                        `Latest: ${transcribedText.title}`}
                    </div>
                  )}
                  {voiceHistory.title.length > 0 && (
                    <div className="voice-history">
                      <p className="voice-history-title">Voice Input History:</p>
                      {voiceHistory.title.map((text, index) => (
                        <div key={index} className="voice-history-item">{text}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Description Textarea */}
              <div className="Auth_formGroup">
                <label className="Auth_label">Description</label>
                <div className="input-with-voice">
                  <textarea
                    className={`Auth_input ${isListening.description ? 'listening' : ''}`}
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
                    <div className={`transcribed-text ${isListening.description ? 'listening' : 'completed'}`}>
                      {isListening.description ? 
                        `Recording: ${interimText.description}` : 
                        `Latest: ${transcribedText.description}`}
                    </div>
                  )}
                  {voiceHistory.description.length > 0 && (
                    <div className="voice-history">
                      <p className="voice-history-title">Voice Input History:</p>
                      {voiceHistory.description.map((text, index) => (
                        <div key={index} className="voice-history-item">{text}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Category Select */}
              <div className="Auth_formGroup">
                <label className="Auth_label">Category</label>
                <select
                  className="Auth_input"
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

              {/* Date Input */}
              <div className="Auth_formGroup">
                <label className="Auth_label">Date</label>
                <input
                  className="Auth_input"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="Auth_button"
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Update Achievement'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdateAchievements;