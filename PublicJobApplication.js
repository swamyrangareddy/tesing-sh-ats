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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { getPublicJob, applyForPublicJob, processAndStoreResume } from '../services/api';
import { CloudUpload as CloudUploadIcon, Upload as UploadIcon, CheckCircle as CheckCircleIcon, Work as WorkIcon, LocationOn as LocationIcon, AttachMoney as MoneyIcon, Business as BusinessIcon, Person as PersonIcon } from '@mui/icons-material';
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

const DetailChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  fontWeight: 500,
  '& .MuiChip-icon': {
    color: theme.palette.primary.main,
  },
}));

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
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    state: '',
    city: '',
    country: '',
    visa_type: '',
    skills: '',
    experience: '',
    education: '',
    job_title: '',
    current_role: '',
    current_company: '',
    total_experience: '',
    status: 'Submitted'
  });
  const [previewUrl, setPreviewUrl] = useState('');
  const [downloadingResume, setDownloadingResume] = useState(null);
  const [openDownloadDialog, setOpenDownloadDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        setError('');
        const jobData = await getPublicJob(shareableLink);
        setJob(jobData);
      } catch (err) {
        console.error('Error fetching job:', err);
        setError(err.message || 'Failed to load job details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (shareableLink) {
      fetchJob();
    } else {
      setError('Invalid job link');
      setLoading(false);
    }
  }, [shareableLink]);

  const handleResumeUpload = async (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');
    setUploadedFileName(file.name);

    try {
      // Validate file type
      const validTypes = ['.pdf', '.docx', '.doc'];
      const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!validTypes.includes(fileExt)) {
        throw new Error('Please upload a PDF or DOCX file');
      }

      // Create FormData to send the file
      const formDataToSend = new FormData();
      formDataToSend.append('resume', file);

      // Call the API to process and store the resume
      const response = await processAndStoreResume(formDataToSend);
      
      if (!response || !response.resume_id) {
        console.log('Server response:', response); // Debug log
        throw new Error('Failed to process resume. Please try again.');
      }

      // Update form data with extracted information
      setFormData(prev => ({
        ...prev,
        resume_id: response.resume_id,
        name: response.name || prev.name,
        email: response.email || prev.email,
        phone: response.phone_number || prev.phone,
        job_title: response.job_title || prev.job_title || '',
        current_role: response.current_role || prev.current_role || '',
        current_company: response.current_company || prev.current_company || '',
        total_experience: response.total_experience || prev.total_experience || '',
        state: response.location ? response.location.split(',')[1]?.trim() : prev.state,
        city: response.location ? response.location.split(',')[0]?.trim() : prev.city,
        country: response.location ? response.location.split(',')[2]?.trim() : prev.country,
        linkedin: response.linkedin || prev.linkedin,
        skills: Array.isArray(response.skills) 
          ? response.skills.join(', ')
          : typeof response.skills === 'string' 
            ? response.skills 
            : prev.skills,
        experience: Array.isArray(response.experience_details) 
          ? response.experience_details.map(exp => 
              `${exp.title || exp.job_title || ''}\n${exp.responsibilities || exp.description || ''}`
            ).join('\n\n') 
          : prev.experience,
        education: response.education || prev.education,
        visa_type: response.visa || prev.visa_type
      }));

      // showSnackbar('Resume uploaded successfully', 'success');
    } catch (error) {
      console.error('Error handling resume:', error);
      setError(error.message || 'Failed to process resume');
      setUploadedFileName('');
      showSnackbar(error.message || 'Failed to process resume', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (!formData.resume_id) {
        throw new Error('Please upload a resume first');
      }

      // Create FormData object
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add resume_id
      formDataToSend.append('resume_id', formData.resume_id);

      // Add additional fields for resume update
      const resumeUpdateData = {
        name: formData.name,
        email: formData.email,
        phone_number: formData.phone,
        location: `${formData.city}, ${formData.state}, ${formData.country}`,
        skills: formData.skills,
        education: formData.education,
        experience_details: formData.experience ? formData.experience.split('\n\n').map(exp => {
          const [title, details] = exp.split('\n');
          return {
            title: title || '',
            responsibilities: details || ''
          };
        }) : [],
        visa_type: formData.visa_type,
        linkedin: formData.linkedin,
        job_title: formData.job_title,
        current_role: formData.current_role,
        current_company: formData.current_company,
        total_experience: formData.total_experience
      };

      // Add resume update data
      formDataToSend.append('resume_data', JSON.stringify(resumeUpdateData));

      // Submit the job application
      const result = await applyForPublicJob(shareableLink, formDataToSend);
      
      // Show success message
      setSuccess('Application submitted successfully!');
      setShowSuccessDialog(true);

      // Clear form after successful submission
      setFormData({
        name: '',
        email: '',
        phone: '',
        linkedin: '',
        state: '',
        city: '',
        country: '',
        visa_type: '',
        skills: '',
        experience: '',
        education: '',
        job_title: '',
        current_role: '',
        current_company: '',
        total_experience: '',
        status: 'Submitted'
      });
      setUploadedFileName('');
      
    } catch (error) {
      console.error('Error submitting application:', error);
      setError(error.message || 'Failed to submit application');
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedResume(null);
  };

  const handleView = async (resume) => {
    try {
      setError('');
      if (!resume._id) {
        throw new Error('Invalid resume data');
      }

      const response = await fetch(`http://localhost:5000/api/resumes/${resume._id}/preview`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to preview resume');
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('Resume file is empty');
      }

      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setSelectedResume(resume);
      setOpenDialog(true);
    } catch (error) {
      console.error('View error:', error);
      setError(error.message || 'Failed to view resume');
      showSnackbar(error.message || 'Failed to view resume', 'error');
    }
  };

  const handleDownload = async () => {
    if (!downloadingResume) return;

    try {
      setError('');
      
      if (!downloadingResume._id) {
        throw new Error('Invalid resume data');
      }

      const response = await fetch(`http://localhost:5000/api/resumes/${downloadingResume._id}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to download resume');
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('Resume file is empty');
      }

      const contentType = response.headers.get('content-type');
      const contentDisposition = response.headers.get('content-disposition');
      let filename = downloadingResume.file_name || 'resume.pdf';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      const url = window.URL.createObjectURL(
        new Blob([blob], { type: contentType || 'application/octet-stream' })
      );
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      setOpenDownloadDialog(false);
      showSnackbar('Resume downloaded successfully', 'success');
    } catch (error) {
      console.error('Download error:', error);
      setError(error.message || 'Failed to download resume');
      showSnackbar(error.message || 'Failed to download resume', 'error');
    } finally {
      setDownloadingResume(null);
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
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          
        </Box>
      </Container>
    );
  }

  if (!job) {
    return (
      <Container>
        <Box mt={4}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Job not found
          </Alert>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/')}
          >
            Return to Home
          </Button>
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <StyledPaper elevation={3}>
        <Box sx={{ p: 4 }}>
          {/* Job Details Section */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WorkIcon sx={{ mr: 2, color: theme.palette.primary.main }} />
                <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                  {job?.title}
                </Typography>
              </Box>
              
               {job?.location && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationIcon sx={{ mr: 2, color: theme.palette.primary.main }} />
                  <Typography variant="h6" color="text.secondary">
                    {job?.location}
                  </Typography>
                </Box>
              )} 
              
              {job?.client && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <BusinessIcon sx={{ mr: 2, color: theme.palette.primary.main }} />
                  <Typography variant="h6" color="text.secondary">
                    {job?.Client}
                  </Typography>
                </Box>
              )} 
            </Grid>
            
           
          </Grid>

          {/* Job Description Section */}
          {job?.description && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Job Description</Typography>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  backgroundColor: 'rgba(0,0,0,0.02)', 
                  borderRadius: 2,
                  border: '1px solid rgba(0,0,0,0.05)'
                }}
              >
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {job?.description}
                </Typography>
              </Paper>
            </Box>
          )}

          {/* Application Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              Submit Your Application
            </Typography>
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
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
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
                  label="Visa Type"
                  name="visa_type"
                  value={formData.visa_type}
                  onChange={(e) => setFormData({ ...formData, visa_type: e.target.value })}
                  fullWidth
                />
              </Grid>
              {/* <Grid item xs={12} md={6}>
                <TextField
                  label="Job Title"
                  name="job_title"
                  value={formData.job_title}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Current Role"
                  name="current_role"
                  value={formData.current_role}
                  onChange={(e) => setFormData({ ...formData, current_role: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Current Company"
                  name="current_company"
                  value={formData.current_company}
                  onChange={(e) => setFormData({ ...formData, current_company: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Total Experience"
                  name="total_experience"
                  value={formData.total_experience}
                  onChange={(e) => setFormData({ ...formData, total_experience: e.target.value })}
                  fullWidth
                />
              </Grid> */}

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

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Resume Details</DialogTitle>
        <DialogContent>
          {selectedResume && (
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedResume.name}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1">
                    <strong>Email:</strong> {selectedResume.email}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1">
                    <strong>Phone:</strong> {selectedResume.phone}
                  </Typography>
                </Grid>
                {selectedResume.skills && (
                  <Grid item xs={12}>
                    <Typography variant="body1">
                      <strong>Skills:</strong> {selectedResume.skills}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              handleCloseDialog();
              navigate(`/resume/${selectedResume._id}`, { state: { resume: selectedResume } });
            }}
            variant="contained"
            color="primary"
            startIcon={<PersonIcon />}
            sx={{ mr: 1 }}
          >
            View Full Profile
          </Button>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Success Dialog */}
      <Dialog
        open={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            textAlign: 'center',
            p: 3
          }
        }}
      >
        <DialogContent>
          <CheckCircleIcon 
            sx={{ 
              fontSize: 60, 
              color: 'success.main',
              mb: 2
            }} 
          />
          <Typography variant="h5" gutterBottom>
            Application Submitted Successfully!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Thank you for your application. We will review it and get back to you soon.
          </Typography>
        </DialogContent>

      </Dialog>
    </Container>
  );
};

export default PublicJobApplication; 