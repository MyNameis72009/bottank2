import React, { useState } from 'react';
import { auth } from '../services/firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { Box, Paper, TextField, Button, Typography, Alert, Snackbar, useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  width: '100%',
  maxWidth: '400px',
  backgroundColor: '#1a1a1a',
  color: '#fff',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
    margin: theme.spacing(2),
  },
}));

const Form = styled('form')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError(error.message);
      setShowError(true);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#121212',
      padding: isMobile ? 2 : 3,
    }}>
      <StyledPaper elevation={3}>
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          gutterBottom 
          align="center" 
          sx={{ mb: 4 }}
        >
          {isLogin ? 'Login' : 'Sign Up'} to BotTank
        </Typography>

        <Form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            variant="outlined"
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.23)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
              },
              '& .MuiInputBase-input': {
                color: '#fff',
                fontSize: isMobile ? '0.9rem' : '1rem',
              },
            }}
          />
          
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            variant="outlined"
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.23)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
              },
              '& .MuiInputBase-input': {
                color: '#fff',
                fontSize: isMobile ? '0.9rem' : '1rem',
              },
            }}
          />

          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            size={isMobile ? "medium" : "large"}
            fullWidth
            sx={{ 
              mt: 2,
              py: isMobile ? 1.5 : 2,
            }}
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </Button>

          <Button 
            onClick={() => setIsLogin(!isLogin)} 
            color="primary"
            sx={{ 
              mt: 1,
              fontSize: isMobile ? '0.8rem' : '0.9rem',
            }}
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </Button>
        </Form>

        <Snackbar 
          open={showError} 
          autoHideDuration={6000} 
          onClose={() => setShowError(false)}
          anchorOrigin={{ 
            vertical: isMobile ? 'bottom' : 'top', 
            horizontal: 'center' 
          }}
        >
          <Alert 
            onClose={() => setShowError(false)} 
            severity="error" 
            sx={{ 
              width: '100%',
              fontSize: isMobile ? '0.8rem' : '0.9rem',
            }}
          >
            {error}
          </Alert>
        </Snackbar>
      </StyledPaper>
    </Box>
  );
};

export default Auth;
