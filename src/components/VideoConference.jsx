import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, IconButton, Paper, useTheme, useMediaQuery, Button } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import LogoutIcon from '@mui/icons-material/Logout';
import Webcam from 'react-webcam';
import { styled } from '@mui/material/styles';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: '#1a1a1a',
  color: '#fff',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const ChatMessage = styled(Box)(({ theme, isUser }) => ({
  padding: theme.spacing(1, 2),
  borderRadius: theme.spacing(2),
  maxWidth: '85%',
  wordBreak: 'break-word',
  marginBottom: theme.spacing(1),
  alignSelf: isUser ? 'flex-end' : 'flex-start',
  backgroundColor: isUser ? theme.palette.primary.main : '#2a2a2a',
  color: isUser ? theme.palette.primary.contrastText : '#fff',
}));

const VideoControls = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(2),
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  gap: theme.spacing(2),
  padding: theme.spacing(1, 2),
  borderRadius: theme.spacing(3),
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  zIndex: 1,
}));

const VideoConference = ({ onSpeechRecognized, isProcessing, aiResponse }) => {
  const [isListening, setIsListening] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState([]);
  const [lastSpeechTime, setLastSpeechTime] = useState(null);
  const chatContainerRef = useRef(null);
  const recognition = useRef(null);
  const webcamRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognition.current = new window.webkitSpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;

      recognition.current.onresult = (event) => {
        const current = Array.from(event.results).map(result => result[0].transcript).join('');
        setTranscript(current);
        setLastSpeechTime(Date.now());
        
        // Reset silence timeout
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
        silenceTimeoutRef.current = setTimeout(() => {
          if (isListening && current.trim()) {
            handleSilenceEnd(current);
          }
        }, 5000); // 5 seconds of silence
      };

      recognition.current.onend = () => {
        if (isListening) {
          recognition.current.start();
        }
      };
    }

    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, [isListening]);

  useEffect(() => {
    if (aiResponse) {
      setMessages(prev => [...prev, { isUser: false, text: aiResponse }]);
      scrollToBottom();
    }
  }, [aiResponse]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const handleSilenceEnd = (finalTranscript) => {
    if (finalTranscript.trim()) {
      setMessages(prev => [...prev, { isUser: true, text: finalTranscript }]);
      onSpeechRecognized(finalTranscript);
      setTranscript('');
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognition.current.stop();
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      if (transcript) {
        handleSilenceEnd(transcript);
      }
    } else {
      recognition.current.start();
      setLastSpeechTime(Date.now());
    }
    setIsListening(!isListening);
  };

  const toggleCamera = async () => {
    try {
      if (isCameraOn) {
        const stream = webcamRef.current?.video?.srcObject;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        setIsCameraOn(false);
      } else {
        await navigator.mediaDevices.getUserMedia({ video: true });
        setIsCameraOn(true);
      }
    } catch (error) {
      console.error('Camera toggle error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      if (recognition.current) {
        recognition.current.stop();
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <Box sx={{ 
      height: '100vh',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: 2,
      p: 2,
    }}>
      {/* Video Section */}
      <Box sx={{ 
        flex: isMobile ? '0 0 40vh' : '0 0 60%',
        position: 'relative',
      }}>
        <StyledPaper>
          <Box sx={{
            width: '100%',
            height: '100%',
            backgroundColor: '#000',
            borderRadius: 1,
            overflow: 'hidden',
            position: 'relative',
          }}>
            {isCameraOn ? (
              <Webcam
                ref={webcamRef}
                audio={false}
                mirrored={true}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <Box sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Typography variant="h6" color="text.secondary">
                  Camera Off
                </Typography>
              </Box>
            )}

            <VideoControls>
              <IconButton
                onClick={toggleCamera}
                sx={{
                  bgcolor: isCameraOn ? 'primary.main' : 'error.main',
                  '&:hover': {
                    bgcolor: isCameraOn ? 'primary.dark' : 'error.dark',
                  },
                }}
              >
                {isCameraOn ? <VideocamIcon /> : <VideocamOffIcon />}
              </IconButton>
              <IconButton
                onClick={toggleListening}
                sx={{
                  bgcolor: isListening ? 'error.main' : 'primary.main',
                  '&:hover': {
                    bgcolor: isListening ? 'error.dark' : 'primary.dark',
                  },
                }}
              >
                {isListening ? <MicOffIcon /> : <MicIcon />}
              </IconButton>
            </VideoControls>
          </Box>
        </StyledPaper>
      </Box>

      {/* Chat Section */}
      <Box sx={{ 
        flex: isMobile ? 1 : '0 0 40%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: isMobile ? '50vh' : 'auto',
      }}>
        <StyledPaper>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 2,
          }}>
            <Typography variant="h6">
              Chat with Investor
            </Typography>
            <Button
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={handleSignOut}
              size={isMobile ? "small" : "medium"}
            >
              Sign Out
            </Button>
          </Box>

          {/* Messages Container */}
          <Box
            ref={chatContainerRef}
            sx={{
              flex: 1,
              overflowY: 'auto',
              mb: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#1a1a1a',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: '4px',
              },
            }}
          >
            {messages.map((message, index) => (
              <ChatMessage key={index} isUser={message.isUser}>
                <Typography variant="body1">
                  {message.text}
                </Typography>
              </ChatMessage>
            ))}
            {transcript && (
              <ChatMessage isUser sx={{ opacity: 0.7 }}>
                <Typography variant="body1">
                  {transcript}
                </Typography>
              </ChatMessage>
            )}
            {isProcessing && (
              <ChatMessage isUser={false} sx={{ opacity: 0.7 }}>
                <Typography variant="body1">
                  Thinking...
                </Typography>
              </ChatMessage>
            )}
          </Box>
        </StyledPaper>
      </Box>
    </Box>
  );
};

export default VideoConference;
