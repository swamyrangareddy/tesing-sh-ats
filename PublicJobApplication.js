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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { getPublicJob, applyForPublicJob } from '../services/api';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';

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
  const { shareableLink } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeFileName, setResumeFileName] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    linkedin_url: '',
    state: '',
    country: '',
    expected_pay_rate: '',
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeFile(file);
      setResumeFileName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      const requiredFields = ['name', 'email', 'phone', 'linkedin_url', 'state', 'country', 'expected_pay_rate'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }

      if (!resumeFile) {
        setError('Please upload your resume');
        return;
      }

      // Create FormData object for file upload
      const submitData = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });

      // Append resume file
      submitData.append('resume', resumeFile);

      const response = await applyForPublicJob(shareableLink, submitData);
      
      if (response.error) {
        throw new Error(response.error);
      }

      setSuccess(true);
      setError(null);
      
      // Show success message and redirect
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      console.error('Error submitting application:', err);
      setError(err.message || 'Failed to submit application. Please try again.');
      setSuccess(false);
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
    <Container maxWidth="md">
      <StyledPaper>
        <Typography variant="h4" gutterBottom>
          Apply for {job.title}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          {job.company_name}
        </Typography>
        <Typography variant="body1" paragraph>
          {job.description.split(">")}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={error && !formData.name}
                helperText={error && !formData.name ? 'Name is required' : ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={error && !formData.email}
                helperText={error && !formData.email ? 'Email is required' : ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={error && !formData.phone}
                helperText={error && !formData.phone ? 'Phone number is required' : ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="LinkedIn URL"
                name="linkedin_url"
                value={formData.linkedin_url}
                onChange={handleChange}
                error={error && !formData.linkedin_url}
                helperText={error && !formData.linkedin_url ? 'LinkedIn URL is required' : ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Resume"
                value={resumeFileName}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <label htmlFor="resume-upload">
                        <FileInput
                          accept=".pdf,.doc,.docx"
                          id="resume-upload"
                          type="file"
                          onChange={handleFileChange}
                        />
                        <Button
                          component="span"
                          startIcon={<CloudUploadIcon />}
                          sx={{ minWidth: 'auto' }}
                        >
                          Upload
                        </Button>
                      </label>
                    </InputAdornment>
                  ),
                }}
                error={error && !resumeFile}
                helperText={error && !resumeFile ? 'Resume is required' : ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
                error={error && !formData.state}
                helperText={error && !formData.state ? 'State is required' : ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                error={error && !formData.country}
                helperText={error && !formData.country ? 'Country is required' : ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Expected Pay Rate"
                name="expected_pay_rate"
                value={formData.expected_pay_rate}
                onChange={handleChange}
                error={error && !formData.expected_pay_rate}
                helperText={error && !formData.expected_pay_rate ? 'Expected pay rate is required' : ''}
              />
            </Grid>
          </Grid>

          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Application submitted successfully! Redirecting...
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={success}
            >
              Submit Application
            </Button>
          </Box>
        </Box>
      </StyledPaper>
    </Container>
  );
};

export default PublicJobApplication; 