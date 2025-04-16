import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  MenuItem,
  TablePagination,
  CircularProgress,
  InputAdornment,
  IconButton,
  Grid,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Upload as UploadIcon,
  CheckCircle as CheckCircleIcon,
  InfoOutlined as InfoOutlinedIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  Work as WorkIcon,
  Person as PersonIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { styled, useTheme, alpha } from '@mui/material/styles';
import NoData from '../components/NoData';
import { getSubmissions, createSubmission, updateSubmission, deleteSubmission, getJobs, getRecruiters, getPublicApplications, downloadPublicResume } from '../services/api';
import useDebounce from '../hooks/useDebounce';

const SearchBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  alignItems: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  backdropFilter: 'blur(10px)',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#ffffff',
    borderRadius: theme.spacing(2),
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
    '& fieldset': {
      borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
}));


const SearchContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  alignItems: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  backdropFilter: 'blur(10px)',

}));

const ModernSearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: theme.spacing(1.5),
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    border: '3px solid rgba(231, 235, 240, 0.8)',
    height: '46px',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
    '&.Mui-focused': {
      backgroundColor: '#ffffff',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    },
    '& fieldset': {
      borderColor: 'transparent',
      transition: 'all 0.3s ease',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(59, 130, 246, 0.3)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#3B82F6',
      borderWidth: '2px',
    },
    '& input': {
      padding: '12px 16px',
      fontSize: '0.95rem',
    },
  },
  '& .MuiInputAdornment-root': {
    marginLeft: theme.spacing(1),
  },
}));

const ModernButton = styled(Button)(({ theme, variant = 'contained' }) => ({
  height: '46px',
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(0, 3),
  textTransform: 'none',
  fontSize: '0.95rem',
  fontWeight: 600,
  letterSpacing: '0.025em',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  ...(variant === 'contained' && {
    background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    color: '#fff',
    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.25)',
    '&:hover': {
      background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(59, 130, 246, 0.35)',
    },
  }),
  ...(variant === 'outlined' && {
    border: '2px solid rgba(59, 130, 246, 0.5)',
    color: '#3B82F6',
    '&:hover': {
      border: '2px solid #3B82F6',
      background: 'rgba(59, 130, 246, 0.05)',
      transform: 'translateY(-2px)',
    },
  }),
}));

const SearchIconWrapper = styled(SearchIcon)(({ theme }) => ({
  color: '#94A3B8',
  fontSize: '20px',
  transition: 'color 0.3s ease',
  '.Mui-focused &': {
    color: '#3B82F6',
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  border: '1px solid rgba(231, 235, 240, 0.8)',
  background: '#ffffff',
  '& .MuiTable-root': {
    borderCollapse: 'separate',
    borderSpacing: '0 8px',
  },
  '& .MuiTableHead-root': {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    '& .MuiTableCell-root': {
      borderBottom: 'none',
      fontWeight: 600,
      color: '#333',
      padding: theme.spacing(2),
    },
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: '#ffffff',
  transition: 'all 0.3s ease',
  '& .MuiTableCell-root': {
    borderBottom: '1px solid rgba(231, 235, 240, 0.8)',
    padding: theme.spacing(2),
    '&:first-of-type': {
      borderTopLeftRadius: theme.spacing(1),
      borderBottomLeftRadius: theme.spacing(1),
    },
    '&:last-of-type': {
      borderTopRightRadius: theme.spacing(1),
      borderBottomRightRadius: theme.spacing(1),
    },
  },
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  },
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(3),
    boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)',
    background: 'linear-gradient(to bottom, #ffffff, #f8fafc)',
    overflow: 'hidden',
  },
  '& .MuiDialogTitle-root': {
    padding: theme.spacing(3),
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(231, 235, 240, 0.8)',
  },
  '& .MuiDialogContent-root': {
    padding: theme.spacing(3),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(2, 3),
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(20px)',
    borderTop: '1px solid rgba(231, 235, 240, 0.8)',
  },
}));

const TopFormSection = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  gap: theme.spacing(3),
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.8) 100%)',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  border: '1px solid rgba(231, 235, 240, 0.8)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.9)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  },
}));

const FormSection = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.5)',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  border: '1px solid rgba(231, 235, 240, 0.8)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.8)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  },
}));

