import React, { useRef } from 'react';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';

const VoiceInput = ({ onTextUpdate, fieldName, isListening, onStartListening, onStopListening }) => {
  const recognitionRef = useRef(null);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      onStopListening && onStopListening();
    }
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = onStartListening;

      recognition.onresult = (event) => {
        const lastResult = event.results[event.results.length - 1];
        const transcript = lastResult[0].transcript;
        onTextUpdate(fieldName, transcript, lastResult.isFinal);
      };

      recognition.onend = () => {
        stopListening();
      };

      recognition.start();
    } else {
      alert('Speech recognition is not supported in this browser. Please use Chrome.');
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`voice-input-btn ${isListening ? 'listening' : ''}`}
      title={isListening ? 'Click to stop recording' : 'Click to start voice input'}
    >
      {isListening ? <FaMicrophoneSlash /> : <FaMicrophone />}
    </button>
  );
};

export default VoiceInput;
