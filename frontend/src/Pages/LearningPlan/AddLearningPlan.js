import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { IoMdAdd } from "react-icons/io";
import './post.css';
import './Templates.css'; // Import the updated CSS file
import NavBar from '../../Components/NavBar/NavBar';
import { FaVideo } from "react-icons/fa";
import { FaImage } from "react-icons/fa";
import { HiCalendarDateRange } from "react-icons/hi2";
import VoiceInput from '../../Components/VoiceInput/VoiceInput';

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

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

      // Create the new post object
      const newPost = {
        title,
        description,
        contentURL,
        tags,
        postOwnerID,
        postOwnerName,
        imageUrl,
        templateID,
        startDate, // New field
        endDate,   // New field
        category   // New field
      };

      // Submit the post data
      await axios.post('http://localhost:8080/learningPlan', newPost);
      alert('Post added successfully!');
      navigate('/allLearningPlan');
    } catch (error) {
      console.error('Error adding post:', error);
      alert('Failed to add post.');
    } finally {
      setIsSubmitting(false);
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
      return url; // Return the original URL if it's not a YouTube link
    } catch (error) {
      console.error('Invalid URL:', url);
      return ''; // Return an empty string for invalid URLs
    }
  };

  return (
    <div>
      <div className='continer'>
        <NavBar />
        <div className='continSection'>
          <div className="template-preview-container">
            {/* Template 1 */}
            <div className="template template-1">
              <p className='template_id_one'>template 1</p>
              <p className='template_title'>{title || "Title Preview"}</p>
              <p className='template_dates'><HiCalendarDateRange /> {startDate} to {endDate} </p>
              <p className='template_description'>{category}</p>
              <hr></hr>
              <p className='template_description'>{description || "Description Preview"}</p>
              <div className="tags_preview">
                {tags.map((tag, index) => (
                  <span key={index} className="tagname">#{tag}</span>
                ))}
              </div>
              {imagePreview && <img src={imagePreview} alt="Preview" className="iframe_preview" />}
              {contentURL && (
                <iframe
                  src={getEmbedURL(contentURL)}
                  title="Content Preview"
                  className="iframe_preview"
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              )}

            </div>
            {/* Template 2 */}
            <div className="template template-2">
              <p className='template_id_one'>template 2</p>
              <p className='template_title'>{title || "Title Preview"}</p>
              <p className='template_dates'><HiCalendarDateRange /> {startDate} to {endDate} </p>
              <p className='template_description'>{category}</p>
              <hr></hr>
              <p className='template_description'>{description || "Description Preview"}</p>
              <div className="tags_preview">
                {tags.map((tag, index) => (
                  <span key={index} className="tagname">#{tag}</span>
                ))}
              </div>
              <div className='preview_part'>
                <div className='preview_part_sub'>
                  {imagePreview && <img src={imagePreview} alt="Preview" className="iframe_preview_new" />}
                </div>
                <div className='preview_part_sub'>
                  {contentURL && (
                    <iframe
                      src={getEmbedURL(contentURL)}
                      title="Content Preview"
                      className="iframe_preview_new"
                      frameBorder="0"
                      allowFullScreen
                    ></iframe>
                  )}
                </div>
              </div>
            </div>
            {/* Template 3 */}
            <div className="template template-3">
              <p className='template_id_one'>template 3</p>
              {imagePreview && <img src={imagePreview} alt="Preview" className="iframe_preview" />}
              {contentURL && (
                <iframe
                  src={getEmbedURL(contentURL)}
                  title="Content Preview"
                  className="iframe_preview"
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              )}
              <p className='template_title'>{title || "Title Preview"}</p>

              <p className='template_dates'><HiCalendarDateRange /> {startDate} to {endDate} </p>
              <p className='template_description'>{category}</p>
              <hr></hr>
              <p className='template_description'>{description || "Description Preview"}</p>
              <div className="tags_preview">
                {tags.map((tag, index) => (
                  <span key={index} className="tagname">#{tag}</span>
                ))}
              </div>

            </div>
          </div>
          <div className="from_continer">
            <p className="Auth_heading">Add Learning Post</p>
            <form onSubmit={handleSubmit} className='from_data'>
              <div className="Auth_formGroup">
                <label className="Auth_label">Title</label>
                <div className="input-with-voice">
                  <input
                    className={`Auth_input ${isListening.title ? 'listening' : ''}`}
                    type="text"
                    value={isListening.title ? `${title} ${interimText.title}` : title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={isListening.title ? 'Listening...' : 'Title'}
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
                <label className="Auth_label">Tags</label>
                <div className='skil_dis_con'>
                  {tags.map((tag, index) => (
                    <p className='skil_name' key={index}>
                      #{tag}
                    </p>
                  ))}
                </div>
                <div className='skil_addbtn'>
                  <input
                    className="Auth_input"
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                  />
                  <IoMdAdd onClick={handleAddTag} className="add_s_btn" />
                </div>
              </div>
              <div className="Auth_formGroup">
                <label className="Auth_label">Description</label>
                <div className="input-with-voice">
                  <textarea
                    className={`Auth_input ${isListening.description ? 'listening' : ''}`}
                    value={isListening.description ? `${description} ${interimText.description}` : description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={isListening.description ? 'Listening...' : 'Description'}
                    required
                    rows={4}
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
                <label className="Auth_label">Select Your Template</label>
                <select
                  className="Auth_input"
                  value={templateID}
                  onChange={(e) => setTemplateID(e.target.value)}
                  required
                >
                  <option value="" >Select Template ID</option>
                  <option value="1">Template 1</option>
                  <option value="2">Template 2</option>
                  <option value="3">Template 3</option>
                </select>
              </div>
              <div className="Auth_formGroup">
                <label className="Auth_label">Start Date</label>
                <input
                  className="Auth_input"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="Auth_formGroup">
                <label className="Auth_label">End Date</label>
                <input
                  className="Auth_input"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
              <div className="Auth_formGroup">
                <label className="Auth_label">Category</label>
                <select
                  className="Auth_input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="" disabled>Select Category</option>
                  <option value="Tech">Tech</option>
                  <option value="Programming">Programming</option>
                  <option value="Cooking">Cooking</option>
                  <option value="Photography">Photography</option>
                  <option value="Photography">Other</option>
                </select>
              </div>
              <hr ></hr>
              <div className="Auth_formGroup newpart_set">
                <FaVideo
                  className='newpart_set_icon'
                  onClick={() => setShowContentURLInput(!showContentURLInput)}
                />
                <FaImage
                  className='newpart_set_icon'
                  onClick={() => setShowImageUploadInput(!showImageUploadInput)}
                />
              </div>
              {showContentURLInput && (
                <div className="Auth_formGroup">
                  <label className="Auth_label">Content URL</label>
                  <input
                    className="Auth_input"
                    type="url"
                    value={contentURL}
                    onChange={(e) => setContentURL(e.target.value)}
                  />
                </div>
              )}
              {showImageUploadInput && (
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
                  />
                </div>
              )}

              <button
                type="submit"
                className="Auth_button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddLearningPlan;