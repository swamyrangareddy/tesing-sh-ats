import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  CircularProgress,
  Alert,
  InputAdornment,
  Snackbar,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { getPublicJob, applyForPublicJob } from '../services/api';
import { CloudUpload as CloudUploadIcon, Upload as UploadIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[3],
}));

const FileInput = styled('input')({
  display: 'none',
});

const PublicJobApplication = () => {
  const theme = useTheme();
  const { shareableLink } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    state: '',
    country: '',
    expected_pay_rate: '',
    skills: '',
    experience: '',
    education: '',
    status: 'Submitted'
  });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const jobData = await getPublicJob(shareableLink);
        setJob(jobData);
      } catch (err) {
        setError('Failed to load job details. Please try again later.');
        console.error('Error fetching job:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [shareableLink]);

  const handleResumeUpload = async (event) => {
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
        const result = data.results[0]; // Get the first result since we're uploading one file
        
        if (result.status === 'success') {
          // Update form data with extracted information (hidden from user)
          setFormData(prev => ({
            ...prev,
            name: result.name || '',
            email: result.email || '',
            phone: result.phone_number || '',
            skills: result.skills || '',
            experience: result.experience || '',
            education: result.resume_summary || '',
            status: 'Submitted'
          }));
          
          setSuccess('Resume processed successfully');
        } else {
          throw new Error(result.message || 'Failed to process resume');
        }
      } else {
        throw new Error('No results returned from server');
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      setError(error.message || 'Failed to upload resume');
      setUploadedFileName('');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      // Append the resume file if it exists
      const resumeFile = document.getElementById('resume-upload').files[0];
      if (resumeFile) {
        formDataToSend.append('resume', resumeFile);
      }

      const result = await applyForPublicJob(shareableLink, formDataToSend);
      setSuccess('Application submitted successfully!');
      setFormData({
        name: '',
        email: '',
        phone: '',
        linkedin: '',
        state: '',
        country: '',
        expected_pay_rate: '',
        skills: '',
        experience: '',
        education: '',
        status: 'Submitted'
      });
      setUploadedFileName('');
    } catch (error) {
      console.error('Error submitting application:', error);
      setError(error.message || 'Failed to submit application');
    }
  };

  if (loading) {
    return (
      <Container>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="80vh"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Box mt={4}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }

  if (!job) {
    return (
      <Container>
        <Box mt={4}>
          <Alert severity="error">Job not found</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Snackbar
        open={!!error || !!success}
        autoHideDuration={6000}
        onClose={() => { setError(''); setSuccess(''); }}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => { setError(''); setSuccess(''); }}
          severity={error ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {error || success}
        </Alert>
      </Snackbar>

      <StyledPaper elevation={3}>
        <Box sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
            Apply for {job?.title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {job?.company_name}
          </Typography>
          <Typography variant="body1" paragraph>
            {job?.description}
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
            <Grid container spacing={3}>
              {/* Resume Upload Section */}
              <Grid item xs={12}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Upload Resume
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    flexWrap: 'wrap',
                  }}>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      style={{ display: 'none' }}
                      id="resume-upload"
                    />
                    <Button
                      component="label"
                      htmlFor="resume-upload"
                      variant="outlined"
                      startIcon={<UploadIcon />}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        borderColor: theme.palette.primary.main,
                        color: theme.palette.primary.main,
                        '&:hover': {
                          borderColor: theme.palette.primary.dark,
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        },
                      }}
                    >
                      Choose Resume
                    </Button>
                    {uploading ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={20} sx={{ color: theme.palette.primary.main }} />
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
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
                        <Typography variant="body2" sx={{ color: '#059669' }}>
                          {uploadedFileName}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Supported: PDF, DOC, DOCX
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>

              {/* Personal Information */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="LinkedIn Profile"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Country"
                  name="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Expected Pay Rate"
                  name="expected_pay_rate"
                  value={formData.expected_pay_rate}
                  onChange={(e) => setFormData({ ...formData, expected_pay_rate: e.target.value })}
                  required
                  fullWidth
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{
                    mt: 2,
                    borderRadius: 2,
                    textTransform: 'none',
                    py: 1.5,
                    background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  Submit Application
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </StyledPaper>
    </Container>
  );
};

export default PublicJobApplication; 