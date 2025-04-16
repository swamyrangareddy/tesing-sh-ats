import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AnimatePresence, LazyMotion, domAnimation } from 'framer-motion';
import { Box } from '@mui/material';
import { ResumeCountProvider } from './contexts/ResumeCountContext';

// Pages
import Home from './pages/Home.js';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import Recruiters from './pages/Recruiters';
import Submissions from './pages/Submissions';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ResumeUpload from './pages/ResumeUpload';
import ATSScore from './pages/ATSScore';
import Search from './pages/Search';
import ResumeProfile from './pages/ResumeProfile';
import PublicJobApplication from './pages/PublicJobApplication';

// Components
import Navbar from './components/Navbar';

// Create theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#007bff',
      light: '#4dabff',
      dark: '#0056b3',
    },
    secondary: {
      main: '#e0e0e0',
      light: '#f5f5f5',
      dark: '#cccccc',
    },
    background: {
      default: '#f4f7f9',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
    success: {
      main: '#007bff',
      light: '#4dabff',
      dark: '#0056b3',
    },
  },
  typography: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    h1: {
      fontWeight: 600,
      color: '#333333',
    },
    h2: {
      fontWeight: 600,
      color: '#333333',
    },
    h3: {
      fontWeight: 600,
      color: '#333333',
    },
    h4: {
      fontWeight: 600,
      color: '#333333',
    },
    h5: {
      fontWeight: 600,
      color: '#333333',
    },
    h6: {
      fontWeight: 600,
      color: '#333333',
    },
    body1: {
      color: '#333333',
    },
    body2: {
      color: '#666666',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 4,
          fontWeight: 500,
          padding: '8px 16px',
          '&.MuiButton-contained': {
            backgroundColor: '#007bff',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#4dabff',
            },
          },
          '&.MuiButton-outlined': {
            borderColor: '#cccccc',
            color: '#333333',
            backgroundColor: '#e0e0e0',
            '&:hover': {
              borderColor: '#999999',
              backgroundColor: '#f5f5f5',
            },
          },
          '&.MuiButton-text': {
            color: '#007bff',
            '&:hover': {
              backgroundColor: 'rgba(0, 123, 255, 0.04)',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#333333',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderBottom: '1px solid #e0e0e0',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#ffffff',
            transition: 'all 0.2s ease-in-out',
            '& fieldset': {
              borderColor: '#e0e0e0',
              borderWidth: '1.5px',
              transition: 'border-color 0.2s ease-in-out',
            },
            '&:hover fieldset': {
              borderColor: '#007bff',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#007bff',
              borderWidth: '2px',
            },
            '& input, & textarea': {
              color: '#333333',
              fontSize: '1rem',
              '&::placeholder': {
                color: '#999999',
                opacity: 1,
              },
            },
            '&.Mui-disabled': {
              backgroundColor: '#f5f5f5',
              '& fieldset': {
                borderColor: '#e0e0e0',
              },
            },
          },
          '& .MuiInputLabel-root': {
            color: '#666666',
            fontSize: '1rem',
            '&.Mui-focused': {
              color: '#007bff',
              fontWeight: 500,
            },
          },
          '& .MuiInputBase-multiline': {
            padding: '14px',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          borderRadius: 8,
          backgroundColor: '#ffffff',
          padding: '12px 14px',
          '&:focus': {
            backgroundColor: '#ffffff',
          },
          '& .MuiSelect-select': {
            padding: '8px 12px',
          },
        },
        outlined: {
          padding: '12px 14px',
          '&:hover': {
            backgroundColor: '#ffffff',
          },
        },
        icon: {
          color: '#666666',
          right: '12px',
          transition: 'transform 0.2s ease-in-out',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#e0e0e0',
            borderWidth: '1.5px',
            transition: 'border-color 0.2s ease-in-out',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#007bff',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#007bff',
            borderWidth: '2px',
          },
          '& .MuiSelect-select': {
            padding: '12px 14px !important',
            backgroundColor: '#ffffff',
          },
        },
        input: {
          padding: '12px 14px',
          height: 'auto',
          lineHeight: '1.4',
          fontSize: '1rem',
          color: '#333333',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        outlined: {
          transform: 'translate(14px, 14px) scale(1)',
          '&.MuiInputLabel-shrink': {
            transform: 'translate(14px, -9px) scale(0.75)',
            backgroundColor: '#ffffff',
            padding: '0 4px',
          },
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#ffffff',
            transition: 'all 0.2s ease-in-out',
            '& fieldset': {
              borderColor: '#e0e0e0',
              borderWidth: '1.5px',
              transition: 'border-color 0.2s ease-in-out',
            },
            '&:hover fieldset': {
              borderColor: '#007bff',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#007bff',
              borderWidth: '2px',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#666666',
            fontSize: '1rem',
            '&.Mui-focused': {
              color: '#007bff',
              fontWeight: 500,
            },
          },
          '& .MuiSelect-select': {
            '&:focus': {
              backgroundColor: 'transparent',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: '#e0e0e0',
          color: '#333333',
          '&.MuiChip-colorPrimary': {
            backgroundColor: '#007bff',
            color: '#ffffff',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
          backgroundColor: '#ffffff',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#e0e0e0',
          color: '#333333',
        },
        head: {
          backgroundColor: '#f5f5f5',
          fontWeight: 600,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#f4f7f9',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#333333',
          '&:hover': {
            backgroundColor: 'rgba(0, 123, 255, 0.04)',
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(0, 123, 255, 0.04)',
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#e0e0e0',
        },
      },
    },
    MuiRadioGroup: {
      styleOverrides: {
        root: {
          '& .MuiFormControlLabel-root': {
            marginRight: '24px',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: 'rgba(0, 123, 255, 0.04)',
              borderRadius: '4px',
            },
          },
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          margin: 0,
          padding: '8px 16px',
          borderRadius: '4px',
          transition: 'all 0.2s ease-in-out',
          '&.Mui-checked': {
            backgroundColor: 'rgba(0, 0, 0, 0.08)',
            '& .MuiFormControlLabel-label': {
              color: '#000000',
              fontWeight: 500,
            },
            '& .MuiRadio-root': {
              color: '#000000',
            },
          },
          '& .MuiFormControlLabel-label': {
            color: '#666666',
            transition: 'color 0.2s ease-in-out',
          },
          '& .MuiRadio-root': {
            color: '#cccccc',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
            '&.Mui-checked': {
              color: '#000000',
              '& .MuiSvgIcon-root': {
                transform: 'scale(1.1)',
              },
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          padding: '8px',
          transition: 'all 0.2s ease-in-out',
          '&.Mui-checked': {
            color: '#000000',
            '& .MuiSvgIcon-root': {
              transform: 'scale(1.1)',
            },
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
  },
});

// Public Layout Component with Auth Check
const PublicLayout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If user is authenticated and trying to access public routes, redirect to dashboard
    if (isAuthenticated && ['/login', '/signup', '/'].includes(location.pathname)) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, location]);

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 1,
      }}
    >
      {children}
    </Box>
  );
};

