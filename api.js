import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Configure axios defaults
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
    const response = await api.get('/recruiters');
    return response.data || [];
  } catch (error) {
    throw handleError(error);
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
    const response = await api.get('/jobs');
    return response;
  } catch (error) {
    throw handleError(error);
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
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete job');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting job:', error);
    throw error;
  }
};

// Submission functions
export const getSubmissions = async () => {
  try {
    const response = await api.get('/submissions');
    return response;
  } catch (error) {
    throw handleError(error);
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
    return response;
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
    const response = await fetch(`${API_BASE_URL}/resumes/${resumeId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to delete resume');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Delete error:', error);
    throw new Error(error.message || 'Failed to delete resume');
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
      localStorage.removeItem('user');
      window.location.href = '/login';
      return new Error('Session expired. Please login again.');
    }
    // Handle other error responses
    const message = error.response.data?.error || error.response.data?.message || 'An error occurred';
    return new Error(message);
  } else if (error.request) {
    // The request was made but no response was received
    return new Error('Network error. Please check your connection.');
  } else {
    // Something happened in setting up the request that triggered an Error
    return new Error(error.message || 'An unexpected error occurred');
  }
};

export const getJobByUrl = async (jobUrl) => {
  try{
    const response = await fetch(`${API_BASE_URL}/jobs/${jobUrl}`);
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching job by URL:', error);
    throw error;
  }
}

export const applyForJob = async (jobUrl, applicationData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobUrl}/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(applicationData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error applying for job:', error);
    throw error;
  }
};

export const getPublicJob = async (shareableLink) => {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs/share/${shareableLink}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch job details');
    }
    
    const data = await response.json();
    
    // Ensure the response has the required fields
    if (!data || !data.title) {
      throw new Error('Invalid job data received');
    }
    
    return data;
  } catch (error) {
    console.error('Error getting public job:', error);
    throw error;
  }
};

export const applyForPublicJob = async (shareableLink, formData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/jobs/share/${shareableLink}/apply`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error applying for public job:', error);
    if (error.response) {
      console.error('Server response:', error.response.data);
      throw new Error(error.response.data.error || 'Failed to submit application');
    }
    throw error;
  }
};

// Public Applications
export const getPublicApplications = async () => {
  try {
    const response = await api.get('/public_applications');
    return response.data;
  } catch (error) {
    console.error('Error fetching public applications:', error);
    throw error;
  }
};

export const downloadPublicResume = async (applicationId) => {
  try {
    const response = await api.get(`/public_applications/${applicationId}/resume`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error downloading public resume:', error);
    throw error;
  }
};

// Public API endpoints
export const getPublicRecruiters = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/public/recruiters`);
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching public recruiters:', error);
    throw error;
  }
};

export const getPublicJobs = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/public/jobs`);
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching public jobs:', error);
    throw error;
  }
};

export const getPublicSubmissions = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/public/submissions`);
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching public submissions:', error);
    throw error;
  }
};

export const getPublicResumes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/public/resumes`);
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching public resumes:', error);
    throw error;
  }
};

export const processAndStoreResume = async (formData) => {
    try {
        const response = await fetch('http://localhost:5000/api/process-and-store-resume', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to process resume');
        }

        return await response.json();
    } catch (error) {
        console.error('Error processing resume:', error);
        throw error;
    }
};

export const getResumesCount = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/resumes/count', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return { data: { count: data.count || 0 } };
  } catch (error) {
    console.error('Error fetching resumes count:', error);
    return { data: { count: 0 } };
  }
};

export const extractSkills = async (jobDescription) => {
  try {
    const response = await fetch(`${API_BASE_URL}/extract-skills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({
        job_description: jobDescription
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to extract skills');
    }
    
    return data;
  } catch (error) {
    console.error('Error extracting skills:', error);
    throw error;
  }
};