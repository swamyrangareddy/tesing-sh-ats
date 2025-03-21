import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();
  const location = useLocation();

  const verifyToken = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-token', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Token verification failed');
      }
      
      const userData = await response.json();
      setUser(userData.user);
      setIsAuthenticated(true);
      setToken(token);
      return true;
    } catch (error) {
      console.error('Token verification error:', error);
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      setToken(null);
      return false;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsAuthenticated(false);
          setUser(null);
          if (location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/signup') {
            navigate('/', { replace: true });
          }
        } else {
          const isValid = await verifyToken(token);
          if (!isValid && location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/signup') {
            navigate('/', { replace: true });
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
        setIsAuthenticated(false);
        if (location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/signup') {
          navigate('/', { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, location.pathname]);

  const login = async (username, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed. Please check your credentials.');
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      navigate('/dashboard', { replace: true });
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Failed to log in. Please try again.');
    }
  };

  const signup = async (userData) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      return data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    navigate('/', { replace: true });
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    signup,
    logout,
    token
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 