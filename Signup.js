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
import { PersonAdd as SignupIcon } from '@mui/icons-material';

const GlassContainer = styled(motion(Paper))(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(3),
  padding: theme.spacing(4),
  boxShadow: '0 8px 32px rgba(76, 175, 80, 0.1)',
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
      borderColor: theme.palette.success.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.success.main,
    },
  },
  '& .MuiInputLabel-root': {
    '&.Mui-focused': {
      color: theme.palette.success.main,
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
  boxShadow: '0 3px 15px rgba(93, 114, 249, 0.3)',
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

const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }
  
  return errors;
};

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [passwordErrors, setPasswordErrors] = useState([]);
  const navigate = useNavigate();
  const { signup } = useAuth();
  const theme = useTheme();

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordErrors(validatePassword(newPassword));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validate password
    const errors = validatePassword(password);
    if (errors.length > 0) {
      setPasswordErrors(errors);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await signup({ username, email, password });
      setSuccessMessage('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.response?.data?.error || error.message || 'Failed to sign up');
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
              <SignupIcon
                sx={{
                  fontSize: 48,
                  color: theme.palette.success.main,
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
              Create Account
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Join us to streamline your recruitment process
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
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <StyledTextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={handlePasswordChange}
              error={passwordErrors.length > 0}
              helperText={passwordErrors.length > 0 ? passwordErrors.join(', ') : ''}
            />
            <StyledTextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <StyledButton
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 4, mb: 2 }}
            >
              Sign Up
            </StyledButton>

            <Button
              fullWidth
              onClick={() => navigate('/login')}
              sx={{
                mt: 1,
                borderRadius: theme.spacing(3),
                padding: theme.spacing(1.5),
                textTransform: 'none',
                fontSize: '1rem',
                color: theme.palette.success.main,
                border: '2px solid',
                borderColor: 'transparent',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: theme.palette.success.main,
                  background: 'transparent',
                },
              }}
            >
              Already have an account? Log in
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

        <Snackbar
          open={!!successMessage}
          autoHideDuration={6000}
          onClose={() => setSuccessMessage('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSuccessMessage('')}
            severity="success"
            sx={{
              width: '100%',
              borderRadius: 2,
              bgcolor: '#e8f5e9',
              color: '#2e7d32',
              '& .MuiAlert-icon': {
                color: '#2e7d32',
              },
            }}
          >
            {successMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Signup; 