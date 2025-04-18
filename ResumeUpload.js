import React, { useState, useEffect, useRef } from 'react';
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
  ToggleButton,
  Backdrop,
  TablePagination,
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
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { styled, useTheme, alpha } from '@mui/material/styles';
import { getResumes, uploadResume, downloadResume, deleteResume, getResumesCount } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Lottie from 'lottie-react';
import extractionAnimation from '../assets/animations/Animation - 1743215778009.json';
import { useResumeCount } from '../contexts/ResumeCountContext';
import useDebounce from '../hooks/useDebounce';
import { motion } from 'framer-motion';

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

// Add this upload progress backdrop component after other styled components
const UploadProgressBackdrop = styled(Backdrop)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  color: '#fff',
}));

// Add this component near StyledTableContainer
const ProgressCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  maxWidth: 400,
  width: '100%',
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[10],
}));

// Add this styled component after your existing styled components
const StatsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(3),
  padding: theme.spacing(2, 3),
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
}));

const StatCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  backgroundColor: alpha(theme.palette.primary.main, 0.05),
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    transform: 'translateY(-2px)',
  }
}));

// Create a memoized UploadProgressDialog component to prevent unnecessary re-renders
const UploadProgressDialog = React.memo(({ 
  open, 
  onClose, 
  uploadStats, 
  showAnimation, 
  isError 
}) => {
  const isProcessing = uploadStats.processingStage === 'Processing...';
  const isComplete = uploadStats.processingStage === 'Complete';
  
  // Calculate progress percentage
  const progressPercentage = uploadStats.total > 0 
    ? Math.round((uploadStats.completed / uploadStats.total) * 100) 
    : 0;
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 2
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" component="div">
          {isComplete ? 'Processing Complete' : isError ? 'Processing Error' : 'Processing Resumes'}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ width: '100%', mt: 1 }}>
          {showAnimation && (
            <Box sx={{ width: '100%', height: 200, display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
              <Lottie
                animationData={extractionAnimation}
                loop={!isComplete && !isError}
                style={{ width: 200, height: 200 }}
              />
            </Box>
          )}
          <Box sx={{ mb: 2 }}>
            <LinearProgress 
              variant="determinate"
              value={progressPercentage}
              sx={{
                height: 8,
                borderRadius: 4,
                '& .MuiLinearProgress-bar': {
                  transition: 'transform 0.3s linear'
                }
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', textAlign: 'right' }}>
              {progressPercentage}%
            </Typography>
          </Box>
          {uploadStats.currentFile && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {isComplete ? 'All files processed' : isError ? 'Error occurred during processing' : `Processing: ${uploadStats.currentFile}`}
            </Typography>
          )}
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.primary">
                Total Files:
              </Typography>
              <Typography variant="h6" color="primary.main">
                {uploadStats.total}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.primary">
                Processed:
              </Typography>
              <Typography variant="h6" color="primary.main">
                {uploadStats.completed} / {uploadStats.total}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color={uploadStats.successful > 0 ? "success.main" : "text.primary"}>
                Successful:
              </Typography>
              <Typography variant="h6" color="success.main">
                {uploadStats.successful}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color={uploadStats.failed > 0 ? "error.main" : "text.primary"}>
                Failed:
              </Typography>
              <Typography variant="h6" color="error.main">
                {uploadStats.failed}
              </Typography>
            </Grid>
            {uploadStats.retrying > 0 && !isComplete && !isError && (
              <Grid item xs={12}>
                <Typography variant="body2" color="warning.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Retrying extraction...
                  <CircularProgress size={16} thickness={6} color="warning" />
                </Typography>
              </Grid>
            )}
            {isComplete && (
              <Grid item xs={12}>
                <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  All files processed successfully!
                </Typography>
              </Grid>
            )}
            {isError && (
              <Grid item xs={12}>
                <Typography variant="body2" color="error.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  An error occurred during processing. Please try again.
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>
    </Dialog>
  );
});

// Add a display name for the component
UploadProgressDialog.displayName = 'UploadProgressDialog';

const ResumeUpload = () => {
  const navigate = useNavigate();
  const { token, logout, isAuthenticated } = useAuth();
  const { totalResumes, updateResumeCount } = useResumeCount();
  const [resumes, setResumes] = useState([]);
  const [filteredResumes, setFilteredResumes] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // 300ms delay
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedResume, setSelectedResume] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
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
    completed: 0,
    updated: 0,
    currentFile: '',
    processingStage: ''
  });
  const [showAnimation, setShowAnimation] = useState(false);
  const [showUploadProgress, setShowUploadProgress] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [failedResumes, setFailedResumes] = useState([]);
  const [retryingResumes, setRetryingResumes] = useState(false);
  const [resumeCountAnimation, setResumeCountAnimation] = useState({
    prevCount: 0,
    newCount: 0,
    isAnimating: false
  });

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    // Use skipLoadingState=true to prevent loading state changes on initial load
    fetchAllResumes(0, true);
    fetchTotalResumes();
  }, [token, navigate]);

  useEffect(() => {
    filterResumes();
  }, [debouncedSearchTerm, resumes]);

  const filterResumes = () => {
    const sourceData = allResumes;
    
    if (!searchTerm.trim()) {
      setFilteredResumes(sourceData);
      return;
    }

    const query = searchTerm.toLowerCase();
    const filtered = sourceData.filter(resume => {
      // Only filter by job title
      return resume.job_title && resume.job_title.toLowerCase().includes(query);
    });
    setFilteredResumes(filtered);
  };

  const fetchAllResumes = async (retryCount = 0, skipLoadingState = false) => {
    // Only set loading state if not skipping it
    if (!skipLoadingState) {
      setLoading(true);
    }
    
    try {
      // Use a direct API call to avoid any state changes that could cause re-renders
      const response = await getResumes();
      
      // Check if response exists and has the expected format
      if (response && response.data && response.data.resumes) {
        // Update state with the resumes data
        setAllResumes(response.data.resumes);
        setFilteredResumes(response.data.resumes);
        setError(null);
      } else {
        // console.error('Invalid response format:', response);
        setAllResumes([]);
        setFilteredResumes([]);
        setError('Invalid response format');
      }
    } catch (err) {
      // console.error('Error fetching resumes:', err);
      
      // Handle session expiration
      if (err.message === 'Session expired. Please login again.') {
        logout();
        navigate('/login');
        return;
      }
      
      // Retry on network errors
      if (retryCount < 3 && (err.message.includes('Network Error') || err.message.includes('Failed to fetch'))) {
        // console.log(`Retrying fetch (${retryCount + 1}/3)...`);
        setTimeout(() => fetchAllResumes(retryCount + 1, skipLoadingState), 1000 * (retryCount + 1));
        return;
      }
      
      setError(err.message);
      showSnackbar(err.message, 'error');
    } finally {
      // Only set loading to false if we're not skipping loading state
      if (!skipLoadingState) {
        setLoading(false);
      }
    }
  };

  const fetchTotalResumes = async () => {
    try {
      const response = await getResumesCount();
      if (response && response.data) {
        // Update the total resumes count in the context
        updateTotalResumesWithAnimation(response.data.count);
      }
    } catch (err) {
      // console.error('Error fetching total resumes:', err);
      showSnackbar('Failed to update resume count', 'error');
    }
  };

  const updateTotalResumesWithAnimation = (newCount) => {
    setResumeCountAnimation(prev => ({
      prevCount: totalResumes,
      newCount: newCount,
      isAnimating: true
    }));
    
    // Update the actual count
    updateResumeCount(newCount - totalResumes);
    
    // Reset animation after delay
    setTimeout(() => {
      setResumeCountAnimation(prev => ({
        ...prev,
        isAnimating: false
      }));
    }, 1000);
  };

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Set initial states in a batch to minimize re-renders
    setShowUploadProgress(true);
    setShowAnimation(true);
    setUploadingFiles(true);
    setUploadStats({
      total: files.length,
      completed: 0,
      successful: 0,
      failed: 0,
      retrying: 0,
      updated: 0,
      currentFile: '',
      processingStage: 'Starting...'
    });

    try {
      // Process files in smaller batches for better progress tracking
      const batchSize = 2;
      const batches = [];
      for (let i = 0; i < files.length; i += batchSize) {
        batches.push(Array.from(files).slice(i, i + batchSize));
      }

      const allResults = [];
      let totalProcessed = 0;
      let statsUpdateTimeout;
      let errorCount = 0;
      const tempFailedResumes = [];

      // Function to update stats with debouncing
      const updateStats = (newStats) => {
        if (statsUpdateTimeout) {
          clearTimeout(statsUpdateTimeout);
        }
        statsUpdateTimeout = setTimeout(() => {
          setUploadStats(prev => ({
            ...prev,
            ...newStats
          }));
        }, 100);
      };

      // Process all batches without updating the UI between batches
      for (const batch of batches) {
        const batchPromises = batch.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          
          updateStats({
            currentFile: file.name,
            processingStage: 'Processing...'
          });

          try {
            const response = await uploadResume(formData);
            
            if (response.data && response.data.results) {
              for (const result of response.data.results) {
                allResults.push(result);
                
                if (result.status === 'error') {
                  errorCount++;
                  tempFailedResumes.push({
                    id: Date.now() + Math.random(), // Generate unique ID
                    filename: file.name,
                    error_type: result.error || 'Unknown error',
                    error_message: result.message || 'Unknown error',
                    file: file // Store the file for retry
                  });
                  // console.error(`Error processing file ${file.name}:`, result.message || 'Unknown error');
                }
              }
              
              totalProcessed++;
              
              const successful = allResults.filter(r => r.status === 'success').length;
              const failed = allResults.filter(r => r.status === 'error').length;
              const updated = allResults.filter(r => r.message && r.message.includes('updated')).length;
              const retrying = allResults.filter(r => r.retries && r.retries > 0).length;

              updateStats({
                successful,
                failed,
                completed: totalProcessed,
                retrying,
                updated,
                processingStage: totalProcessed === files.length ? 'Finalizing...' : 'Processing...'
              });
            }
            return { status: 'success', file };
          } catch (err) {
            // console.error(`Error processing file ${file.name}:`, err);
            errorCount++;
            totalProcessed++;
            tempFailedResumes.push({
              id: Date.now() + Math.random(),
              filename: file.name,
              error_type: 'processing_failed',
              error_message: err.message,
              file: file
            });
            
            updateStats({
              failed: allResults.filter(r => r.status === 'error').length + 1,
              completed: totalProcessed,
              processingStage: totalProcessed === files.length ? 'Finalizing...' : 'Processing...'
            });
            return { status: 'error', file, error: err };
          }
        });

        await Promise.all(batchPromises);
      }

      // Update failed resumes list
      setFailedResumes(tempFailedResumes);

      // Clear any pending stats updates
      if (statsUpdateTimeout) {
        clearTimeout(statsUpdateTimeout);
      }

      // Calculate final stats accurately
      const finalStats = {
        successful: allResults.filter(r => r.status === 'success').length,
        failed: allResults.filter(r => r.status === 'error').length,
        updated: allResults.filter(r => r.message && r.message.includes('updated')).length,
        uploaded: allResults.filter(r => r.message && r.message.includes('uploaded')).length,
        maxRetries: allResults.filter(r => r.retries && r.retries >= 3).length
      };
      
      // Update total resumes count with animation
      if (finalStats.uploaded > 0) {
        updateTotalResumesWithAnimation(totalResumes + finalStats.uploaded);
      }
      
      setUploadStats(prev => ({
        ...prev,
        successful: finalStats.successful,
        failed: finalStats.failed,
        completed: files.length,
        updated: finalStats.updated,
        currentFile: '',
        processingStage: errorCount > 0 ? 'Error occurred' : 'Complete'
      }));
      
      const message = `Processed ${files.length} resumes:
        • ${finalStats.uploaded} new uploads
        • ${finalStats.updated} updates
        • ${finalStats.failed} failed
        • ${finalStats.maxRetries} max retries reached`;
      
      let severity = 'success';
      if (finalStats.failed > 0 || finalStats.maxRetries > 0) {
        severity = (finalStats.failed + finalStats.maxRetries) === files.length ? 'error' : 'warning';
      }
      
      showSnackbar(message, severity);

      setTimeout(() => {
        setShowUploadProgress(false);
        setShowAnimation(false);
        fetchAllResumes();
      }, 1500);
    } catch (error) {
      // console.error('Error during file upload:', error);
      showSnackbar('Error uploading files. Please try again.', 'error');
      
      setUploadStats(prev => ({
        ...prev,
        processingStage: 'Error occurred'
      }));
      
      setTimeout(() => {
        setShowUploadProgress(false);
        setShowAnimation(false);
      }, 1500);
    } finally {
      event.target.value = '';
      setUploadingFiles(false);
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
      // console.error('Download error:', error);
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
      // Update the total resumes count with animation
      updateTotalResumesWithAnimation(totalResumes - 1);
      await fetchAllResumes();
      if (selectedResume?._id === resume._id) {
        setOpenDialog(false);
      }
    } catch (err) {
      // console.error('Error deleting resume:', err);
      showSnackbar(err.message || 'Failed to delete resume', 'error');
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
        {(resume.experience || resume.experience_details) && 
         Array.isArray(resume.experience || resume.experience_details) && 
         (resume.experience || resume.experience_details).length > 0 && (
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <WorkIcon color="primary" />
              <Typography variant="h6" color="primary" sx={{ ml: 1 }}>
                Experience
              </Typography>
            </Box>
            <Stack spacing={2}>
              {(resume.experience || resume.experience_details).map((exp, i) => (
                <ExperienceCard key={i} variant="outlined">
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <BusinessIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">
                          {exp.title || exp.job_title || 'Position'}
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
                          {exp.responsibilities || exp.description || 'No description available'}
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

  const handleRetryFailedResume = async (failedResume) => {
    try {
      setRetryingResumes(true);
      const formData = new FormData();
      formData.append('file', failedResume.file);
      
      const response = await uploadResume(formData);
      
      if (response.data && response.data.results) {
        const result = response.data.results[0];
        if (result.status === 'success') {
          // Remove the failed resume from the list
          setFailedResumes(prev => prev.filter(r => r.id !== failedResume.id));
          showSnackbar('Resume processed successfully', 'success');
          
          // Update the total resumes count in the context
          // Check if this is a new upload or an update
          if (result.message && result.message.includes('uploaded')) {
            updateTotalResumesWithAnimation(totalResumes + 1);
          }
          
          await fetchAllResumes();
        } else {
          showSnackbar('Failed to process resume. Please try again.', 'error');
        }
      }
    } catch (err) {
      // console.error('Error retrying failed resume:', err);
      showSnackbar(err.message, 'error');
    } finally {
      setRetryingResumes(false);
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                backgroundColor: resumeCountAnimation.isAnimating ? 'success.main' : 'primary.main',
                color: 'white',
                padding: '8px 16px',
                borderRadius: 2,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                transition: 'all 0.3s ease',
                transform: resumeCountAnimation.isAnimating ? 'scale(1.1)' : 'scale(1)'
              }}
            >
              Total Resumes: {resumeCountAnimation.isAnimating ? 
                <motion.span
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {resumeCountAnimation.newCount}
                </motion.span> 
                : totalResumes
              }
            </Typography>
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
          </Box>
        </TopSection>
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
                <StyledTableCell sx={{ width: '12%' }}>Name</StyledTableCell>
                <StyledTableCell sx={{ width: '15%' }}>Email</StyledTableCell>
                <StyledTableCell sx={{ width: '12%' }}>Phone</StyledTableCell>
                <StyledTableCell sx={{ width: '15%' }}>Job Title</StyledTableCell>
                <StyledTableCell sx={{ width: '12%' }}>Location</StyledTableCell>
                <StyledTableCell sx={{ width: '24%', padding: '8px 16px' }}>Skills</StyledTableCell>
                <StyledTableCell align="right" sx={{ width: '10%' }}>Actions</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredResumes.map((resume) => (
                <StyledTableRow 
                  key={resume._id}
                  hover
                >
                  <StyledTableCell sx={{ width: '12%' }}>
                    <Typography 
                      className="cell-content" 
                      onClick={() => handleView(resume)}
                    >
                      {resume.name || 'N/A'}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell sx={{ width: '15%' }}>
                    <Typography 
                      className="cell-content"
                      onClick={() => handleView(resume)}
                    >
                      {resume.email || 'N/A'}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell sx={{ width: '12%' }}>
                    <Typography 
                      className="cell-content"
                      onClick={() => handleView(resume)}
                    >
                      {resume.phone_number || 'N/A'}
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
                  <StyledTableCell sx={{ width: '12%' }}>
                    <Typography 
                      className="cell-content"
                      onClick={() => handleView(resume)}
                    >
                      {resume.location || 'N/A'}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell sx={{ width: '24%', padding: '8px 16px' }}>
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
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
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
                        {searchTerm 
                          ? 'No matching resumes found' 
                          : 'No resumes in the database'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchTerm 
                          ? 'Try adjusting your search terms' 
                          : 'Upload some resumes to populate the database'}
                      </Typography>
                      {!searchTerm && (
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

      {failedResumes.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" color="error">
              Failed Resumes ({failedResumes.length})
            </Typography>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                failedResumes.forEach(resume => handleRetryFailedResume(resume));
              }}
              disabled={retryingResumes}
              startIcon={retryingResumes ? <CircularProgress size={20} /> : <RefreshIcon />}
            >
              Retry All Failed
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Filename</TableCell>
                  <TableCell>Error Type</TableCell>
                  <TableCell>Error Message</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {failedResumes.map((resume) => (
                  <TableRow key={resume.id}>
                    <TableCell>{resume.filename}</TableCell>
                    <TableCell>{resume.error_type}</TableCell>
                    <TableCell>{resume.error_message}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleRetryFailedResume(resume)}
                        disabled={retryingResumes}
                      >
                        Retry
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

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
          <Button 
            onClick={() => {
              handleCloseDialog();
              navigate('/resume-profile', { state: { resume: selectedResume } });
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

      <UploadProgressDialog 
        open={showUploadProgress}
        onClose={() => setShowUploadProgress(false)}
        uploadStats={uploadStats}
        showAnimation={showAnimation}
        isError={uploadStats.processingStage === 'Error occurred'}
      />
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