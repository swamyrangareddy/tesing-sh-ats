import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token in all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

const getToken = () => {
  return localStorage.getItem('token');
}

// Test the backend connection
const testConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    console.log('Backend connection test:', data.status);
    return data.status === 'healthy';
  } catch (error) {
    console.error('Backend connection failed:', error);
    return false;
  }
};

const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    const error = new Error(data.error || 'An error occurred');
    error.status = response.status;
    error.data = data;
    throw error;
  }
  
  return data;
};

// Auth functions
export const signup = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

export const login = async (username, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    
    const data = await handleResponse(response);
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// User functions
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};

// Profile function
export const getUserProfile = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Recruiter functions
export const getRecruiters = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/recruiters`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching recruiters:', error);
    throw error;
  }
};

export const createRecruiter = async (recruiterData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/recruiters`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(recruiterData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error creating recruiter:', error);
    throw error;
  }
};

export const updateRecruiter = async (id, recruiterData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/recruiters/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(recruiterData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error updating recruiter:', error);
    throw error;
  }
};

export const deleteRecruiter = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/recruiters/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error deleting recruiter:', error);
    throw error;
  }
};

// Job functions
export const getJobs = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
};

export const createJob = async (jobData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(jobData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
};

export const updateJob = async (id, jobData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(jobData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error updating job:', error);
    throw error;
  }
};

export const deleteJob = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error deleting job:', error);
    throw error;
  }
};

// Submission functions
export const getSubmissions = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/submissions`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    throw new Error('Failed to load submissions');
  }
};

export const createSubmission = async (submissionData) => {
  try {
    // Create form data
    const formData = new FormData();
    
    // Add all submission data fields
    Object.keys(submissionData).forEach(key => {
      formData.append(key, submissionData[key]);
    });
    
    const response = await fetch(`${API_BASE_URL}/submissions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create submission');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating submission:', error);
    throw error;
  }
};

export const updateSubmission = async (id, submissionData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/submissions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(submissionData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update submission');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating submission:', error);
    throw error;
  }
};

export const deleteSubmission = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/submissions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error deleting submission:', error);
    throw new Error('Failed to delete submission');
  }
};

// Resume API endpoints
export const uploadResume = async (formData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_BASE_URL}/resumes`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    throw handleError(error);
  }
};

export const getResumes = async () => {
  try {
    const response = await api.get('/resumes');
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const previewResume = async (resumeId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/resumes/${resumeId}/preview`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to preview resume');
    }
    
    return response.blob();
  } catch (error) {
    throw error;
  }
};

export const downloadResume = async (resumeId, isPreview = false) => {
  try {
    const token = localStorage.getItem('token');
    const endpoint = isPreview ? '/preview' : '/download';
    const response = await axios.get(
      `${API_BASE_URL}/resumes/${resumeId}${endpoint}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        responseType: 'blob',
      }
    );
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const deleteResume = async (resumeId) => {
  try {
    const response = await api.delete(`/resumes/${resumeId}`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getResumeScore = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/resumes/${id}/score`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error getting resume score:', error);
    throw error;
  }
}; 

export const analyzeResumes = async (jobDescription, matchThreshold) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ats-score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({
        job_description: jobDescription,
        match_threshold: matchThreshold
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to analyze resumes');
    }
    
    // Ensure consistent skills format in results
    if (data.results) {
      data.results = data.results.map(resume => ({
        ...resume,
        skills: resume.skills ? resume.skills.split(',').map(skill => skill.trim()).filter(Boolean) : [],
        matched_skills: Array.isArray(resume.matched_skills) ? resume.matched_skills : [],
        required_skills: Array.isArray(resume.required_skills) ? resume.required_skills : []
      }));
    }
    
    return data;
  } catch (error) {
    console.error('Error analyzing resumes:', error);
    throw error;
  }
};

const handleError = (error) => {
  if (error.response) {
    // Handle 401 Unauthorized errors
    if (error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
      return new Error('Session expired. Please login again.');
    }
    // Handle other error responses
    const message = error.response.data?.error || error.response.data?.message || 'An error occurred';
    return new Error(message);
  }
  return error;
};

export default api;