const ActionButton = styled(Button)(({ theme, variant }) => ({
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(1.2, 3),
  textTransform: 'none',
  fontSize: '0.95rem',
  fontWeight: 500,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  ...(variant === 'contained' && {
    background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    color: '#fff',
    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.25)',
    '&:hover': {
      background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(59, 130, 246, 0.35)',
    },
  }),
  ...(variant === 'outlined' && {
    border: '2px solid rgba(59, 130, 246, 0.5)',
    color: '#3B82F6',
    '&:hover': {
      border: '2px solid #3B82F6',
      background: 'rgba(59, 130, 246, 0.05)',
      transform: 'translateY(-2px)',
    },
  }),
}));

const StyledStatus = styled(Typography)(({ status, theme }) => ({
  padding: theme.spacing(0.5, 1.5),
  borderRadius: theme.spacing(1),
  display: 'inline-block',
  fontSize: '0.875rem',
  fontWeight: 500,
  textAlign: 'center',
  minWidth: '100px',
  backgroundColor: 
    status === 'Hired' ? 'rgba(46, 204, 113, 0.1)' :
    status === 'Rejected' ? 'rgba(231, 76, 60, 0.1)' :
    status === 'Shortlisted' ? 'rgba(52, 152, 219, 0.1)' :
    status === 'In Review' ? 'rgba(241, 196, 15, 0.1)' :
    status === 'Submitted' ? '#E0F7FA' :
    'rgba(189, 195, 199, 0.1)',
  color:
    status === 'Hired' ? '#27ae60' :
    status === 'Rejected' ? '#c0392b' :
    status === 'Shortlisted' ? '#2980b9' :
    status === 'In Review' ? '#f39c12' :
    status === 'Submitted' ? '#00838F' :
    '#95a5a6',
  border: `1px solid ${
    status === 'Hired' ? 'rgba(46, 204, 113, 0.2)' :
    status === 'Rejected' ? 'rgba(231, 76, 60, 0.2)' :
    status === 'Shortlisted' ? 'rgba(52, 152, 219, 0.2)' :
    status === 'In Review' ? 'rgba(241, 196, 15, 0.2)' :
    status === 'Submitted' ? 'rgba(149, 165, 166, 0.2)' :
    'rgba(189, 195, 199, 0.2)'
  }`,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 
      status === 'Hired' ? 'rgba(46, 204, 113, 0.15)' :
      status === 'Rejected' ? 'rgba(231, 76, 60, 0.15)' :
      status === 'Shortlisted' ? 'rgba(52, 152, 219, 0.15)' :
      status === 'In Review' ? 'rgba(241, 196, 15, 0.15)' :
      status === 'Submitted' ? 'rgba(149, 165, 166, 0.15)' :
      'rgba(189, 195, 199, 0.15)',
  }
}));

const ViewDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(4),
  background: 'linear-gradient(to bottom, #ffffff, #f8fafc)',
  '& > *:last-child': {
    marginBottom: 0
  }
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.1rem',
  fontWeight: 600,
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(2.5),
  position: 'relative',
  paddingLeft: theme.spacing(2),
  '&:before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    height: '80%',
    width: '4px',
    backgroundColor: theme.palette.primary.main,
    borderRadius: theme.spacing(1),
  }
}));

const InfoCard = styled(Box)(({ theme }) => ({
  background: '#ffffff',
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(2.5),
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.03)',
  border: '1px solid rgba(231, 235, 240, 0.8)',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
  }
}));

const InfoLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: theme.spacing(0.5)
}));

const InfoValue = styled(Typography)(({ theme }) => ({
  fontSize: '0.95rem',
  color: theme.palette.text.primary,
  fontWeight: 500,
  lineHeight: 1.5
}));

// Move helper functions outside components
const getJobTitle = (jobId, jobs) => {
  if (!jobId) return '';
  const job = jobs.find(j => j.id === jobId);
  return job?.title || '';
};

const getRecruiterName = (recruiterId, recruiters) => {
  if (!recruiterId) return '';
  const recruiter = recruiters.find(r => r.id === recruiterId);
  return recruiter?.name || '';
};

