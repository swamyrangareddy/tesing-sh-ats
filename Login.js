import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Snackbar,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { Login as LoginIcon } from '@mui/icons-material';

const GlassContainer = styled(motion(Paper))(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(3),
  padding: theme.spacing(4),
  boxShadow: '0 8px 32px rgba(33, 150, 243, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  maxWidth: '450px',
  width: '100%',
  margin: '0 auto',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #64b5f6, #2196f3)',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(2),
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
    },
    '& fieldset': {
      borderWidth: '2px',
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiInputLabel-root': {
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  padding: theme.spacing(1.5),
  fontSize: '1rem',
  textTransform: 'none',
  transition: 'all 0.3s ease',
  background: 'linear-gradient(45deg, #2196f3 30%, #1976d2 90%)',
  boxShadow: '0 3px 15px rgba(33, 150, 243, 0.3)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(33, 150, 243, 0.4)',
  },
}));

const BackgroundGradient = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
  zIndex: -1,
});

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const theme = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await login(username, password);
      if (response?.user) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.error || error.message || 'Failed to log in');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <BackgroundGradient />
      <Container maxWidth="sm">
        <GlassContainer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <LoginIcon
                sx={{
                  fontSize: 48,
                  color: theme.palette.primary.main,
                  mb: 2,
                }}
              />
            </motion.div>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(45deg, #2196f3 30%, #1976d2 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Welcome Back
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Sign in to continue to your dashboard
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            <StyledTextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <StyledTextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <StyledButton
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 4, mb: 2 }}
            >
              Sign In
            </StyledButton>

            <Button
              fullWidth
              onClick={() => navigate('/signup')}
              sx={{
                mt: 1,
                borderRadius: theme.spacing(3),
                padding: theme.spacing(1.5),
                textTransform: 'none',
                fontSize: '1rem',
                color: theme.palette.primary.main,
                border: '2px solid',
                borderColor: 'transparent',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  background: 'transparent',
                },
              }}
            >
              Don't have an account? Sign up
            </Button>
          </Box>
        </GlassContainer>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setError('')}
            severity="error"
            sx={{
              width: '100%',
              borderRadius: 2,
              bgcolor: '#ffebee',
              color: '#c62828',
              '& .MuiAlert-icon': {
                color: '#c62828',
              },
            }}
          >
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Login; 