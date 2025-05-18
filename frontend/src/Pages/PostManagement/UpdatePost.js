import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../../Components/NavBar/NavBar';
import VoiceInput from '../../Components/VoiceInput/VoiceInput';
import './UpdatePost.css';

function UpdatePost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [existingMedia, setExistingMedia] = useState([]);
  const [newMedia, setNewMedia] = useState([]);
  const [newMediaPreviews, setNewMediaPreviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening, setIsListening] = useState({ title: false, description: false });
  const [interimText, setInterimText] = useState({ title: '', description: '' });
  const [transcribedText, setTranscribedText] = useState({ title: '', description: '' });
  const [voiceHistory, setVoiceHistory] = useState({ title: [], description: [] });
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/posts/${id}`);
        const post = response.data;
        setTitle(post.title || '');
        setDescription(post.description || '');
        setCategory(post.category || '');
        setExistingMedia(post.media || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching post:', error);
        alert('Failed to fetch post details.');
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleDeleteMedia = async (mediaUrl) => {
    if (!window.confirm('Are you sure you want to delete this media file?')) return;
    try {
      await axios.delete(`http://localhost:8080/posts/${id}/media`, { data: { mediaUrl } });
      setExistingMedia((prev) => prev.filter((url) => url !== mediaUrl));
      alert('Media file deleted successfully!');
    } catch (error) {
      console.error('Error deleting media:', error);
      alert('Failed to delete media file.');
    }
  };

  const validateVideoDuration = (file) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = URL.createObjectURL(file);
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        if (video.duration > 30) {
          reject(`Video ${file.name} exceeds the maximum duration of 30 seconds.`);
        } else {
          resolve();
        }
      };
      video.onerror = () => reject(`Failed to load video metadata for ${file.name}.`);
    });
  };

  const handleNewMediaChange = async (e) => {
    const files = Array.from(e.target.files);
    const maxFileSize = 50 * 1024 * 1024; // 50MB
    const maxImageCount = 3;
    let imageCount = existingMedia.filter((url) => !url.endsWith('.mp4')).length + newMedia.filter((file) => file.type.startsWith('image/')).length;
    let videoCount = existingMedia.filter((url) => url.endsWith('.mp4')).length + newMedia.filter((file) => file.type === 'video/mp4').length;
    const newPreviews = [...newMediaPreviews];
    const newFiles = [...newMedia];

    const processFile = (file) => {
      return new Promise((resolve, reject) => {
        if (file.size > maxFileSize) {
          reject(`File ${file.name} exceeds the maximum size of 50MB.`);
          return;
        }
        if (file.type.startsWith('image/')) {
          if (imageCount >= maxImageCount) {
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
          validateVideoDuration(file)
            .then(() => {
              videoCount++;
              resolve({ file, preview: { type: file.type, url: URL.createObjectURL(file) } });
            })
            .catch(reject);
        } else {
          reject(`Unsupported file type: ${file.type}`);
        }
      });
    };

    try {
      const results = await Promise.all(files.map(processFile));
      results.forEach(({ file, preview }) => {
        newFiles.push(file);
        newPreviews.push(preview);
      });
      setNewMedia(newFiles);
      setNewMediaPreviews(newPreviews);
    } catch (error) {
      alert(error);
      fileInputRef.current.value = '';
    }
  };

  const removeNewMedia = (index) => {
    const updatedMedia = newMedia.filter((_, i) => i !== index);
    const updatedPreviews = newMediaPreviews.filter((_, i) => i !== index);
    setNewMedia(updatedMedia);
    setNewMediaPreviews(updatedPreviews);
    newMediaPreviews[index].url && URL.revokeObjectURL(newMediaPreviews[index].url);
    fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    newMedia.forEach((file) => formData.append('newMediaFiles', file));

    try {
      await axios.put(`http://localhost:8080/posts/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Post updated successfully!');
      navigate('/allPost');
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoiceInput = (field, text, isFinal) => {
    if (isFinal) {
      const finalText = text.trim();
      setTranscribedText((prev) => ({ ...prev, [field]: finalText }));
      setVoiceHistory((prev) => ({
        ...prev,
        [field]: [...prev[field], finalText].slice(-5),
      }));
      if (field === 'title') {
        setTitle((prev) => (prev ? `${prev} ${finalText}` : finalText).trim());
      } else if (field === 'description') {
        setDescription((prev) => (prev ? `${prev} ${finalText}` : finalText).trim());
      }
      setIsListening((prev) => ({ ...prev, [field]: false }));
      setInterimText((prev) => ({ ...prev, [field]: '' }));
    } else {
      setInterimText((prev) => ({ ...prev, [field]: text }));
    }
  };

  const startVoiceInput = (field) => {
    setIsListening((prev) => ({ ...prev, [field]: true }));
    setInterimText((prev) => ({ ...prev, [field]: '' }));
  };

  if (loading) {
    return (
      <div className="UPloading-container">
        <div className="UPloading-spinner"></div>
        <p>Loading post details...</p>
      </div>
    );
  }

  return (
    <div className="UPupdate-post-container">
      <NavBar />
      <div className="UPupdate-post-content">
        <h1 className="UPupdate-post-title">Update Post</h1>
        <div className="UPform-card">
          <form onSubmit={handleSubmit} className="UPform">
            <div className="UPform-group">
              <label className="UPform-label">Title</label>
              <div className="UPinput-container">
                <input
                  className={`UPform-input ${isListening.title ? 'UPlistening' : ''}`}
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
                  <div className={`UPtranscribed-text ${isListening.title ? 'UPlistening' : 'UPcompleted'}`}>
                    {isListening.title ? `Recording: ${interimText.title}` : `Latest: ${transcribedText.title}`}
                  </div>
                )}
                {voiceHistory.title.length > 0 && (
                  <div className="UPvoice-history">
                    <p className="UPvoice-history-title">Voice Input History</p>
                    {voiceHistory.title.map((text, index) => (
                      <div key={index} className="UPvoice-history-item">{text}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="UPform-group">
              <label className="UPform-label">Description</label>
              <div className="UPinput-container">
                <textarea
                  className={`UPform-input ${isListening.description ? 'UPlistening' : ''}`}
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
                  <div className={`UPtranscribed-text ${isListening.description ? 'UPlistening' : 'UPcompleted'}`}>
                    {isListening.description ? `Recording: ${interimText.description}` : `Latest: ${transcribedText.description}`}
                  </div>
                )}
                {voiceHistory.description.length > 0 && (
                  <div className="UPvoice-history">
                    <p className="UPvoice-history-title">Voice Input History</p>
                    {voiceHistory.description.map((text, index) => (
                      <div key={index} className="UPvoice-history-item">{text}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="UPform-group">
              <label className="UPform-label">Category</label>
              <select
                className="UPform-input"
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
            <div className="UPform-group">
              <label className="UPform-label">Media (Max 3 images, 1 video)</label>
              {(existingMedia.length > 0 || newMediaPreviews.length > 0) && (
                <div className="UPmedia-preview-grid">
                  {existingMedia.map((mediaUrl, index) => (
                    <div key={`existing-${index}`} className="UPmedia-preview-item">
                      {mediaUrl.endsWith('.mp4') ? (
                        <video className="UPmedia-preview">
                          <source src={`http://localhost:8080${mediaUrl}`} type="video/mp4" />
                        </video>
                      ) : (
                        <img
                          className="UPmedia-preview"
                          src={`http://localhost:8080${mediaUrl}`}
                          alt={`Media ${index}`}
                        />
                      )}
                      <button
                        type="button"
                        className="UPremove-media-btn"
                        onClick={() => handleDeleteMedia(mediaUrl)}
                        title="Remove Media"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {newMediaPreviews.map((preview, index) => (
                    <div key={`new-${index}`} className="UPmedia-preview-item">
                      {preview.type.startsWith('video/') ? (
                        <video className="UPmedia-preview">
                          <source src={preview.url} type={preview.type} />
                        </video>
                      ) : (
                        <img className="UPmedia-preview" src={preview.url} alt={`New Media ${index}`} />
                      )}
                      <button
                        type="button"
                        className="UPremove-media-btn"
                        onClick={() => removeNewMedia(index)}
                        title="Remove Media"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <input
                className="UPfile-input"
                type="file"
                accept="image/jpeg,image/png,image/jpg,video/mp4"
                multiple
                onChange={handleNewMediaChange}
                ref={fileInputRef}
              />
            </div>
            <button type="submit" className="UPsubmit-button" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Post'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdatePost;