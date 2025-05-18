import React, { useState, useRef } from 'react';
import axios from 'axios';
import NavBar from '../../Components/NavBar/NavBar';
import VoiceInput from '../../Components/VoiceInput/VoiceInput';
import './AddNewPost.css';
import { FaImage, FaVideo } from 'react-icons/fa';

function AddNewPost() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [media, setMedia] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [category, setCategory] = useState('');
  const [isListening, setIsListening] = useState({ title: false, description: false });
  const [interimText, setInterimText] = useState({ title: '', description: '' });
  const [transcribedText, setTranscribedText] = useState({ title: '', description: '' });
  const [voiceHistory, setVoiceHistory] = useState({ title: [], description: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userID = localStorage.getItem('userID');
  const fileInputRef = useRef(null);

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    const maxFileSize = 50 * 1024 * 1024; // 50MB
    let imageCount = media.filter((file) => file.type.startsWith('image/')).length;
    let videoCount = media.filter((file) => file.type === 'video/mp4').length;
    const newPreviews = [...mediaPreviews];
    const newMedia = [...media];

    const processFile = (file) => {
      return new Promise((resolve, reject) => {
        if (file.size > maxFileSize) {
          reject(`File ${file.name} exceeds the maximum size of 50MB.`);
          return;
        }

        if (file.type.startsWith('image/')) {
          if (imageCount >= 3) {
            reject('You can upload a maximum of 3 images.');
            return;
          }
          imageCount++;
          resolve({ file, preview: { type: file.type, url: URL.createObjectURL(file) } });
        } else if (file.type === 'video/mp4') {
          if (videoCount >= 1) {
            reject('You can upload only 1 video.');
            return;
          }
          const video = document.createElement('video');
          video.preload = 'metadata';
          video.src = URL.createObjectURL(file);
          video.onloadedmetadata = () => {
            URL.revokeObjectURL(video.src);
            if (video.duration > 30) {
              reject(`Video ${file.name} exceeds the maximum duration of 30 seconds.`);
            } else {
              videoCount++;
              resolve({ file, preview: { type: file.type, url: URL.createObjectURL(file) } });
            }
          };
          video.onerror = () => reject('Error processing video file.');
        } else {
          reject(`Unsupported file type: ${file.type}`);
        }
      });
    };

    Promise.all(files.map(processFile))
      .then((results) => {
        results.forEach(({ file, preview }) => {
          newMedia.push(file);
          newPreviews.push(preview);
        });
        setMedia(newMedia);
        setMediaPreviews(newPreviews);
      })
      .catch((error) => {
        alert(error);
        fileInputRef.current.value = '';
      });
  };

  const removeMedia = (index) => {
    const newMedia = media.filter((_, i) => i !== index);
    const newPreviews = mediaPreviews.filter((_, i) => i !== index);
    setMedia(newMedia);
    setMediaPreviews(newPreviews);
    mediaPreviews[index].url && URL.revokeObjectURL(mediaPreviews[index].url);
    fileInputRef.current.value = '';
  };

  const handleVoiceInput = (field, text, isFinal) => {
    if (isFinal) {
      const finalText = text.trim();
      setTranscribedText((prev) => ({ ...prev, [field]: finalText }));
      setVoiceHistory((prev) => ({
        ...prev,
        [field]: [...prev[field], finalText].slice(-5), // Keep last 5 entries
      }));
      if (field === 'title') {
        setTitle((prev) => (prev ? `${prev} ${finalText}` : finalText).trim());
      } else if (field === 'description') {
        setDescription((prev) => (prev ? `${prev} ${finalText}` : finalText).trim());
      }
      setIsListening((prev) => ({ ...prev, [field]: false }));
    } else {
      setInterimText((prev) => ({ ...prev, [field]: text }));
    }
  };

  const startVoiceInput = (field) => {
    setIsListening((prev) => ({ ...prev, [field]: true }));
    setInterimText((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userID) {
      alert('Please log in to create a post.');
      return;
    }
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('userID', userID);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    media.forEach((file) => formData.append('mediaFiles', file));

    try {
      await axios.post('http://localhost:8080/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Post created successfully!');
      window.location.href = '/myAllPost';
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ANPadd-post-container">
      <NavBar />
      <div className="ANPadd-post-content">
        <h1 className="ANPadd-post-title">Create New Post</h1>
        <div className="ANPform-card">
          <form onSubmit={handleSubmit} className="ANPform">
            <div className="ANPform-group">
              <label className="ANPform-label">Title</label>
              <div className="ANPinput-container">
                <input
                  className={`ANPform-input ${isListening.title ? 'ANPlistening' : ''}`}
                  type="text"
                  placeholder={isListening.title ? 'Listening...' : 'Enter title'}
                  value={isListening.title ? `${title} ${interimText.title}` : title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <VoiceInput
                  onTextUpdate={handleVoiceInput}
                  fieldName="title"
                  isListening={isListening.title}
                  onStartListening={() => startVoiceInput('title')}
                />
                {(transcribedText.title || interimText.title) && (
                  <div className={`ANPtranscribed-text ${isListening.title ? 'ANPlistening' : 'ANPcompleted'}`}>
                    {isListening.title ? `Recording: ${interimText.title}` : `Latest: ${transcribedText.title}`}
                  </div>
                )}
                {voiceHistory.title.length > 0 && (
                  <div className="ANPvoice-history">
                    <p className="ANPvoice-history-title">Voice Input History</p>
                    {voiceHistory.title.map((text, index) => (
                      <div key={index} className="ANPvoice-history-item">{text}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="ANPform-group">
              <label className="ANPform-label">Description</label>
              <div className="ANPinput-container">
                <textarea
                  className={`ANPform-input ${isListening.description ? 'ANPlistening' : ''}`}
                  placeholder={isListening.description ? 'Listening...' : 'Enter description'}
                  value={isListening.description ? `${description} ${interimText.description}` : description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows="5"
                />
                <VoiceInput
                  onTextUpdate={handleVoiceInput}
                  fieldName="description"
                  isListening={isListening.description}
                  onStartListening={() => startVoiceInput('description')}
                />
                {(transcribedText.description || interimText.description) && (
                  <div className={`ANPtranscribed-text ${isListening.description ? 'ANPlistening' : 'ANPcompleted'}`}>
                    {isListening.description ? `Recording: ${interimText.description}` : `Latest: ${transcribedText.description}`}
                  </div>
                )}
                {voiceHistory.description.length > 0 && (
                  <div className="ANPvoice-history">
                    <p className="ANPvoice-history-title">Voice Input History</p>
                    {voiceHistory.description.map((text, index) => (
                      <div key={index} className="ANPvoice-history-item">{text}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="ANPform-group">
              <label className="ANPform-label">Category</label>
              <select
                className="ANPform-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="" disabled>Select Category</option>
                <option value="Tech">Tech</option>
                <option value="Programming">Programming</option>
                <option value="Cooking">Cooking</option>
                <option value="Photography">Photography</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="ANPform-group">
              <label className="ANPform-label">Media (Max 3 images, 1 video)</label>
              {mediaPreviews.length > 0 && (
                <div className="ANPmedia-preview-grid">
                  {mediaPreviews.map((preview, index) => (
                    <div key={index} className="ANPmedia-preview-item">
                      {preview.type.startsWith('video/') ? (
                        <video controls className="ANPmedia-preview">
                          <source src={preview.url} type={preview.type} />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <img className="ANPmedia-preview" src={preview.url} alt={`Preview ${index}`} />
                      )}
                      <button
                        type="button"
                        className="ANPremove-media-btn"
                        onClick={() => removeMedia(index)}
                        title="Remove Media"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <input
                className="ANPfile-input"
                type="file"
                accept="image/jpeg,image/png,image/jpg,video/mp4"
                multiple
                onChange={handleMediaChange}
                ref={fileInputRef}
              />
            </div>

            <button type="submit" className="ANPsubmit-button" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Create Post'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddNewPost;