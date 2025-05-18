import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { IoMdAdd } from "react-icons/io";
import NavBar from '../../Components/NavBar/NavBar';
import { FaVideo, FaImage, FaUpload } from "react-icons/fa";
import { HiCalendarDateRange } from "react-icons/hi2";
import VoiceInput from '../../Components/VoiceInput/VoiceInput';
import './AddLearningPlan.css';

function AddLearningPlan() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentURL, setContentURL] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showContentURLInput, setShowContentURLInput] = useState(false);
  const [showImageUploadInput, setShowImageUploadInput] = useState(false);
  const [templateID, setTemplateID] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');
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
  const [video, setVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [showVideoUploadInput, setShowVideoUploadInput] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 30 * 1024 * 1024) {
        alert("Video must be less than 30MB");
        e.target.value = '';
        return;
      }
      
      setVideoLoading(true);
      const video = document.createElement('video');
      video.preload = 'metadata';
      const blobURL = URL.createObjectURL(file);
      
      video.onloadedmetadata = function() {
        URL.revokeObjectURL(blobURL);
        if (video.duration > 30) {
          alert("Video must be less than 30 seconds long");
          setVideo(null);
          setVideoPreview(null);
          setVideoLoading(false);
          e.target.value = '';
          return;
        }
        setVideo(file);
        const objectUrl = URL.createObjectURL(file);
        setVideoPreview(objectUrl);
        setVideoLoading(false);
      }
      
      video.onerror = function() {
        alert("Failed to load video. Please try another file.");
        setVideoLoading(false);
        e.target.value = '';
      }
      
      video.src = blobURL;
    }
  };

  const handleVideoUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(
        'http://localhost:8080/learningPlan/videoUpload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Video upload error:', error);
      throw error;
    }
  };

  const VideoPreview = ({ src }) => (
    <div className="ALPvideo-preview-wrapper">
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="ALPupload-progress">
          <div 
            className="ALPupload-progress-bar" 
            style={{ width: `${uploadProgress}%` }}
          />
          <span>{uploadProgress}%</span>
        </div>
      )}
      <video
        controls
        className="ALPvideo-preview"
        preload="metadata"
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );

  const navigate = useNavigate();

  const handleAddTag = () => {
    if (tagInput.trim() !== '') {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleVoiceInput = (field, text, isFinal) => {
    if (isFinal) {
      setTranscribedText(prev => ({ ...prev, [field]: text }));
      if (field === 'title') {
        setTitle(prev => prev ? `${prev} ${text}` : text);
        setInterimText(prev => ({ ...prev, title: '' }));
      } else if (field === 'description') {
        setDescription(prev => prev ? `${prev} ${text}` : text);
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
    setIsSubmitting(true);
    setUploadProgress(0);

    if (startDate === endDate) {
      alert("Start date and end date cannot be the same.");
      setIsSubmitting(false);
      return;
    }

    if (startDate > endDate) {
      alert("Start date cannot be greater than end date.");
      setIsSubmitting(false);
      return;
    }

    const postOwnerID = localStorage.getItem('userID');
    const postOwnerName = localStorage.getItem('userFullName');

    if (!postOwnerID) {
      alert('Please log in to add a post.');
      navigate('/');
      return;
    }

    if (tags.length < 2) {
      alert("Please add at least two tags.");
      setIsSubmitting(false);
      return;
    }

    if (!templateID) {
      alert("Please select a template.");
      setIsSubmitting(false);
      return;
    }

    try {
      let imageUrl = '';
      let videoUrl = '';

      if (image) {
        const formData = new FormData();
        formData.append('file', image);
        const uploadResponse = await axios.post('http://localhost:8080/learningPlan/planUpload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        imageUrl = uploadResponse.data;
      }

      if (video) {
        try {
          videoUrl = await handleVideoUpload(video);
        } catch (error) {
          alert('Failed to upload video. Please try again.');
          setIsSubmitting(false);
          return;
        }
      }

      const newPost = {
        title,
        description,
        contentURL,
        tags,
        postOwnerID,
        postOwnerName,
        imageUrl,
        videoUrl,
        templateID,
        startDate,
        endDate,
        category
      };

      await axios.post('http://localhost:8080/learningPlan', newPost);
      alert('Post added successfully!');
      navigate('/allLearningPlan');
    } catch (error) {
      console.error('Error details:', error.response || error);
      alert('Failed to create post: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const getEmbedURL = (url) => {
    try {
      if (url.includes('youtube.com/watch')) {
        const videoId = new URL(url).searchParams.get('v');
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      return url;
    } catch (error) {
      console.error('Invalid URL:', url);
      return '';
    }
  };

  return (
    <div className="ALPadd-learning-plan-container">
      <NavBar />
      <div className="ALPadd-learning-plan-content">
        <h1 className="ALPadd-learning-plan-title">Create Learning Plan</h1>
        <div className="ALPtemplate-preview-container">
          <div className="ALPtemplate ALPtemplate-1">
            <p className="ALPtemplate-id">Template 1</p>
            <h3 className="ALPtemplate-title">{title || "Title Preview"}</h3>
            <p className="ALPtemplate-dates"><HiCalendarDateRange /> {startDate || "Start"} to {endDate || "End"}</p>
            <p className="ALPtemplate-category">{category || "Category"}</p>
            <hr className="ALPtemplate-divider" />
            <p className="ALPtemplate-description">{description || "Description Preview"}</p>
            <div className="ALPtemplate-tags">
              {tags.map((tag, index) => (
                <span key={index} className="ALPtemplate-tag">#{tag}</span>
              ))}
            </div>
            {imagePreview && <img src={imagePreview} alt="Preview" className="ALPtemplate-media" />}
            {videoPreview && <VideoPreview src={videoPreview} />}
            {contentURL && (
              <iframe
                src={getEmbedURL(contentURL)}
                title="Content Preview"
                className="ALPtemplate-media"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            )}
          </div>
          <div className="ALPtemplate ALPtemplate-2">
            <p className="ALPtemplate-id">Template 2</p>
            <h3 className="ALPtemplate-title">{title || "Title Preview"}</h3>
            <p className="ALPtemplate-dates"><HiCalendarDateRange /> {startDate || "Start"} to {endDate || "End"}</p>
            <p className="ALPtemplate-category">{category || "Category"}</p>
            <hr className="ALPtemplate-divider" />
            <p className="ALPtemplate-description">{description || "Description Preview"}</p>
            <div className="ALPtemplate-tags">
              {tags.map((tag, index) => (
                <span key={index} className="ALPtemplate-tag">#{tag}</span>
              ))}
            </div>
            <div className="ALPtemplate-media-split">
              <div className="ALPtemplate-media-split-item">
                {imagePreview && <img src={imagePreview} alt="Preview" className="ALPtemplate-media" />}
              </div>
              <div className="ALPtemplate-media-split-item">
                {videoPreview && <VideoPreview src={videoPreview} />}
                {contentURL && (
                  <iframe
                    src={getEmbedURL(contentURL)}
                    title="Content Preview"
                    className="ALPtemplate-media"
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                )}
              </div>
            </div>
          </div>
          <div className="ALPtemplate ALPtemplate-3">
            <p className="ALPtemplate-id">Template 3</p>
            {imagePreview && <img src={imagePreview} alt="Preview" className="ALPtemplate-media" />}
            {videoPreview && <VideoPreview src={videoPreview} />}
            {contentURL && (
              <iframe
                src={getEmbedURL(contentURL)}
                title="Content Preview"
                className="ALPtemplate-media"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            )}
            <h3 className="ALPtemplate-title">{title || "Title Preview"}</h3>
            <p className="ALPtemplate-dates"><HiCalendarDateRange /> {startDate || "Start"} to {endDate || "End"}</p>
            <p className="ALPtemplate-category">{category || "Category"}</p>
            <hr className="ALPtemplate-divider" />
            <p className="ALPtemplate-description">{description || "Description Preview"}</p>
            <div className="ALPtemplate-tags">
              {tags.map((tag, index) => (
                <span key={index} className="ALPtemplate-tag">#{tag}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="ALPform-card">
          <h2 className="ALPform-title">Add Learning Plan</h2>
          <form onSubmit={handleSubmit} className="ALPform">
            <div className="ALPform-group">
              <label className="ALPform-label">Title</label>
              <div className="ALPinput-container">
                <input
                  className={`ALPform-input ${isListening.title ? 'ALPlistening' : ''}`}
                  type="text"
                  value={isListening.title ? `${title} ${interimText.title}` : title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={isListening.title ? 'Listening...' : 'Enter title'}
                  required
                />
                <VoiceInput 
                  onTextUpdate={handleVoiceInput} 
                  fieldName="title"
                  isListening={isListening.title}
                  onStartListening={() => startVoiceInput('title')}
                />
                {(transcribedText.title || interimText.title) && (
                  <div className={`ALPtranscribed-text ${isListening.title ? 'ALPlistening' : 'ALPcompleted'}`}>
                    {isListening.title ? 
                      `Recording: ${interimText.title}` : 
                      `Latest: ${transcribedText.title}`}
                  </div>
                )}
              </div>
            </div>

            <div className="ALPform-group">
              <label className="ALPform-label">Tags (minimum 2)</label>
              <div className="ALPtags-container">
                {tags.map((tag, index) => (
                  <span key={index} className="ALPtag">#{tag}</span>
                ))}
              </div>
              <div className="ALPtag-input-container">
                <input
                  className="ALPform-input"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Enter tag"
                />
                <button type="button" onClick={handleAddTag} className="ALPadd-tag-button">
                  <IoMdAdd />
                </button>
              </div>
            </div>

            <div className="ALPform-group">
              <label className="ALPform-label">Description</label>
              <div className="ALPinput-container">
                <textarea
                  className={`ALPform-input ${isListening.description ? 'ALPlistening' : ''}`}
                  value={isListening.description ? `${description} ${interimText.description}` : description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={isListening.description ? 'Listening...' : 'Enter description'}
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
                  <div className={`ALPtranscribed-text ${isListening.description ? 'ALPlistening' : 'ALPcompleted'}`}>
                    {isListening.description ? 
                      `Recording: ${interimText.description}` : 
                      `Latest: ${transcribedText.description}`}
                  </div>
                )}
              </div>
            </div>

            <div className="ALPform-group">
              <label className="ALPform-label">Template</label>
              <select
                className="ALPform-input"
                value={templateID || ''}
                onChange={(e) => setTemplateID(e.target.value)}
                required
              >
                <option value="" disabled>Select Template</option>
                <option value="1">Template 1</option>
                <option value="2">Template 2</option>
                <option value="3">Template 3</option>
              </select>
            </div>

            <div className="ALPform-group">
              <label className="ALPform-label">Start Date</label>
              <input
                className="ALPform-input"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="ALPform-group">
              <label className="ALPform-label">End Date</label>
              <input
                className="ALPform-input"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>

            <div className="ALPform-group">
              <label className="ALPform-label">Category</label>
              <select
                className="ALPform-input"
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

            <div className="ALPform-group ALPmedia-options">
              <label className="ALPform-label">Media Options</label>
              <div className="ALPmedia-buttons">
                <button
                  type="button"
                  className={`ALPmedia-button ${showImageUploadInput ? 'ALPactive' : ''}`}
                  onClick={() => setShowImageUploadInput(!showImageUploadInput)}
                  title="Upload Image"
                >
                  <FaImage />
                </button>
                <button
                  type="button"
                  className={`ALPmedia-button ${showContentURLInput ? 'ALPactive' : ''}`}
                  onClick={() => setShowContentURLInput(!showContentURLInput)}
                  title="Add Video URL"
                >
                  <FaVideo />
                </button>
                <button
                  type="button"
                  className={`ALPmedia-button ${showVideoUploadInput ? 'ALPactive' : ''}`}
                  onClick={() => setShowVideoUploadInput(!showVideoUploadInput)}
                  title="Upload Video"
                >
                  <FaUpload />
                </button>
              </div>
            </div>

            {showContentURLInput && (
              <div className="ALPform-group">
                <label className="ALPform-label">Content URL (YouTube)</label>
                <input
                  className="ALPform-input"
                  type="url"
                  value={contentURL}
                  onChange={(e) => setContentURL(e.target.value)}
                  placeholder="Enter YouTube URL"
                />
              </div>
            )}

            {showImageUploadInput && (
              <div className="ALPform-group">
                <label className="ALPform-label">Upload Image</label>
                {imagePreview && (
                  <div className="ALPmedia-preview">
                    <img src={imagePreview} alt="Preview" className="ALPpreview-img" />
                  </div>
                )}
                <input
                  className="ALPfile-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
            )}

            {showVideoUploadInput && (
              <div className="ALPform-group">
                <label className="ALPform-label">Upload Video (Max 30s, 30MB)</label>
                {videoPreview && <VideoPreview src={videoPreview} />}
                {videoLoading && <div className="ALPloading-spinner">Loading...</div>}
                <input
                  className="ALPfile-input"
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                />
              </div>
            )}

            <button
              type="submit"
              className="ALPsubmit-button"
              disabled={isSubmitting || videoLoading}
            >
              {isSubmitting ? 'Submitting...' : 'Create Learning Plan'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddLearningPlan;