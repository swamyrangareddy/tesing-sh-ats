import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AnimatePresence, LazyMotion, domAnimation } from 'framer-motion';

// Pages
import Home from './pages/Home';
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
            borderRadius: 4,
            '& fieldset': {
              borderColor: '#cccccc',
            },
            '&:hover fieldset': {
              borderColor: '#999999',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#007bff',
            },
            '& input': {
              color: '#333333',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#666666',
            '&.Mui-focused': {
              color: '#007bff',
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
          backgroundColor: '#f4f7f9',
          color: '#333333',
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
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// App Layout Component
const AppLayout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isPublicJobPage = location.pathname.startsWith('/jobs/share/');

  return (
    <>
      {isAuthenticated && !isPublicJobPage && <Navbar />}
      <AnimatePresence mode="wait">
        {children}
      </AnimatePresence>
    </>
  );
};

// Routes Component
const AppRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/jobs"
          element={
            <ProtectedRoute>
              <Jobs />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/recruiters"
          element={
            <ProtectedRoute>
              <Recruiters />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/submissions"
          element={
            <ProtectedRoute>
              <Submissions />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/resume-upload"
          element={
            <ProtectedRoute>
              <ResumeUpload />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/ats-score"
          element={
            <ProtectedRoute>
              <ATSScore />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/resume-search"
          element={
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/resume-profile/"
          element={
            <ProtectedRoute>
              <ResumeProfile />
            </ProtectedRoute>
          }
        />
        
        <Route path="/jobs/share/:shareableLink" element={<PublicJobApplication />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <LazyMotion features={domAnimation}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AuthProvider>
            <AppLayout>
              <AppRoutes />
            </AppLayout>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </LazyMotion>
  );
}

export default App;
