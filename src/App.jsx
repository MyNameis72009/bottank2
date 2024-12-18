import { useState, useEffect } from 'react';
import { Box, ThemeProvider, createTheme } from '@mui/material';
import VideoConference from './components/VideoConference';
import Auth from './components/Auth';
import { generateInvestorResponse } from './services/geminiService';
import { auth } from './services/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import './App.css';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1a1a1a',
    },
  },
});

function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [user, setUser] = useState(null);
  const [synth, setSynth] = useState(null);
  const [voice, setVoice] = useState(null);

  useEffect(() => {
    // Initialize speech synthesis
    const speechSynth = window.speechSynthesis;
    setSynth(speechSynth);

    // Get and set voice
    const loadVoices = () => {
      const voices = speechSynth.getVoices();
      const preferredVoice = voices.find(
        voice => 
          voice.name.includes('Microsoft David') ||
          voice.name.includes('Google US English Male') ||
          voice.name.includes('en-US Male')
      ) || voices.find(voice => voice.lang === 'en-US');

      if (preferredVoice) {
        setVoice(preferredVoice);
      }
    };

    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (speechSynth.speaking) {
        speechSynth.cancel();
      }
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user && !aiResponse) {
        startConversation();
      }
    });

    return () => unsubscribe();
  }, []);

  const speak = (text) => {
    if (synth && voice) {
      // Cancel any ongoing speech
      if (synth.speaking) {
        synth.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = voice;
      utterance.rate = 0.9; // Slightly slower for better clarity
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      synth.speak(utterance);
    }
  };

  const startConversation = async () => {
    try {
      const response = await generateInvestorResponse("START_CONVERSATION");
      setAiResponse(response);
      speak(response);
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const handleSpeechRecognized = async (transcript) => {
    setIsProcessing(true);
    try {
      // Cancel any ongoing speech before processing new input
      if (synth && synth.speaking) {
        synth.cancel();
      }

      const response = await generateInvestorResponse(transcript);
      setAiResponse(response);
      
      // Add a small delay before speaking to prevent audio conflicts
      setTimeout(() => {
        speak(response);
      }, 100);
    } catch (error) {
      console.error('Error processing speech:', error);
      const errorMessage = 'I apologize, but I encountered an error. Could you please repeat that?';
      setAiResponse(errorMessage);
      speak(errorMessage);
    }
    setIsProcessing(false);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      {!user ? (
        <Auth />
      ) : (
        <Box sx={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
          <VideoConference 
            onSpeechRecognized={handleSpeechRecognized}
            isProcessing={isProcessing}
            aiResponse={aiResponse}
          />
        </Box>
      )}
    </ThemeProvider>
  );
}

export default App;