const Submissions = () => {
  const theme = useTheme();
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [recruiters, setRecruiters] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // 300ms delay
  const [formData, setFormData] = useState({
    job_id: '',
    recruiter_id: '',
    candidate_name: '',
    candidate_email: '',
    candidate_phone: '',
    candidate_city: '',
    candidate_state: '',
    candidate_country: '',
    visa: '',
    pay_rate: '',
    status: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadMode, setUploadMode] = useState('select');
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewSubmission, setViewSubmission] = useState(null);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await getSubmissions();
      const submissionsData = response.data || response || [];
      const submissionsArray = Array.isArray(submissionsData) ? submissionsData : [];
      const sortedSubmissions = submissionsArray.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      setSubmissions(sortedSubmissions);
      setFilteredSubmissions(sortedSubmissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setError('Failed to load submissions');
      setSubmissions([]);
      setFilteredSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    fetchJobs();
    fetchRecruiters();
  }, []);

  useEffect(() => {
    const filtered = submissions.filter(
      (submission) =>
        submission.candidate_name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        submission.candidate_email?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        submission.job_title?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        submission.recruiter_name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
    setFilteredSubmissions(filtered);
    setPage(0); // Reset to first page when filtering
  }, [debouncedSearchTerm, submissions]);

  const fetchJobs = async () => {
    try {
      const response = await getJobs();
      const jobsData = response.data || response || [];
      const jobsArray = Array.isArray(jobsData) ? jobsData : [];
      setJobs(jobsArray);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to load jobs');
      setJobs([]);
    }
  };

  const fetchRecruiters = async () => {
    try {
      const response = await getRecruiters();
      const recruitersData = response.data || response || [];
      const recruitersArray = Array.isArray(recruitersData) ? recruitersData : [];
      setRecruiters(recruitersArray);
    } catch (error) {
      console.error('Error fetching recruiters:', error);
      setRecruiters([]);
    }
  };

  const handleOpen = (submission = null) => {
    if (submission) {
      setEditMode(true);
      setSelectedSubmission(submission);
      setFormData(submission);
    } else {
      setEditMode(false);
      setSelectedSubmission(null);
      setFormData({
        job_id: '',
        recruiter_id: '',
        candidate_name: '',
        candidate_email: '',
        candidate_phone: '',
        candidate_city: '',
        candidate_state: '',
        candidate_country: '',
        visa: '',
        pay_rate: '',
        status: '',
        notes: '',
      });
      setSearchEmail('');
      setSearchResults([]);
      setUploadedFileName('');
      setSelectedResume(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setSelectedSubmission(null);
    setFormData({
      job_id: '',
      recruiter_id: '',
      candidate_name: '',
      candidate_email: '',
      candidate_phone: '',
      candidate_city: '',
      candidate_state: '',
      candidate_country: '',
      visa: '',
      pay_rate: '',
      status: '',
      notes: '',
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for empty required fields
    const requiredFields = [
      'job_id',
      'recruiter_id',
      'candidate_name',
      'candidate_email',
      'candidate_city',
      'candidate_state',
      'candidate_country',
      'visa',
      'pay_rate',
      'status',
    ];

    const emptyFields = requiredFields.filter(field => !formData[field]);

    if (emptyFields.length > 0) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      // Clean up the submission data
      const submissionData = {
        job_id: formData.job_id,
        recruiter_id: formData.recruiter_id,
        candidate_name: formData.candidate_name,
        candidate_email: formData.candidate_email,
        candidate_phone: formData.candidate_phone || '',
        candidate_city: formData.candidate_city,
        candidate_state: formData.candidate_state,
        candidate_country: formData.candidate_country,
        visa: formData.visa,
        pay_rate: formData.pay_rate,
        status: formData.status || 'Submitted',
        notes: formData.notes || ''
      };

      if (editMode && selectedSubmission) {
        // For update, we use JSON
        submissionData.updated_at = new Date().toISOString();
        await updateSubmission(selectedSubmission._id, submissionData);
        setSuccessMessage('Submission updated successfully');
      } else {
        // For create, we use FormData
        submissionData.created_at = new Date().toISOString();
        submissionData.updated_at = new Date().toISOString();
        await createSubmission(submissionData);
        setSuccessMessage('Submission added successfully');
      }

      handleClose();
      await fetchSubmissions();
    } catch (error) {
      console.error('Error saving submission:', error);
      setError(error.message || 'Failed to save submission');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this submission?')) {
      return;
    }
    try {
      await deleteSubmission(id);
      setSuccessMessage('Submission deleted successfully');
      await fetchSubmissions();
    } catch (error) {
      console.error('Error deleting submission:', error);
      setError(error.message || 'Failed to delete submission');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEmailSearch = async (email) => {
    setSearchEmail(email);
    if (!email) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await fetch(`http://localhost:5000/api/resumes/search/email?email=${encodeURIComponent(email)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to search resumes');
      const data = await response.json();
      
      setSearchResults(data);
      
      // If exact match is found, auto-fill the form
      const exactMatch = data.find(
        resume => resume.email.toLowerCase() === email.toLowerCase()
      );
      
      if (exactMatch) {
        setFormData(prevData => ({
          ...prevData,
          candidate_name: exactMatch.name || '',
          candidate_email: exactMatch.email || '',
          candidate_phone: exactMatch.phone_number || '',
          candidate_city: exactMatch.location?.split(',')[0]?.trim() || '',
          candidate_state: exactMatch.location?.split(',')[1]?.trim() || '',
          candidate_country: exactMatch.location?.split(',')[2]?.trim() || '',
        }));
      }
    } catch (error) {
      console.error('Error searching resumes:', error);
      setError('Failed to search resumes');
    } finally {
      setIsSearching(false);
    }
  };

  const handleResumeUpload = async (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');
    setUploadedFileName(file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:5000/api/resumes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload resume');
      }

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const extractedData = data.results[0];
        // Update form data with extracted information
        setFormData(prev => ({
          ...prev,
          candidate_name: extractedData.name || '',
          candidate_email: extractedData.email || '',
          candidate_phone: extractedData.phone_number || '',
          candidate_city: extractedData.location?.split(',')[0]?.trim() || '',
          candidate_state: extractedData.location?.split(',')[1]?.trim() || '',
          candidate_country: extractedData.location?.split(',')[2]?.trim() || '',
          status: 'Submitted',
          resume_id: extractedData.id
        }));
        
        setSuccessMessage('Resume processed and details extracted successfully');
      } else {
        setError('No data could be extracted from the resume');
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      setError(error.message || 'Failed to upload resume');
      setUploadedFileName('');
    } finally {
      setUploading(false);
    }
  };

  const handleCandidateSelect = (email) => {
    const resume = searchResults.find(r => r.email === email);
    if (resume) {
      setFormData(prev => ({
        ...prev,
        candidate_name: resume.name || '',
        candidate_email: resume.email || '',
        candidate_phone: resume.phone_number || '',
        candidate_city: resume.location?.split(',')[0]?.trim() || '',
        candidate_state: resume.location?.split(',')[1]?.trim() || '',
        candidate_country: resume.location?.split(',')[2]?.trim() || '',
        status: 'Submitted'
      }));
      setSelectedResume(resume);
      setSuccessMessage('Candidate details loaded from database');
    }
  };

  const handleViewOpen = (submission) => {
    setViewSubmission(submission);
    setViewDialogOpen(true);
  };

  const handleViewClose = () => {
    setViewDialogOpen(false);
    setViewSubmission(null);
  };

  const handleDownloadResume = async (applicationId) => {
    try {
      const blob = await downloadPublicResume(applicationId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume_${applicationId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading resume:', error);
      setError('Failed to download resume');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Snackbar
        open={!!error || !!successMessage}
        autoHideDuration={6000}
        onClose={() => { setError(null); setSuccessMessage(''); }}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => { setError(null); setSuccessMessage(''); }}
          severity={error ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {error || successMessage}
        </Alert>
      </Snackbar>

      <SearchBox>
        <StyledTextField
          label="Search submissions"
          size="small"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <SearchIcon color="action" sx={{ mr: 1 }} />
            ),
          }}
          sx={{ flexGrow: 1 }}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1,
            textTransform: 'none',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
            },
          }}
        >
          Add submission
        </Button>
      </SearchBox>

      {submissions.length === 0 ? (
        <NoData type="submissions" />
      ) : (
        <StyledTableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">Created at</TableCell>
                <TableCell align="center">Job</TableCell>
                <TableCell align="center">Candidate Name</TableCell>
                <TableCell align="center">Candidate Email</TableCell>
                <TableCell align="center">Recruiter</TableCell>
                {/* <TableCell>Location</TableCell>
                <TableCell>Visa</TableCell>
                <TableCell>Pay Rate</TableCell> */}
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSubmissions
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((submission) => (
                <StyledTableRow key={submission._id}>
                  <TableCell>
                    {new Date(submission.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',

                    })}
                  </TableCell>
                  <TableCell>{getJobTitle(submission.job_id, jobs)}</TableCell>
                  <TableCell>{submission.candidate_name}</TableCell>
                  <TableCell>{submission.candidate_email}</TableCell>
                  <TableCell>{getRecruiterName(submission.recruiter_id, recruiters)}</TableCell>
                  {/* <TableCell>{`${submission.candidate_city}, ${submission.candidate_state}`}</TableCell>
                  <TableCell>{submission.visa}</TableCell>
                  <TableCell>{submission.pay_rate}</TableCell> */}
                  <TableCell>
                    <StyledStatus status={submission.status}>
                      {submission.status}
                    </StyledStatus>
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="View Details">
                        <IconButton
                          onClick={() => handleViewOpen(submission)}
                          size="small"
                          sx={{ 
                            color: theme.palette.info.main,
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.info.main, 0.1),
                            }
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          onClick={() => handleOpen(submission)}
                          size="small"
                          sx={{ 
                            color: theme.palette.primary.main,
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          onClick={() => handleDelete(submission._id)}
                          size="small"
                          sx={{ 
                            color: theme.palette.error.main,
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.error.main, 0.1),
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredSubmissions.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              borderTop: '1px solid rgba(231, 235, 240, 0.8)',
              '& .MuiTablePagination-select': {
                borderRadius: 1,
              },
            }}
          />
        </StyledTableContainer>
      )}

      <StyledDialog 
        open={open} 
        onClose={handleClose}
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600, color: '#1E293B' }}>
            {editMode ? 'Edit Submission' : 'Add New Submission'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {!editMode && (
            <TopFormSection>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1E293B' }}>
                  Search Candidate
                </Typography>
                <ModernSearchField
                  placeholder="Enter candidate email..."
                  name="searchEmail"
                  value={searchEmail}
                  onChange={(e) => handleEmailSearch(e.target.value)}
                  fullWidth
                  helperText="Enter candidate email to auto-fill details"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIconWrapper />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              <Box sx={{ 
                borderLeft: '1px solid rgba(231, 235, 240, 0.8)', 
                pl: 3,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                minWidth: '280px',
              }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1E293B' }}>
                  Upload Resume
                </Typography>
                <Box>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    style={{ display: 'none' }}
                    id="resume-upload"
                  />
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    flexWrap: 'wrap',
                  }}>
                    <ModernButton
                      component="label"
                      htmlFor="resume-upload"
                      startIcon={<UploadIcon />}
                      sx={{
                        minWidth: '160px',
                        background: ' #F3F4F6FF',
                        border: '1px solid #primary',
                      
                        '&:hover': {
                          background: '#22CCB2',
                          color: '#primary',
                        },
                      }}
                    >
                      Choose File
                    </ModernButton>
                    {uploading ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={20} sx={{ color: '#3B82F6' }} />
                        <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500 }}>
                          Processing...
                        </Typography>
                      </Box>
                    ) : uploadedFileName ? (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        background: 'rgba(5, 150, 105, 0.1)',
                        padding: '6px 12px',
                        borderRadius: '8px',
                      }}>
                        <CheckCircleIcon sx={{ color: '#059669', fontSize: 20 }} />
                        <Typography variant="body2" sx={{ color: '#059669', fontWeight: 500 }}>
                          {uploadedFileName}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: '#64748B',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                        }}
                      >
                        <InfoOutlinedIcon sx={{ fontSize: 16 }} />
                        Supported: PDF, DOC, DOCX
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </TopFormSection>
          )}

          <FormSection>
            <Box component="form" sx={{ 
              display: 'grid',
              gap: 3,
              gridTemplateColumns: 'repeat(2, 1fr)',
            }}>
              <StyledTextField
                select
                label="Job"
                name="job_id"
                value={formData.job_id}
                onChange={handleChange}
                required
                fullWidth
              >
                {jobs.map((job) => (
                  <MenuItem key={job.id} value={job.id}>
                    {job.title}
                  </MenuItem>
                ))}
              </StyledTextField>
              <StyledTextField
                select
                label="Recruiter"
                name="recruiter_id"
                value={formData.recruiter_id}
                onChange={handleChange}
                
                fullWidth
               
              >
                {recruiters.map((recruiter) => (
                  <MenuItem key={recruiter.id} value={recruiter.id}>
                    {recruiter.name}
                  </MenuItem>
                ))}
              </StyledTextField>
              <StyledTextField
                label="Name"
                name="candidate_name"
                value={formData.candidate_name}
                onChange={handleChange}
                required
                fullWidth
              />
              <StyledTextField
                label="Email"
                name="candidate_email"
                value={formData.candidate_email}
                onChange={handleChange}
                required
                fullWidth
              />
              <StyledTextField
                label="Phone"
                name="candidate_phone"
                value={formData.candidate_phone}
                onChange={handleChange}
                fullWidth
              />
              <StyledTextField
                label="City"
                name="candidate_city"
                value={formData.candidate_city}
                onChange={handleChange}
                required
                fullWidth
              />
              <StyledTextField
                label="State"
                name="candidate_state"
                value={formData.candidate_state}
                onChange={handleChange}
                required
                fullWidth
              />
              <StyledTextField
                label="Country"
                name="candidate_country"
                value={formData.candidate_country}
                onChange={handleChange}
                required
                fullWidth
              />
              <StyledTextField
                label="Visa"
                name="visa"
                value={formData.visa}
                onChange={handleChange}
                required
                fullWidth
              />
              <StyledTextField
                label="Pay Rate"
                name="pay_rate"
                value={formData.pay_rate}
                onChange={handleChange}
                required
                fullWidth
              />
              <StyledTextField
                select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                fullWidth
              >
                <MenuItem value="Submitted">Submitted</MenuItem>
                <MenuItem value="In Review">In Review</MenuItem>
                <MenuItem value="Shortlisted">Shortlisted</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
                <MenuItem value="Hired">Hired</MenuItem>
              </StyledTextField>
              <StyledTextField
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                multiline
                rows={4}
                fullWidth
                sx={{ gridColumn: 'span 2' }}
              />
            </Box>
          </FormSection>
        </DialogContent>
        <DialogActions>
          <ActionButton 
            onClick={handleClose}
            variant="outlined"
          >
            Cancel
          </ActionButton>
          <ActionButton 
            onClick={handleSubmit} 
            variant="contained"
          >
            {editMode ? 'Update' : 'Add'}
          </ActionButton>
        </DialogActions>
      </StyledDialog>

      <ViewDialog
        open={viewDialogOpen}
        onClose={handleViewClose}
        submission={viewSubmission}
        jobs={jobs}
        recruiters={recruiters}
      />
    </Container>
  );
};

// Add the ViewDialog component
const ViewDialog = ({ open, onClose, submission, jobs, recruiters }) => {
  if (!submission) return null;

  const sections = [
    {
      title: 'Job Details' ,
      icon: <WorkIcon sx={{ color: 'primary.main', mr: 1 }} />,
      items: [
        { label: 'Job Title', value: getJobTitle(submission.job_id, jobs) },
        { label: 'Recruiter', value: getRecruiterName(submission.recruiter_id, recruiters) },
      ]
    },
    {
      title: 'Candidate Information',
      icon: <PersonIcon sx={{ color: 'primary.main', mr: 1 }} />,
      items: [
        { label: 'Name', value: submission.candidate_name },
        { label: 'Email', value: submission.candidate_email },
        { label: 'Phone', value: submission.candidate_phone },
        { label: 'Location', value: `${submission.candidate_city}, ${submission.candidate_state}, ${submission.candidate_country}` },
      ]
    },
    {
      title: 'Submission Details',
      icon: <InfoIcon sx={{ color: 'primary.main', mr: 1 }} />,
      items: [
        { label: 'Visa Status', value: submission.visa },
        { label: 'Pay Rate', value: submission.pay_rate },
        { 
          label: 'Status', 
          value: submission.status,
          custom: true,
          render: () => (
            <StyledStatus status={submission.status}>
              {submission.status}
            </StyledStatus>
          )
        },
        { 
          label: 'Notes', 
          value: submission.notes,
          fullWidth: true 
        },
      ]
    }
  ];

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 1
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Submission Details
            </Typography>
          </Box>
          <IconButton 
            onClick={onClose} 
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <ViewDialogContent dividers>
        {sections.map((section, index) => (
          <Box key={index} sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {section.icon}
              <SectionTitle variant="subtitle1">
                {section.title}
              </SectionTitle>
            </Box>
            <Grid container spacing={2.5}>
              {section.items.map((item, i) => (
                <Grid 
                  item 
                  xs={12} 
                  sm={item.fullWidth ? 12 : 6} 
                  key={i}
                >
                  <InfoCard>
                    <InfoLabel>
                      {item.label}
                    </InfoLabel>
                    {item.custom ? (
                      item.render()
                    ) : (
                      <InfoValue>
                        {item.value || '-'}
                      </InfoValue>
                    )}
                  </InfoCard>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}
      </ViewDialogContent>
      <DialogActions sx={{ p: 3, background: '#f8fafc' }}>
        <Button 
          onClick={onClose} 
          variant="contained"
          sx={{
            borderRadius: 2,
            px: 4,
            py: 1,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
            },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default Submissions;