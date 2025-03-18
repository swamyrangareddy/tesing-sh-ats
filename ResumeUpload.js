import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Container,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Stack,
  CircularProgress,
  LinearProgress,
  Alert,
  Snackbar,
  Tooltip,
  Chip,
  tableCellClasses,
  Grid,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  Backdrop,
  Fade,
  Checkbox
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { styled, useTheme, alpha } from '@mui/material/styles';
import { getResumes, uploadResume, downloadResume, deleteResume } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const VisuallyHiddenInput = styled('input')`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  width: 1px;
`;

const SearchBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  backdropFilter: 'blur(10px)',
}));

const TopSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  alignItems: 'center',
  width: '100%'
}));

const ToggleSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
  paddingTop: theme.spacing(1),
  borderTop: '1px solid rgba(0, 0, 0, 0.1)',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    '&:hover': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
      },
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(0, 0, 0, 0.1)',
    },
  },
  flexGrow: 1,
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  border: '1px solid rgba(231, 235, 240, 0.8)',
  background: '#ffffff',
  maxHeight: 'calc(100vh - 280px)', // Adjust based on header and search box height
  minHeight: 500, // Minimum height to prevent layout shifts
  overflowX: 'auto', // Enable horizontal scrolling on small screens
  '& .MuiTable-root': {
    minWidth: 900, // Minimum width before horizontal scroll
  },
  '& .MuiTableHead-root': {
    backgroundColor: theme.palette.primary.main,
    position: 'sticky',
    top: 0,
    zIndex: 2, // Increased z-index to ensure header stays above content
    '& .MuiTableCell-head': {
      color: theme.palette.common.white,
      fontWeight: 600,
      backgroundColor: theme.palette.primary.main,
      borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.2)}`, // Subtle header border
    }
  },
  '& .MuiTableBody-root': {
    '& .MuiTableRow-root:last-child': {
      '& .MuiTableCell-body': {
        borderBottom: 'none', // Remove last row border
      }
    }
  },
  '@media (max-width: 600px)': {
    minHeight: 400,
    '& .MuiTable-root': {
      minWidth: 700, // Smaller minimum width on mobile
    }
  }
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    height: 56,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    padding: theme.spacing(2),
    fontSize: '0.875rem',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    '@media (max-width: 600px)': {
      padding: theme.spacing(1.5),
      fontSize: '0.75rem',
    }
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    height: 72,
    maxHeight: 72,
    padding: theme.spacing(1.5),
    '@media (max-width: 600px)': {
      padding: theme.spacing(1),
      height: 64,
      maxHeight: 64,
      fontSize: 13,
    },
    '& .cell-content': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      lineHeight: '1.4em',
      maxHeight: '2.8em', // 2 lines * 1.4em line-height
      '&:hover': {
        textDecoration: 'underline',
        cursor: 'pointer',
        color: theme.palette.primary.main,
      }
    }
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: alpha(theme.palette.primary.main, 0.02),
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  },
  // Hide last border
  '&:last-child td, &:last-child th': {
    borderBottom: 0,
  },
  transition: 'background-color 0.2s ease',
}));

const StyledSkillsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(0.5),
  maxHeight: 64,
  minHeight: 32,
  overflowY: 'auto',
  padding: '6px 4px',
  borderRadius: theme.spacing(1),
  transition: 'all 0.2s ease',
  backgroundColor: alpha(theme.palette.background.paper, 0.6),
  scrollbarWidth: 'thin',
  scrollbarColor: `${alpha(theme.palette.primary.main, 0.2)} transparent`,
  msOverflowStyle: 'auto',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
    borderRadius: '3px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: alpha(theme.palette.primary.main, 0.2),
    borderRadius: '3px',
    '&:hover': {
      background: alpha(theme.palette.primary.main, 0.3),
    }
  },
  '.MuiTableRow-root:hover &': {
    backgroundColor: alpha(theme.palette.background.paper, 0.9),
    '&::-webkit-scrollbar-thumb': {
      background: alpha(theme.palette.primary.main, 0.3),
    },
    scrollbarColor: `${alpha(theme.palette.primary.main, 0.3)} transparent`,
  },
  '@media (max-width: 600px)': {
    maxHeight: 48,
    minHeight: 28,
    padding: '4px 2px',
  }
}));

const StyledSkillChip = styled(Chip)(({ theme }) => ({
  margin: '2px',
  height: 24,
  fontSize: '0.75rem',
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
  color: theme.palette.primary.main,
  transition: 'all 0.2s ease',
  fontWeight: 500,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.16),
    transform: 'translateY(-1px)',
    boxShadow: `0 2px 4px ${alpha(theme.palette.primary.main, 0.15)}`,
  },
  '.MuiTableRow-root:hover &': {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
  },
  '@media (max-width: 600px)': {
    height: 20,
    fontSize: '0.7rem',
    '.MuiChip-label': {
      padding: '0 8px',
    }
  }
}));

const ExperienceCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    transform: 'translateY(-2px)',
    transition: 'all 0.3s ease'
  }
}));

const ViewToggleButton = styled(ToggleButton)(({ theme }) => ({
  padding: theme.spacing(1, 3),
  textTransform: 'none',
  borderRadius: theme.spacing(1),
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: '#fff',
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    }
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  }
}));

const UploadProgress = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  maxWidth: 300,
  width: '100%',
  backgroundColor: theme.palette.background.default,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  backdropFilter: 'blur(10px)',
}));

const StyledUploadIcon = styled('div')({
  fontSize: '48px',
  marginBottom: 16,
  color: 'primary.main',
});

const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  backgroundColor: theme.palette.grey[200],
  '& .MuiLinearProgress-bar': {
    borderRadius: 5,
    backgroundColor: theme.palette.primary.main,
  },
}));

const ResumeUpload = () => {
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const theme = useTheme();
  const [resumes, setResumes] = useState([]);
  const [filteredResumes, setFilteredResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedResume, setSelectedResume] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchQuery, setSearchQuery] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [downloadingResume, setDownloadingResume] = useState(null);
  const [openDownloadDialog, setOpenDownloadDialog] = useState(false);
  const [sessionUploads, setSessionUploads] = useState([]);
  const [allResumes, setAllResumes] = useState([]);
  const [uploadStats, setUploadStats] = useState({
    total: 0,
    successful: 0,
    failed: 0,
    retrying: 0,
    completed: 0
  });
  const [showUploadProgress, setShowUploadProgress] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [selectedResumes, setSelectedResumes] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  useEffect(() => {
    // Check for authentication
    if (!token) {
      navigate('/login');
      return;
    }
    fetchAllResumes();
  }, [token, navigate]);

  useEffect(() => {
    filterResumes();
  }, [searchQuery, sessionUploads, allResumes]);

  const filterResumes = () => {
    const sourceData = allResumes;
    
    if (!searchQuery.trim()) {
      setFilteredResumes(sourceData);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = sourceData.filter(resume => {
      return (
        (resume.name && resume.name.toLowerCase().includes(query)) ||
        (resume.email && resume.email.toLowerCase().includes(query)) ||
        (resume.skills && resume.skills.toLowerCase().includes(query)) ||
        (resume.job_title && resume.job_title.toLowerCase().includes(query)) ||
        (resume.location && resume.location.toLowerCase().includes(query))
      );
    });
    setFilteredResumes(filtered);
  };

  const fetchAllResumes = async () => {
    try {
      setLoading(true);
      const data = await getResumes();
      setAllResumes(data.resumes || []);
      setFilteredResumes(data.resumes || []);
      setError(null);
    } catch (err) {
      if (err.message === 'Session expired. Please login again.') {
        logout();
        navigate('/login');
      } else {
        setError(err.message);
        showSnackbar(err.message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (files.length > 50) {
      showSnackbar('Maximum 50 resumes can be uploaded at once. Please reduce the number of files.', 'error');
      event.target.value = '';
      return;
    }

    const validTypes = ['.pdf', '.doc', '.docx'];
    const invalidFiles = [];

    // Validate all files first
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!validTypes.includes(fileExt)) {
        invalidFiles.push(file.name);
      }
    }

    if (invalidFiles.length > 0) {
      showSnackbar(`Invalid file format(s): ${invalidFiles.join(', ')}. Please upload PDF or DOCX files only.`, 'error');
      return;
    }

    try {
      setLoading(true);
      setShowUploadProgress(true);
      setUploadingFiles(Array.from(files).map(f => f.name));
      
      // Initialize upload stats
      setUploadStats({
        total: files.length,
        successful: 0,
        failed: 0,
        retrying: 0,
        completed: 0
      });

      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
          const response = await uploadResume(formData);
          const data = response.data;

          // Update stats based on response
          setUploadStats(prev => {
            const completed = prev.completed + 1;
            const successful = prev.successful + (data.status === 'success' ? 1 : 0);
            const failed = prev.failed + (data.status === 'error' ? 1 : 0);
            
            return {
              ...prev,
              successful,
              failed,
              completed,
              retrying: data.retries || 0
            };
          });

          // Update progress
          setUploadProgress((prev) => {
            const newProgress = (uploadStats.completed / files.length) * 100;
            return Math.min(newProgress, 100);
          });

          return {
            success: data.status === 'success',
            file: file.name,
            data: data,
            error: data.error
          };
        } catch (err) {
          setUploadStats(prev => ({
            ...prev,
            failed: prev.failed + 1,
            completed: prev.completed + 1
          }));
          return { success: false, file: file.name, error: 'upload_failed' };
        }
      });

      const results = await Promise.all(uploadPromises);
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      // Keep progress dialog visible for a moment to show final stats
      setTimeout(() => {
        setShowUploadProgress(false);
        setUploadProgress(0);
        setUploadingFiles([]);
        
        // Show summary in snackbar
        const message = `Processed ${files.length} resumes:
          • ${successful.length} successful
          • ${failed.length} failed
          • ${uploadStats.retrying} required retries`;
        showSnackbar(message, successful.length > 0 ? 'success' : 'warning');
        
        // Add successful uploads to session uploads
        if (successful.length > 0) {
          const newUploads = successful.map(r => r.data);
          setSessionUploads(prev => [...prev, ...newUploads]);
        }
      }, 2000);

      await fetchAllResumes();
    } catch (err) {
      showSnackbar('An error occurred while uploading resumes', 'error');
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  };

  const handleDownloadClick = (resume) => {
    setDownloadingResume(resume);
    setOpenDownloadDialog(true);
  };

  const handleCloseDownloadDialog = () => {
    setOpenDownloadDialog(false);
    setDownloadingResume(null);
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
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        logout();
        navigate('/login');
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to download resume');
      }

      const contentLength = response.headers.get('content-length');
      if (contentLength === '0') {
        throw new Error('Resume file is empty or not found');
      }

      const contentType = response.headers.get('content-type');
      const contentDisposition = response.headers.get('content-disposition');
      let filename = downloadingResume.filename || 'resume.pdf';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('Downloaded file is empty');
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
      showSnackbar(error.message || 'Failed to download resume', 'error');
    } finally {
      setDownloadingResume(null);
    }
  };

  const handleDelete = async (resume) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) {
      return;
    }
    try {
      await deleteResume(resume._id);
      showSnackbar('Resume deleted successfully', 'success');
      await fetchAllResumes();
      if (selectedResume?._id === resume._id) {
        setOpenDialog(false);
      }
    } catch (err) {
      showSnackbar(err.message, 'error');
    }
  };

  const handleView = async (resume) => {
    try {
      const response = await downloadResume(resume._id, true);
      const url = URL.createObjectURL(response);
      setPreviewUrl(url);
      setSelectedResume(resume);
      setOpenDialog(true);
    } catch (err) {
      showSnackbar(err.message, 'error');
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedResume(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const renderSkills = (skills) => {
    if (!skills) return (
      <Typography variant="body2" color="text.secondary" sx={{ p: 0.5 }}>
        N/A
      </Typography>
    );

    // Handle both string and array formats
    const skillsArray = Array.isArray(skills) 
      ? skills 
      : typeof skills === 'string' 
        ? skills.split(',')
        : [];

    if (skillsArray.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ p: 0.5 }}>
          N/A
        </Typography>
      );
    }

    return skillsArray.map((skill, idx) => (
      <StyledSkillChip
        key={idx}
        label={typeof skill === 'string' ? skill.trim() : 'N/A'}
        size="small"
      />
    ));
  };

  const ResumeDetailsView = ({ resume }) => {
    const sections = [
      {
        title: 'Personal Information',
        icon: <PersonIcon color="primary" />,
        items: [
          { label: 'Name', value: resume.name },
          { label: 'Email', value: resume.email },
          { label: 'Phone', value: resume.phone_number },
          { label: 'Location', value: resume.location }
        ]
      },
      {
        title: 'Professional Information',
        icon: <WorkIcon color="primary" />,
        items: [
          { label: 'Job Title', value: resume.job_title },
          { label: 'Current Job', value: resume.current_job },
          { label: 'Summary', value: resume.resume_summary },
          { 
            label: 'Skills', 
            value: resume.skills,
            render: (value) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {renderSkills(value)}
              </Box>
            )
          }
        ]
      }
    ];

    return (
      <Stack spacing={3}>
        {sections.map((section, idx) => (
          <Paper key={idx} variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {section.icon}
              <Typography variant="h6" color="primary" sx={{ ml: 1 }}>
                {section.title}
              </Typography>
            </Box>
            <Grid container spacing={2}>
              {section.items.map((item, i) => (
                item.value && (
                  <Grid item xs={12} sm={6} key={i}>
                    <Box sx={{ 
                      p: 1.5, 
                      borderRadius: 1,
                      bgcolor: 'background.default',
                      height: '100%',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        {item.label}
                      </Typography>
                      {item.render ? item.render(item.value) : (
                        <Typography variant="body1">
                          {item.value}
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                )
              ))}
            </Grid>
          </Paper>
        ))}

        {resume.experience && Array.isArray(resume.experience) && resume.experience.length > 0 && (
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <WorkIcon color="primary" />
              <Typography variant="h6" color="primary" sx={{ ml: 1 }}>
                Experience
              </Typography>
            </Box>
            <Stack spacing={2}>
              {resume.experience.map((exp, i) => (
                <ExperienceCard key={i} variant="outlined">
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <BusinessIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">
                          {exp.position || 'Position'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <CalendarIcon sx={{ fontSize: '0.9rem', mr: 1, color: 'text.secondary' }} />
                        <Typography variant="subtitle2" color="text.secondary">
                          {exp.company || 'Company'} • {exp.duration || 'Duration'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <DescriptionIcon sx={{ fontSize: '0.9rem', mr: 1, mt: 0.3, color: 'text.secondary' }} />
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {exp.description || 'No description available'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </ExperienceCard>
              ))}
            </Stack>
          </Paper>
        )}
      </Stack>
    );
  };

  // Add new function for handling checkbox selection
  const handleCheckboxChange = (resumeId) => {
    setSelectedResumes(prev => {
      if (prev.includes(resumeId)) {
        return prev.filter(id => id !== resumeId);
      } else {
        return [...prev, resumeId];
      }
    });
  };

  // Add new function for handling select all
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedResumes(filteredResumes.map(resume => resume._id));
    } else {
      setSelectedResumes([]);
    }
  };

  // Add new function for batch processing
  const handleBatchProcess = async () => {
    if (selectedResumes.length === 0) {
      showSnackbar('Please select resumes to process', 'warning');
      return;
    }

    try {
      setIsProcessing(true);
      setProcessingProgress(0);

      for (let i = 0; i < selectedResumes.length; i++) {
        const resumeId = selectedResumes[i];
        const response = await fetch(`http://localhost:5000/api/resumes/${resumeId}/reprocess`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to process resume ${resumeId}`);
        }

        setProcessingProgress(((i + 1) / selectedResumes.length) * 100);
      }

      showSnackbar('Successfully reprocessed selected resumes', 'success');
      fetchAllResumes(); // Refresh the list
      setSelectedResumes([]); // Clear selection
    } catch (error) {
      showSnackbar(error.message, 'error');
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <SearchBox>
        <TopSection>
          <StyledTextField
            label="Search resumes..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
            }}
          />
          <Button
            component="label"
            variant="contained"
            startIcon={<UploadIcon />}
            disabled={loading}
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
            Upload Resume
            <VisuallyHiddenInput 
              type="file" 
              onChange={handleFileUpload} 
              accept=".pdf,.doc,.docx" 
              multiple 
            />
          </Button>
        </TopSection>

        {/* Add Batch Processing Button */}
        {selectedResumes.length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleBatchProcess}
              disabled={isProcessing}
              startIcon={isProcessing ? <CircularProgress size={20} /> : null}
            >
              Reprocess {selectedResumes.length} Selected Resume{selectedResumes.length > 1 ? 's' : ''}
            </Button>
            {isProcessing && (
              <Box sx={{ flexGrow: 1, ml: 2 }}>
                <LinearProgress variant="determinate" value={processingProgress} />
              </Box>
            )}
          </Box>
        )}
      </SearchBox>

      <StyledTableContainer component={Paper}>
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: 300,
            flexDirection: 'column',
            gap: 2
          }}>
            <CircularProgress />
            <Typography color="text.secondary">Loading resumes...</Typography>
          </Box>
        ) : (
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <StyledTableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={selectedResumes.length > 0 && selectedResumes.length < filteredResumes.length}
                    checked={selectedResumes.length > 0 && selectedResumes.length === filteredResumes.length}
                    onChange={handleSelectAll}
                  />
                </StyledTableCell>
                <StyledTableCell sx={{ width: '15%' }}>Name</StyledTableCell>
                <StyledTableCell sx={{ width: '20%' }}>Email</StyledTableCell>
                <StyledTableCell sx={{ width: '15%' }}>Job Title</StyledTableCell>
                <StyledTableCell sx={{ width: '15%' }}>Location</StyledTableCell>
                <StyledTableCell sx={{ width: '25%', padding: '8px 16px' }}>Skills</StyledTableCell>
                <StyledTableCell align="right" sx={{ width: '10%' }}>Actions</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredResumes.map((resume) => (
                <StyledTableRow 
                  key={resume._id}
                  selected={selectedResumes.includes(resume._id)}
                  hover
                >
                  <StyledTableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={selectedResumes.includes(resume._id)}
                      onChange={() => handleCheckboxChange(resume._id)}
                    />
                  </StyledTableCell>
                  <StyledTableCell sx={{ width: '15%' }}>
                    <Typography 
                      className="cell-content" 
                      onClick={() => handleView(resume)}
                    >
                      {resume.name || 'N/A'}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell sx={{ width: '20%' }}>
                    <Typography 
                      className="cell-content"
                      onClick={() => handleView(resume)}
                    >
                      {resume.email || 'N/A'}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell sx={{ width: '15%' }}>
                    <Typography 
                      className="cell-content"
                      onClick={() => handleView(resume)}
                    >
                      {resume.job_title || 'N/A'}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell sx={{ width: '15%' }}>
                    <Typography 
                      className="cell-content"
                      onClick={() => handleView(resume)}
                    >
                      {resume.location || 'N/A'}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell sx={{ width: '25%', padding: '8px 16px' }}>
                    <StyledSkillsContainer>
                      {renderSkills(resume.skills)}
                    </StyledSkillsContainer>
                  </StyledTableCell>
                  <StyledTableCell align="right" sx={{ width: '10%' }}>
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <Tooltip title="View Details" arrow>
                        <IconButton 
                          onClick={() => handleView(resume)} 
                          size="small" 
                          sx={{ 
                            color: 'primary.main',
                            '&:hover': { 
                              backgroundColor: 'primary.lighter',
                              transform: 'scale(1.1)' 
                            }
                          }}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download Resume" arrow>
                        <IconButton 
                          onClick={() => handleDownloadClick(resume)} 
                          size="small"
                          sx={{ 
                            color: 'primary.main',
                            '&:hover': { 
                              backgroundColor: 'primary.lighter',
                              transform: 'scale(1.1)' 
                            }
                          }}
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete" arrow>
                        <IconButton 
                          onClick={() => handleDelete(resume)} 
                          size="small"
                          sx={{ 
                            color: 'error.main',
                            '&:hover': { 
                              backgroundColor: 'error.lighter',
                              transform: 'scale(1.1)' 
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
              {filteredResumes.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      gap: 2
                    }}>
                      <SearchIcon sx={{ 
                        fontSize: 48, 
                        color: 'text.secondary', 
                        opacity: 0.5,
                        mb: 1
                      }} />
                      <Typography variant="h6" color="text.secondary">
                        {searchQuery 
                          ? 'No matching resumes found' 
                          : 'No resumes in the database'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchQuery 
                          ? 'Try adjusting your search terms' 
                          : 'Upload some resumes to populate the database'}
                      </Typography>
                      {!searchQuery && (
                        <Button
                          component="label"
                          variant="contained"
                          startIcon={<UploadIcon />}
                          sx={{ mt: 2 }}
                        >
                          Upload Resume
                          <VisuallyHiddenInput 
                            type="file" 
                            onChange={handleFileUpload} 
                            accept=".pdf,.doc,.docx" 
                            multiple 
                          />
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </StyledTableContainer>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Resume Details
            </Typography>
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedResume && <ResumeDetailsView resume={selectedResume} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDownloadDialog}
        onClose={handleCloseDownloadDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
          Download Resume
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {downloadingResume && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {downloadingResume.name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Are you sure you want to download this resume?
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Resume Details:</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      <strong>Email:</strong> {downloadingResume.email}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      <strong>Phone:</strong> {downloadingResume.phone_number}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      <strong>Skills:</strong> {downloadingResume.skills}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
          <Button onClick={handleCloseDownloadDialog}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
            }}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>

      <Backdrop
        open={showUploadProgress}
        sx={{ 
          color: '#fff', 
          zIndex: 1300,
          backgroundColor: 'rgba(0, 0, 0, 0.8)' 
        }}
      >
        <Fade in={showUploadProgress}>
          <UploadProgress>
            <StyledUploadIcon>
              {uploadProgress === 100 ? <CheckIcon /> : <UploadIcon />}
            </StyledUploadIcon>
            <Typography variant="h6" gutterBottom>
              {uploadProgress === 100 ? 'Upload Complete!' : 'Uploading Resumes...'}
            </Typography>
            <StyledLinearProgress 
              variant="determinate" 
              value={uploadProgress} 
            />
            <Typography variant="body2" color="text.secondary">
              Processing {uploadStats.completed} of {uploadStats.total} files
            </Typography>
            <Box sx={{ mt: 2, textAlign: 'left' }}>
              <Typography variant="body2" color="success.main">
                Successful: {uploadStats.successful}
              </Typography>
              <Typography variant="body2" color="error.main">
                Failed: {uploadStats.failed}
              </Typography>
              {uploadStats.retrying > 0 && (
                <Typography variant="body2" color="warning.main">
                  Retrying: {uploadStats.retrying}
                </Typography>
              )}
            </Box>
            {uploadingFiles.length > 0 && uploadProgress < 100 && (
              <Box sx={{ mt: 2, maxHeight: 100, overflowY: 'auto' }}>
                {uploadingFiles.map((file, index) => (
                  <Typography 
                    key={index} 
                    variant="caption" 
                    display="block" 
                    color="text.secondary"
                    sx={{ 
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {file}
                  </Typography>
                ))}
              </Box>
            )}
          </UploadProgress>
        </Fade>
      </Backdrop>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ResumeUpload;