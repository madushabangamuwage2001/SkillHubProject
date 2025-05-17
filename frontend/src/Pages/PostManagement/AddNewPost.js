import React, { useState, useRef } from 'react';
import axios from 'axios';
import NavBar from '../../Components/NavBar/NavBar';
import VoiceInput from '../../Components/VoiceInput/VoiceInput';
import './AddNewPost.css';

function AddNewPost() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [media, setMedia] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]); // For storing media preview objects
  const [categories, setCategories] = useState(''); // New state for categories
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
  const userID = localStorage.getItem('userID');

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    const maxFileSize = 50 * 1024 * 1024; // 50MB

    let imageCount = 0;
    let videoCount = 0;
    const previews = [];

    for (const file of files) {
      if (file.size > maxFileSize) {
        alert(`File ${file.name} exceeds the maximum size of 50MB.`);
        window.location.reload();
      }

      if (file.type.startsWith('image/')) {
        imageCount++;
      } else if (file.type === 'video/mp4') {
        videoCount++;

        // Validate video duration
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = URL.createObjectURL(file);

        video.onloadedmetadata = () => {
          URL.revokeObjectURL(video.src);
          if (video.duration > 30) {
            alert(`Video ${file.name} exceeds the maximum duration of 30 seconds.`);
            window.location.reload();
          }
        };
      } else {
        alert(`Unsupported file type: ${file.type}`);
        window.location.reload();
      }

      // Add file preview object with type and URL
      previews.push({ type: file.type, url: URL.createObjectURL(file) });
    }

    if (imageCount > 3) {
      alert('You can upload a maximum of 3 images.');
      window.location.reload();
    }

    if (videoCount > 1) {
      alert('You can upload only 1 video.');
      window.location.reload();
    }

    setMedia(files);
    setMediaPreviews(previews); // Set preview objects
  };

  const handleVoiceInput = (field, text, isFinal) => {
    if (isFinal) {
      const finalText = text.trim();
      setTranscribedText(prev => ({ ...prev, [field]: finalText }));
      setVoiceHistory(prev => ({
        ...prev,
        [field]: [...prev[field], finalText]
      }));
      
      if (field === 'title') {
        setTitle(prev => {
          const newText = prev ? `${prev} ${finalText}` : finalText;
          return newText.trim();
        });
      } else if (field === 'description') {
        setDescription(prev => {
          const newText = prev ? `${prev} ${finalText}` : finalText;
          return newText.trim();
        });
      }
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
    // Keep the transcribed text visible for 3 seconds
    setTimeout(() => {
      setTranscribedText(prev => ({ ...prev, [field]: '' }));
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('userID', userID);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', categories); // Include category in form data
    media.forEach((file, index) => formData.append(`mediaFiles`, file));

    try {
      const response = await axios.post('http://localhost:8080/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Post created successfully!');
      window.location.href = '/myAllPost';
    } catch (error) {
      console.error(error);
      alert('Failed to create post.');
      window.location.reload();
    }
  };

  return (
    <div>
      <div className='continer'>
        <NavBar />
        <div className='continSection'>
          <div className="from_continer">
            <p className="Auth_heading">Create New Post</p>
            <form onSubmit={handleSubmit} className='from_data'>
              <div className="Auth_formGroup">
                <label className="Auth_label">Title</label>
                <div className="input-with-voice">
                  <input
                    className={`Auth_input ${isListening.title ? 'listening' : ''}`}
                    type="text"
                    placeholder={isListening.title ? 'Listening...' : 'Title'}
                    value={isListening.title ? `${title} ${interimText.title}` : title}
                    onChange={(e) => setTitle(e.target.value)}
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
                        <div key={index} className="voice-history-item">
                          {text}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="Auth_formGroup">
                <label className="Auth_label">Description</label>
                <div className="input-with-voice">
                  <textarea
                    className={`Auth_input ${isListening.description ? 'listening' : ''}`}
                    placeholder={isListening.description ? 'Listening...' : 'Description'}
                    value={isListening.description ? `${description} ${interimText.description}` : description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={3}
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
                        <div key={index} className="voice-history-item">
                          {text}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="Auth_formGroup">
                <label className="Auth_label">Category</label>
                <select
                  className="Auth_input"
                  value={categories}
                  onChange={(e) => setCategories(e.target.value)}
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
                <label className="Auth_label">Media</label>
                <div className='seket_media'>
                  {mediaPreviews.map((preview, index) => (
                    <div key={index}>
                      {preview.type.startsWith('video/') ? (
                        <video controls className='media_file_se'>
                          <source src={preview.url} type={preview.type} />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <img className='media_file_se' src={preview.url} alt={`Media Preview ${index}`} />
                      )}
                    </div>
                  ))}
                </div>
                <input
                  className="Auth_input"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,video/mp4"
                  multiple
                  onChange={handleMediaChange}
                />
              </div>
              <button type="submit" className="Auth_button">Submit</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddNewPost;
