import React, { useState } from 'react';
import VoiceInput from '../../Components/VoiceInput/VoiceInput';
import './Register.css';

function Register() {
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    password: '',
    bio: ''
  });
  const [isListening, setIsListening] = useState({
    fullname: false,
    username: false,
    bio: false
  });
  const [interimText, setInterimText] = useState({
    fullname: '',
    username: '',
    bio: ''
  });
  const [transcribedText, setTranscribedText] = useState({
    fullname: '',
    username: '',
    bio: ''
  });
  const [voiceHistory, setVoiceHistory] = useState({
    fullname: [],
    username: [],
    bio: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVoiceInput = (field, text, isFinal) => {
    if (isFinal) {
      const finalText = text.trim();
      setTranscribedText((prev) => ({ ...prev, [field]: finalText }));
      setVoiceHistory((prev) => ({
        ...prev,
        [field]: [...prev[field], finalText]
      }));

      setFormData((prev) => ({
        ...prev,
        [field]: prev[field] ? `${prev[field]} ${finalText}` : finalText
      }));
    } else {
      setInterimText((prev) => ({ ...prev, [field]: text }));
    }
  };

  const startVoiceInput = (field) => {
    setIsListening((prev) => ({ ...prev, [field]: true }));
    setInterimText((prev) => ({ ...prev, [field]: '' }));
  };

  const stopVoiceInput = (field) => {
    setIsListening((prev) => ({ ...prev, [field]: false }));
    setTimeout(() => {
      setTranscribedText((prev) => ({ ...prev, [field]: '' }));
    }, 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add form submission logic here
  };

  return (
    <div className="register-container">
      <h1>Register</h1>
      <form onSubmit={handleSubmit} className="register-form">
        <div className="Auth_formGroup">
          <label className="Auth_label">Full Name</label>
          <div className="input-with-voice">
            <input
              className={`Auth_input ${isListening.fullname ? 'listening' : ''}`}
              type="text"
              name="fullname"
              placeholder={isListening.fullname ? 'Listening...' : 'Enter your full name'}
              value={isListening.fullname ? `${formData.fullname} ${interimText.fullname}` : formData.fullname}
              onChange={handleChange}
              required
            />
            <VoiceInput
              onTextUpdate={handleVoiceInput}
              fieldName="fullname"
              isListening={isListening.fullname}
              onStartListening={() => startVoiceInput('fullname')}
              onStopListening={() => stopVoiceInput('fullname')}
            />
            {(transcribedText.fullname || interimText.fullname) && (
              <div className={`transcribed-text ${isListening.fullname ? 'listening' : 'completed'}`}>
                {isListening.fullname
                  ? `Recording: ${interimText.fullname}`
                  : `Latest: ${transcribedText.fullname}`}
              </div>
            )}
            {voiceHistory.fullname.length > 0 && (
              <div className="voice-history">
                <p className="voice-history-title">Voice Input History:</p>
                {voiceHistory.fullname.map((text, index) => (
                  <div key={index} className="voice-history-item">
                    {text}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="Auth_formGroup">
          <label className="Auth_label">Username</label>
          <div className="input-with-voice">
            <input
              className={`Auth_input ${isListening.username ? 'listening' : ''}`}
              type="text"
              name="username"
              placeholder={isListening.username ? 'Listening...' : 'Choose a username'}
              value={isListening.username ? `${formData.username} ${interimText.username}` : formData.username}
              onChange={handleChange}
              required
            />
            <VoiceInput
              onTextUpdate={handleVoiceInput}
              fieldName="username"
              isListening={isListening.username}
              onStartListening={() => startVoiceInput('username')}
              onStopListening={() => stopVoiceInput('username')}
            />
            {(transcribedText.username || interimText.username) && (
              <div className={`transcribed-text ${isListening.username ? 'listening' : 'completed'}`}>
                {isListening.username
                  ? `Recording: ${interimText.username}`
                  : `Latest: ${transcribedText.username}`}
              </div>
            )}
            {voiceHistory.username.length > 0 && (
              <div className="voice-history">
                <p className="voice-history-title">Voice Input History:</p>
                {voiceHistory.username.map((text, index) => (
                  <div key={index} className="voice-history-item">
                    {text}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="Auth_formGroup">
          <label className="Auth_label">Password</label>
          <input
            className="Auth_input"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="Auth_formGroup">
          <label className="Auth_label">Bio</label>
          <div className="input-with-voice">
            <textarea
              className={`Auth_input ${isListening.bio ? 'listening' : ''}`}
              name="bio"
              placeholder={isListening.bio ? 'Listening...' : 'Tell us about yourself'}
              value={isListening.bio ? `${formData.bio} ${interimText.bio}` : formData.bio}
              onChange={handleChange}
              rows={3}
            />
            <VoiceInput
              onTextUpdate={handleVoiceInput}
              fieldName="bio"
              isListening={isListening.bio}
              onStartListening={() => startVoiceInput('bio')}
              onStopListening={() => stopVoiceInput('bio')}
            />
            {(transcribedText.bio || interimText.bio) && (
              <div className={`transcribed-text ${isListening.bio ? 'listening' : 'completed'}`}>
                {isListening.bio
                  ? `Recording: ${interimText.bio}`
                  : `Latest: ${transcribedText.bio}`}
              </div>
            )}
            {voiceHistory.bio.length > 0 && (
              <div className="voice-history">
                <p className="voice-history-title">Voice Input History:</p>
                {voiceHistory.bio.map((text, index) => (
                  <div key={index} className="voice-history-item">
                    {text}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button type="submit" className="Auth_button">
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;