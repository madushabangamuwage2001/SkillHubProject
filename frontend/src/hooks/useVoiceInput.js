import { useState } from 'react';

export const useVoiceInput = () => {
  const [isListening, setIsListening] = useState({});
  const [interimText, setInterimText] = useState({});
  const [transcribedText, setTranscribedText] = useState({});

  const handleVoiceInput = (field, text, isFinal) => {
    if (isFinal) {
      setTranscribedText(prev => ({ ...prev, [field]: text }));
      setInterimText(prev => ({ ...prev, [field]: '' }));
      setIsListening(prev => ({ ...prev, [field]: false }));
      return text;
    } else {
      setInterimText(prev => ({ ...prev, [field]: text }));
      return '';
    }
  };

  const startVoiceInput = (field) => {
    setIsListening(prev => ({ ...prev, [field]: true }));
  };

  const stopVoiceInput = (field) => {
    setIsListening(prev => ({ ...prev, [field]: false }));
    setInterimText(prev => ({ ...prev, [field]: '' }));
  };

  return {
    isListening,
    interimText,
    transcribedText,
    handleVoiceInput,
    startVoiceInput,
    stopVoiceInput
  };
};
