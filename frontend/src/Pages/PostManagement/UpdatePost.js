import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../../Components/NavBar/NavBar';
import VoiceInput from '../../Components/VoiceInput/VoiceInput';

function UpdatePost() {
  const { id } = useParams(); // Get the post ID from the URL
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(''); // New state for category
  const [existingMedia, setExistingMedia] = useState([]); // Initialize as an empty array
  const [newMedia, setNewMedia] = useState([]); // New media files to upload
  const [loading, setLoading] = useState(true); // Add loading state
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

  useEffect(() => {
    // Fetch the post details
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/posts/${id}`);
        const post = response.data;
        setTitle(post.title || ''); // Ensure title is not undefined
        setDescription(post.description || ''); // Ensure description is not undefined
        setCategory(post.category || ''); // Set category
        setExistingMedia(post.media || []); // Ensure media is an array
        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error('Error fetching post:', error);
        alert('Failed to fetch post details.');
        setLoading(false); // Set loading to false even if there's an error
      }
    };

    fetchPost();
  }, [id]);

  const handleDeleteMedia = async (mediaUrl) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this media file?');
    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/posts/${id}/media`, {
        data: { mediaUrl },
      });
      setExistingMedia(existingMedia.filter((url) => url !== mediaUrl)); // Remove from UI
      alert('Media file deleted successfully!');
    } catch (error) {
      console.error('Error deleting media file:', error);
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

      video.onerror = () => {
        reject(`Failed to load video metadata for ${file.name}.`);
      };
    });
  };

  const handleNewMediaChange = async (e) => {
    const files = Array.from(e.target.files);
    const maxFileSize = 50 * 1024 * 1024; // 50MB
    const maxImageCount = 3;

    let imageCount = existingMedia.filter((url) => !url.endsWith('.mp4')).length;
    let videoCount = existingMedia.filter((url) => url.endsWith('.mp4')).length;

    for (const file of files) {
      if (file.size > maxFileSize) {
        alert(`File ${file.name} exceeds the maximum size of 50MB.`);
        return;
      }

      if (file.type.startsWith('image/')) {
        imageCount++;
        if (imageCount > maxImageCount) {
          alert('You can upload a maximum of 3 images.');
          return;
        }
      } else if (file.type === 'video/mp4') {
        videoCount++;
        if (videoCount > 1) {
          alert('You can upload only 1 video.');
          return;
        }

        try {
          await validateVideoDuration(file);
        } catch (error) {
          alert(error);
          return;
        }
      } else {
        alert(`Unsupported file type: ${file.type}`);
        return;
      }
    }

    setNewMedia(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category); // Include category in the update
    newMedia.forEach((file) => formData.append('newMediaFiles', file));

    try {
      await axios.put(`http://localhost:8080/posts/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Post updated successfully!');
      navigate('/allPost');
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post.');
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

  if (loading) {
    return <div>Loading...</div>; // Display a loading message while fetching data
  }

  return (
    <div>
      <div className='continer'>
        <NavBar/>
        <div className='continSection'>
          <div className="from_continer">
            <p className="Auth_heading">Update Post</p>
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
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
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
                  {existingMedia.map((mediaUrl, index) => (
                    <div key={index}>
                      {mediaUrl.endsWith('.mp4') ? (
                        <video controls className='media_file_se'>
                          <source src={`http://localhost:8080${mediaUrl}`} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <img className='media_file_se' src={`http://localhost:8080${mediaUrl}`} alt={`Media ${index}`} />
                      )}
                      <button
                      className='rem_btn'
                        onClick={() => handleDeleteMedia(mediaUrl)}

                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
                <input
                  className="Auth_input"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,video/mp4"
                  multiple
                  onChange={handleNewMediaChange}
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

export default UpdatePost;