// App Layout Component
const AppLayout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return (
    <>
      {isAuthenticated && <Navbar />}
      <AnimatePresence mode="wait">
        {children}
      </AnimatePresence>
    </>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Main App Component
function App() {
  return (
    <LazyMotion features={domAnimation}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AuthProvider>
            <ResumeCountProvider>
              <Routes>
                {/* Public Job Application Route - Must be first */}
                <Route 
                  path="/share/:shareableLink" 
                  element={
                    <PublicLayout>
                      <PublicJobApplication />
                    </PublicLayout>
                  } 
                />

                {/* Public Routes */}
                <Route path="/login" element={
                  <PublicLayout>
                    <Login />
                  </PublicLayout>
                } />
                <Route path="/signup" element={
                  <PublicLayout>
                    <Signup />
                  </PublicLayout>
                } />
                <Route path="/" element={
                  <PublicLayout>
                    <Home />
                  </PublicLayout>
                } />

                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Dashboard />
                    </AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/jobs" element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Jobs />
                    </AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/recruiters" element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Recruiters />
                    </AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/submissions" element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Submissions />
                    </AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/resume-upload" element={
                  <ProtectedRoute>
                    <AppLayout>
                      <ResumeUpload />
                    </AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/ats-score" element={
                  <ProtectedRoute>
                    <AppLayout>
                      <ATSScore />
                    </AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/search" element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Search />
                    </AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/resume-profile" element={
                  <ProtectedRoute>
                    <AppLayout>
                      <ResumeProfile />
                    </AppLayout>
                  </ProtectedRoute>
                } />

                {/* Catch-all route - Redirect to dashboard if authenticated, otherwise to home */}
                <Route path="*" element={
                  <Navigate to="/dashboard" replace />
                } />
              </Routes>
            </ResumeCountProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </LazyMotion>
  );
}

export default App;