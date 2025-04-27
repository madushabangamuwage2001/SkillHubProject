import React, { useState, useEffect } from 'react';
import NavBar from '../../Components/NavBar/NavBar';

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setImagePreview(file ? URL.createObjectURL(file) : null); 
  };

  useEffect(() => {
    const userId = localStorage.getItem('userID');
    if (userId) {
      setFormData((prevData) => ({ ...prevData, postOwnerID: userId }));
      fetch(`http://localhost:8080/user/${userId}`)
        .then((response) => response.json())
        .then((data) => {
          if (data && data.fullname) {
            setFormData((prevData) => ({ ...prevData, postOwnerName: data.fullname }));
          }
        })
        .catch((error) => console.error('Error fetching user data:', error));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let imageUrl = '';
    if (image) {
      const formData = new FormData();
      formData.append('file', image);
      const uploadResponse = await fetch('http://localhost:8080/achievements/upload', {
        method: 'POST',
        body: formData,
      });
      imageUrl = await uploadResponse.text();
    }

    const response = await fetch('http://localhost:8080/achievements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, imageUrl }),
    });
    if (response.ok) {
      alert('Achievements added successfully!');
      window.location.href = '/myAchievements';
    } else {
      alert('Failed to add Achievements.');
    }
  };

  return (
    <div>
      <div className='continer'>
        <NavBar/>
        <div className='continSection'>
          <div className="from_continer">
            <p className="Auth_heading">Add Achievements</p>
            <form
              onSubmit={(e) => {
                handleSubmit(e);
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
              }}
              className='from_data'
            >
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
                  required
                />
                
              </div>
              <div className="Auth_formGroup">
                <label className="Auth_label">Title</label>
                <input
                  className="Auth_input"
                  name="title"
                  placeholder="Title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="Auth_formGroup">
                <label className="Auth_label">Description</label>
                <textarea
                  className="Auth_input"
                  name="description"
                  placeholder="Description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="Auth_formGroup">
                <label className="Auth_label">Category</label>
                <select
                  className="Auth_input"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
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
                <label className="Auth_label">Date</label>
                <input
                  className="Auth_input"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" className="Auth_button">Add</button>
            </form >
          </div >
        </div >
      </div >
    </div >
  );
}

export default AddAchievements;
