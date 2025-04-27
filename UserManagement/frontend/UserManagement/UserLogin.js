import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './user.css'
import GoogalLogo from './img/glogo.png'
function UserLogin() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Login attempt:', formData);
    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('userID', data.id); // Save user ID in local storage
        alert('Login successful!');
        navigate('/allPost');
      } else if (response.status === 401) {
        alert('Invalid credentials!');
      } else {
        alert('Failed to login!');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="Auth_container">
      <div className="Auth_innerContainer">

        <div className="Auth_content new_content">
          <div className="Auth_logo"></div>
          <div className='login_content'>
            <p className="Auth_heading">Login Your Account </p>
            
          </div>
          <form onSubmit={handleSubmit} className="Auth_form">
            <div className="Auth_formGroup">
              <label className="Auth_label">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="Auth_input"
              />
            </div>
            <div className="Auth_formGroup">
              <label className="Auth_label">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="Auth_input"
              />
            </div>
            <button type="submit" className="Auth_button">Login</button>
            <p className="Auth_signupPrompt">
              Don’t have an account? <span onClick={() => (window.location.href = '/register')} className="Auth_signupLink">Sign up for free</span>
            </p>
          </form>
          <button
            onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/google'}
            className="Auth_googleButton"
          >
            <img src={GoogalLogo} alt='glogo' className='glogo' />
            Sign in with Google
          </button>
        </div>
        <div className="Auth_content">
          <div className="Auth_content_img"></div>
        </div>
      </div>
    </div>
  );
}

export default UserLogin;
