import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { IoMdAdd } from "react-icons/io";
import './UpdateLearningPlan.css';
import NavBar from '../../Components/NavBar/NavBar';
import { HiCalendarDateRange } from "react-icons/hi2";
import VoiceInput from '../../Components/VoiceInput/VoiceInput';
import { FaVideo, FaImage, FaUpload } from "react-icons/fa";

function UpdateLearningPlan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentURL, setContentURL] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState('');
  const [video, setVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [existingVideo, setExistingVideo] = useState('');
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
  const [voiceHistory, setVoiceHistory] = useState({
    title: [],
    description: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showContentURLInput, setShowContentURLInput] = useState(false);
  const [showImageUploadInput, setShowImageUploadInput] = useState(false);
  const [showVideoUploadInput, setShowVideoUploadInput] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/learningPlan/${id}`);
        const { title, description, contentURL, tags, imageUrl, videoUrl, templateID, startDate, endDate, category } = response.data;
        setTitle(title);
        setDescription(description);
        setContentURL(contentURL || '');
        setTags(tags || []);
        setExistingImage(imageUrl || '');
        setExistingVideo(videoUrl || '');
        setTemplateID(templateID);
        setStartDate(startDate);
        setEndDate(endDate);
        setCategory(category);
      } catch (error) {
        console.error('Error fetching post:', error);
        alert('Failed to load learning plan.');
      }
    };

    fetchPost();
  }, [id]);

  const handleAddTag = () => {
    if (tagInput.trim() !== '') {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleDeleteTag = (index) => {
    const updatedTags = tags.filter((_, i) => i !== index);
    setTags(updatedTags);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
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
      };

      video.onerror = function() {
        alert("Failed to load video. Please try another file.");
        setVideoLoading(false);
        e.target.value = '';
      };

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
    <div className="ULPvideo-preview-wrapper">
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="ULPupload-progress">
          <div 
            className="ULPupload-progress-bar" 
            style={{ width: `${uploadProgress}%` }}
          />
          <span>{uploadProgress}%</span>
        </div>
      )}
      <video
        controls
        className="ULPvideo-preview"
        preload="metadata"
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );

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
      setIsListening(prev => ({ ...prev, [field]: false }));
    } else {
      setInterimText(prev => ({ ...prev, [field]: text }));
    }
  };

  const startVoiceInput = (field) => {
    setIsListening(prev => ({ ...prev, [field]: true }));
    setInterimText(prev => ({ ...prev, [field]: '' }));
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

    let imageUrl = existingImage;
    let videoUrl = existingVideo;

    try {
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

      const updatedPost = {
        title,
        description,
        contentURL,
        tags,
        imageUrl,
        videoUrl,
        postOwnerID: localStorage.getItem('userID'),
        postOwnerName: localStorage.getItem('userFullName'),
        templateID,
        startDate,
        endDate,
        category
      };

      await axios.put(`http://localhost:8080/learningPlan/${id}`, updatedPost);
      alert('Learning plan updated successfully!');
      navigate('/allLearningPlan');
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update learning plan: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="ULPupdate-learning-plan-container">
      <NavBar />
      <div className="ULPupdate-learning-plan-content">
        <h1 className="ULPupdate-learning-plan-title">Update Learning Plan</h1>
        <div className="ULPtemplate-preview-container">
          <div className={`ULPtemplate ULPtemplate-1 ${templateID === 1 ? 'ULPselected' : ''}`}>
            <p className="ULPtemplate-id">Template 1</p>
            <h3 className="ULPtemplate-title">{title || "Title Preview"}</h3>
            <p className="ULPtemplate-dates"><HiCalendarDateRange /> {startDate || "Start"} to {endDate || "End"}</p>
            <p className="ULPtemplate-category">{category || "Category"}</p>
            <hr className="ULPtemplate-divider" />
            <p className="ULPtemplate-description">{description || "Description Preview"}</p>
            <div className="ULPtemplate-tags">
              {tags.map((tag, index) => (
                <span key={index} className="ULPtemplate-tag">#{tag}</span>
              ))}
            </div>
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="ULPtemplate-media" />
            ) : existingImage && (
              <img src={`http://localhost:8080/learningPlan/planImages/${existingImage}`} alt="Existing" className="ULPtemplate-media" />
            )}
            {videoPreview ? (
              <VideoPreview src={videoPreview} />
            ) : existingVideo && (
              <VideoPreview src={`http://localhost:8080/learningPlan/videos/${existingVideo}`} />
            )}
            {contentURL && (
              <iframe
                src={getEmbedURL(contentURL)}
                title="Content Preview"
                className="ULPtemplate-media"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            )}
          </div>
          <div className={`ULPtemplate ULPtemplate-2 ${templateID === 2 ? 'ULPselected' : ''}`}>
            <p className="ULPtemplate-id">Template 2</p>
            <h3 className="ULPtemplate-title">{title || "Title Preview"}</h3>
            <p className="ULPtemplate-dates"><HiCalendarDateRange /> {startDate || "Start"} to {endDate || "End"}</p>
            <p className="ULPtemplate-category">{category || "Category"}</p>
            <hr className="ULPtemplate-divider" />
            <p className="ULPtemplate-description">{description || "Description Preview"}</p>
            <div className="ULPtemplate-tags">
              {tags.map((tag, index) => (
                <span key={index} className="ULPtemplate-tag">#{tag}</span>
              ))}
            </div>
            <div className="ULPtemplate-media-split">
              <div className="ULPtemplate-media-split-item">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="ULPtemplate-media" />
                ) : existingImage && (
                  <img src={`http://localhost:8080/learningPlan/planImages/${existingImage}`} alt="Existing" className="ULPtemplate-media" />
                )}
              </div>
              <div className="ULPtemplate-media-split-item">
                {videoPreview ? (
                  <VideoPreview src={videoPreview} />
                ) : existingVideo && (
                  <VideoPreview src={`http://localhost:8080/learningPlan/videos/${existingVideo}`} />
                )}
                {contentURL && (
                  <iframe
                    src={getEmbedURL(contentURL)}
                    title="Content Preview"
                    className="ULPtemplate-media"
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                )}
              </div>
            </div>
          </div>
          <div className={`ULPtemplate ULPtemplate-3 ${templateID === 3 ? 'ULPselected' : ''}`}>
            <p className="ULPtemplate-id">Template 3</p>
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="ULPtemplate-media" />
            ) : existingImage && (
              <img src={`http://localhost:8080/learningPlan/planImages/${existingImage}`} alt="Existing" className="ULPtemplate-media" />
            )}
            {videoPreview ? (
              <VideoPreview src={videoPreview} />
            ) : existingVideo && (
              <VideoPreview src={`http://localhost:8080/learningPlan/videos/${existingVideo}`} />
            )}
            {contentURL && (
              <iframe
                src={getEmbedURL(contentURL)}
                title="Content Preview"
                className="ULPtemplate-media"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            )}
            <h3 className="ULPtemplate-title">{title || "Title Preview"}</h3>
            <p className="ULPtemplate-dates"><HiCalendarDateRange /> {startDate || "Start"} to {endDate || "End"}</p>
            <p className="ULPtemplate-category">{category || "Category"}</p>
            <hr className="ULPtemplate-divider" />
            <p className="ULPtemplate-description">{description || "Description Preview"}</p>
            <div className="ULPtemplate-tags">
              {tags.map((tag, index) => (
                <span key={index} className="ULPtemplate-tag">#{tag}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="ULPform-card">
          <h2 className="ULPform-title">Update Learning Plan</h2>
          <form onSubmit={handleSubmit} className="ULPform">
            <div className="ULPform-group">
              <label className="ULPform-label">Title</label>
              <div className="ULPinput-container">
                <input
                  className={`ULPform-input ${isListening.title ? 'ULPlistening' : ''}`}
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
                  <div className={`ULPtranscribed-text ${isListening.title ? 'ULPlistening' : 'ULPcompleted'}`}>
                    {isListening.title ? 
                      `Recording: ${interimText.title}` : 
                      `Latest: ${transcribedText.title}`}
                  </div>
                )}
                {voiceHistory.title.length > 0 && (
                  <div className="ULPvoice-history">
                    <p className="ULPvoice-history-title">Voice Input History:</p>
                    {voiceHistory.title.map((text, index) => (
                      <div key={index} className="ULPvoice-history-item">{text}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="ULPform-group">
              <label className="ULPform-label">Tags (minimum 2)</label>
              <div className="ULPtags-container">
                {tags.map((tag, index) => (
                  <span key={index} className="ULPtag">
                    #{tag}
                    <span onClick={() => handleDeleteTag(index)} className="ULPdelete-tag">×</span>
                  </span>
                ))}
              </div>
              <div className="ULPtag-input-container">
                <input
                  className="ULPform-input"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Enter tag"
                />
                <button type="button" onClick={handleAddTag} className="ULPadd-tag-button">
                  <IoMdAdd />
                </button>
              </div>
            </div>

            <div className="ULPform-group">
              <label className="ULPform-label">Description</label>
              <div className="ULPinput-container">
                <textarea
                  className={`ULPform-input ${isListening.description ? 'ULPlistening' : ''}`}
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
                  <div className={`ULPtranscribed-text ${isListening.description ? 'ULPlistening' : 'ULPcompleted'}`}>
                    {isListening.description ? 
                      `Recording: ${interimText.description}` : 
                      `Latest: ${transcribedText.description}`}
                  </div>
                )}
                {voiceHistory.description.length > 0 && (
                  <div className="ULPvoice-history">
                    <p className="ULPvoice-history-title">Voice Input History:</p>
                    {voiceHistory.description.map((text, index) => (
                      <div key={index} className="ULPvoice-history-item">{text}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="ULPform-group">
              <label className="ULPform-label">Template</label>
              <select
                className="ULPform-input"
                value={templateID || ''}
                onChange={(e) => setTemplateID(Number(e.target.value))}
                required
              >
                <option value="" disabled>Select Template</option>
                <option value="1">Template 1</option>
                <option value="2">Template 2</option>
                <option value="3">Template 3</option>
              </select>
            </div>

            <div className="ULPform-group">
              <label className="ULPform-label">Start Date</label>
              <input
                className="ULPform-input"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="ULPform-group">
              <label className="ULPform-label">End Date</label>
              <input
                className="ULPform-input"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>

            <div className="ULPform-group">
              <label className="ULPform-label">Category</label>
              <select
                className="ULPform-input"
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

            <div className="ULPform-group ULPmedia-options">
              <label className="ULPform-label">Media Options</label>
              <div className="ULPmedia-buttons">
                <button
                  type="button"
                  className={`ULPmedia-button ${showImageUploadInput ? 'ULPactive' : ''}`}
                  onClick={() => setShowImageUploadInput(!showImageUploadInput)}
                  title="Upload Image"
                >
                  <FaImage />
                </button>
                <button
                  type="button"
                  className={`ULPmedia-button ${showContentURLInput ? 'ULPactive' : ''}`}
                  onClick={() => setShowContentURLInput(!showContentURLInput)}
                  title="Add Video URL"
                >
                  <FaVideo />
                </button>
                <button
                  type="button"
                  className={`ULPmedia-button ${showVideoUploadInput ? 'ULPactive' : ''}`}
                  onClick={() => setShowVideoUploadInput(!showVideoUploadInput)}
                  title="Upload Video"
                >
                  <FaUpload />
                </button>
              </div>
            </div>

            {showContentURLInput && (
              <div className="ULPform-group">
                <label className="ULPform-label">Content URL (YouTube)</label>
                <input
                  className="ULPform-input"
                  type="url"
                  value={contentURL}
                  onChange={(e) => setContentURL(e.target.value)}
                  placeholder="Enter YouTube URL"
                />
              </div>
            )}

            {showImageUploadInput && (
              <div className="ULPform-group">
                <label className="ULPform-label">Upload Image</label>
                {imagePreview ? (
                  <div className="ULPmedia-preview">
                    <img src={imagePreview} alt="Preview" className="ULPpreview-img" />
                  </div>
                ) : existingImage && (
                  <div className="ULPmedia-preview">
                    <img src={`http://localhost:8080/learningPlan/planImages/${existingImage}`} alt="Existing" className="ULPpreview-img" />
                  </div>
                )}
                <input
                  className="ULPfile-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
            )}

            {showVideoUploadInput && (
              <div className="ULPform-group">
                <label className="ULPform-label">Upload Video (Max 30s, 30MB)</label>
                {videoPreview ? (
                  <VideoPreview src={videoPreview} />
                ) : existingVideo && (
                  <VideoPreview src={`http://localhost:8080/learningPlan/videos/${existingVideo}`} />
                )}
                {videoLoading && <div className="ULPloading-spinner">Loading...</div>}
                <input
                  className="ULPfile-input"
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                />
              </div>
            )}

            <button
              type="submit"
              className="ULPsubmit-button"
              disabled={isSubmitting || videoLoading}
            >
              {isSubmitting ? 'Submitting...' : 'Update Learning Plan'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdateLearningPlan;