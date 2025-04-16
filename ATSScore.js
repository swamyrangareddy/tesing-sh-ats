import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Box,
  CircularProgress,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid,
  Checkbox,
  Chip,
  Select,
  MenuItem,
  InputLabel,
  IconButton,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  Person as PersonIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  AddCircleOutline as AddCircleOutlineIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { analyzeResumes, getJobs, getResumesCount, extractSkills } from '../services/api';
import { useResumeCount } from '../contexts/ResumeCountContext';

const StyledChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  borderRadius: '16px',
  '& .MuiChip-deleteIcon': {
    color: theme.palette.primary.main,
    '&:hover': {
      color: theme.palette.primary.dark,
    },
  },
  '&.MuiChip-colorPrimary': {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    '& .MuiChip-deleteIcon': {
      color: 'white',
      '&:hover': {
        color: theme.palette.grey[200],
      },
    },
  },
  '&.MuiChip-colorSuccess': {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.dark,
    '& .MuiChip-deleteIcon': {
      color: theme.palette.success.dark,
      '&:hover': {
        color: theme.palette.success.main,
      },
    },
  },
  '&.MuiChip-outlined': {
    borderWidth: '1.5px',
    '&.MuiChip-colorPrimary': {
      color: theme.palette.primary.main,
      borderColor: theme.palette.primary.main,
      backgroundColor: 'transparent',
      '& .MuiChip-deleteIcon': {
        color: theme.palette.primary.main,
        '&:hover': {
          color: theme.palette.primary.dark,
        },
      },
    },
    '&.MuiChip-colorSuccess': {
      color: theme.palette.success.dark,
      borderColor: theme.palette.success.main,
      backgroundColor: 'transparent',
      '& .MuiChip-deleteIcon': {
        color: theme.palette.success.main,
        '&:hover': {
          color: theme.palette.success.dark,
        },
      },
    },
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(231, 235, 240, 0.8)',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(3),
  borderRadius: theme.spacing(1),
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  '& .MuiTable-root': {
    minWidth: 650,
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.grey[100],
  color: theme.palette.text.primary,
  fontSize: 14,
  '& .MuiCheckbox-root': {
    color: theme.palette.text.primary,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
  },
  transition: 'background-color 0.2s ease',
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

const StyledFormControl = styled(FormControl)(({ theme }) => ({
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

const ProgressBar = styled(CircularProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: 'rgba(0, 0, 0, 0.05)',
  '& .MuiCircularProgress-circle': {
    borderRadius: 4,
    transition: 'stroke-dashoffset 0.5s ease-in-out',
  },
  '&.MuiCircularProgress-indeterminate': {
    animation: 'none',
    '& .MuiCircularProgress-circle': {
      animation: 'circular-rotate 1.4s linear infinite',
    },
  },
  '@keyframes circular-rotate': {
    '0%': {
      transform: 'rotate(0deg)',
    },
    '100%': {
      transform: 'rotate(360deg)',
    },
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(1, 3),
  textTransform: 'none',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
  },
}));

const SkillsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  padding: theme.spacing(2),
  border: '1px solid rgba(0, 0, 0, 0.1)',
  borderRadius: theme.spacing(2),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  minHeight: '100px',
  backgroundColor: theme.palette.background.paper,
  boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
}));

const ATSScore = () => {
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { totalResumes } = useResumeCount();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [descriptionType, setDescriptionType] = useState('custom');
  const [jobDescription, setJobDescription] = useState('');
  const [matchThreshold, setMatchThreshold] = useState(70);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedResume, setSelectedResume] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [showSkillsEditor, setShowSkillsEditor] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await getJobs();
        
        // Extract data from response, handling different response formats
        const jobsData = response.data || response || [];
        
        // Ensure jobsData is an array
        const jobsArray = Array.isArray(jobsData) ? jobsData : [];
        
        setJobs(jobsArray);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setError('Failed to fetch jobs');
        // Set empty array to prevent errors
        setJobs([]);
      }
    };

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchJobs();
  }, [isAuthenticated, navigate]);

  const handleJobChange = (event) => {
    const jobId = event.target.value;
    setSelectedJob(jobId);
    if (jobId) {
      const selectedJobData = jobs.find(job => job.id === jobId);
      setJobDescription(selectedJobData?.description || '');
    } else {
      setJobDescription('');
    }
  };

  const handleDescriptionTypeChange = (event) => {
    const type = event.target.value;
    setDescriptionType(type);
    
    // Clear previous results when switching input types
    setResults([]);
    setSelectedRows([]);
    setError('');
    setSuccessMessage('');
    
    if (type === 'job' && selectedJob) {
      const selectedJobData = jobs.find(job => job.id === selectedJob);
      setJobDescription(selectedJobData?.description || '');
    } else if (type === 'custom') {
      setJobDescription('');
    }
  };

  const handleExtractSkills = async () => {
    if (!jobDescription) {
      setError('Please enter a job description first');
      return;
    }

    setIsExtracting(true);
    try {
      const data = await extractSkills(jobDescription);
      setExtractedSkills(data.skills);
      setShowSkillsEditor(true);
      setSuccessMessage(data.message);
    } catch (error) {
      setError(error.message || 'Failed to extract skills');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setExtractedSkills(prev => prev.filter(skill => skill !== skillToRemove));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !extractedSkills.includes(newSkill.trim())) {
      setExtractedSkills(prev => [...prev, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleAddSkill();
    }
  };

  const handleAnalyzeWithSkills = async () => {
    if (extractedSkills.length === 0) {
      setError('Please add at least one skill');
      return;
    }

    setLoading(true);
    try {
      // Create a job description with the selected skills
      const skillsDescription = `Required skills: ${extractedSkills.join(', ')}`;
      const data = await analyzeResumes(skillsDescription, matchThreshold);
      
      if (!data) {
        throw new Error('No response from server');
      }
      
      const cappedResults = data.results.map(resume => ({
        ...resume,
        match_percentage: Math.min(100, resume.match_percentage)
      }));
      
      setResults(cappedResults);
      setSuccessMessage(`Found ${cappedResults.length} matching resumes`);
      
      // Reset page when new results come in
      setPage(0);
      setSelectedRows([]);
      setShowSkillsEditor(false);
    } catch (error) {
      console.error('Error analyzing resumes:', error);
      setError(error.message || 'Failed to analyze resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter a job description');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');
    setResults([]);

    try {
      // Check authentication first
      if (!isAuthenticated) {
        throw new Error('Please log in to analyze resumes');
      }

      const data = await analyzeResumes(jobDescription, matchThreshold);
      
      if (!data) {
        throw new Error('No response from server');
      }
      
      // Cap match percentage at 100%
      const cappedResults = data.results.map(resume => ({
        ...resume,
        match_percentage: Math.min(100, resume.match_percentage)
      }));
      
      setResults(cappedResults);
      setSuccessMessage(`Found ${cappedResults.length} matching resumes`);
      
      // Reset page when new results come in
      setPage(0);
      setSelectedRows([]);
    } catch (error) {
      console.error('Error analyzing resumes:', error);
      if (error.message === 'Failed to fetch') {
        setError('Unable to connect to server. Please check if the server is running.');
      } else {
        setError(error.message || 'Failed to analyze resumes');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewResume = (resume) => {
    // Convert skills string to array if it's a string
    const allSkills = typeof resume.skills === 'string' 
      ? resume.skills.split(',').map(skill => skill.trim()).filter(Boolean)
      : resume.skills || [];

    setSelectedResume({
      ...resume,
      skills: allSkills
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedResume(null);
  };

  const handleCloseSnackbar = () => {
    setError('');
    setSuccessMessage('');
  };

  const handleExport = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Match %', 'Matched Skills', 'Required Skills', 'All Skills'],
      ...results.map((resume) => [
        resume.name,
        resume.email,
        resume.phone_number,
        resume.match_percentage,
        resume.matched_skills.join('; '),
        resume.required_skills.join('; '),
        typeof resume.skills === 'string' 
          ? resume.skills.split(',').map(skill => skill.trim()).filter(Boolean).join('; ')
          : (resume.skills || []).join('; ')
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ats_resume_matches_${new Date().toISOString().slice(0, 19).replace(/[:]/g, '_')}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleSelectRow = (resumeId) => {
    setSelectedRows(prev => {
      if (prev.includes(resumeId)) {
        return prev.filter(id => id !== resumeId);
      }
      return [...prev, resumeId];
    });
  };

  const handleSelectAllRows = (event) => {
    if (event.target.checked) {
      setSelectedRows(results.map(resume => resume.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleExportSelected = () => {
    const selectedResumes = results.filter(resume => selectedRows.includes(resume.id));
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Match %', 'Required Skills', 'Matched Skills', 'Additional Skills'],
      ...selectedResumes.map((resume) => {
        const additionalSkills = (resume.skills || [])
          .filter(skill => !resume.matched_skills.includes(skill));
        
        return [
          resume.name,
          resume.email,
          resume.phone_number,
          resume.match_percentage,
          resume.required_skills.join('; '),
          resume.matched_skills.join('; '),
          additionalSkills.join('; ')
        ];
      }),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `selected_resumes_${new Date().toISOString().slice(0, 19).replace(/[:]/g, '_')}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f6f9fc 0%, #eef2f7 100%)',
        pt: 4,
        pb: 4
      }}
    >
      <Container maxWidth="lg">
        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!successMessage}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
            {successMessage}
          </Alert>
        </Snackbar>

        <StyledPaper 
          sx={{ 
            mb: 3,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fc 100%)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" color="primary">
              ATS Resume Analyzer
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ 
            backgroundColor: 'primary.main', 
            color: 'white',
            padding: '8px 16px',
            borderRadius: 2,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: 1}}>
              Total Resumes: {totalResumes}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <RadioGroup
              row
              value={descriptionType}
              onChange={handleDescriptionTypeChange}
              sx={{ 
                mb: 2,
                '& .MuiFormControlLabel-root': {
                  transition: 'all 0.2s ease-in-out',
                  '&.Mui-checked': {
                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                  },
                },
              }}
            >
              <FormControlLabel 
                value="custom" 
                control={
                  <Radio 
                    sx={{
                      '&.Mui-checked': {
                        color: '#000000',
                        '& .MuiSvgIcon-root': {
                          transform: 'scale(1.1)',
                        },
                      },
                    }}
                  />
                } 
                label="Custom Description" 
                sx={{
                  borderRadius: '4px',
                  padding: '4px 8px',
                  '&.Mui-checked': {
                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                    '& .MuiFormControlLabel-label': {
                      color: '#000000',
                      fontWeight: 500,
                    },
                  },
                }}
              />
              <FormControlLabel 
                value="job" 
                control={
                  <Radio 
                    sx={{
                      '&.Mui-checked': {
                        color: '#000000',
                        '& .MuiSvgIcon-root': {
                          transform: 'scale(1.1)',
                        },
                      },
                    }}
                  />
                } 
                label="Job Description" 
                sx={{
                  borderRadius: '4px',
                  padding: '4px 8px',
                  '&.Mui-checked': {
                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                    '& .MuiFormControlLabel-label': {
                      color: '#000000',
                      fontWeight: 500,
                    },
                  },
                }}
              />
            </RadioGroup>

            {descriptionType === 'custom' ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <StyledTextField
                  fullWidth
                  multiline
                  rows={8}
                  label="Job Description"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  disabled={loading}
                />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <StyledFormControl fullWidth>
                  <InputLabel 
                    sx={{ 
                      backgroundColor: '#ffffff',
                      px: 1,
                    }}
                  >
                    Select Job
                  </InputLabel>
                  <Select
                    value={selectedJob}
                    onChange={handleJobChange}
                    disabled={loading}
                    sx={{
                      '& .MuiSelect-select': {
                        padding: '12px 14px',
                        backgroundColor: '#ffffff',
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e0e0e0',
                        borderWidth: '1.5px',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#007bff',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#007bff',
                        borderWidth: '2px',
                      },
                    }}
                  >
                    {jobs.map((job) => (
                      <MenuItem 
                        key={job.id} 
                        value={job.id}
                        sx={{
                          padding: '8px 14px',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 123, 255, 0.04)',
                          },
                          '&.Mui-selected': {
                            backgroundColor: 'rgba(0, 123, 255, 0.08)',
                            '&:hover': {
                              backgroundColor: 'rgba(0, 123, 255, 0.12)',
                            },
                          },
                        }}
                      >
                        {job.title} - {job.company}
                      </MenuItem>
                    ))}
                  </Select>
                </StyledFormControl>
                {selectedJob && (
                  <StyledTextField
                    fullWidth
                    multiline
                    rows={8}
                    label="Job Description"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    disabled={loading}
                  />
                )}
              </Box>
            )}

            {showSkillsEditor && (
              <Box 
                sx={{ 
                  backgroundColor: '#ffffff',
                  borderRadius: 2,
                  p: 3,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fc 100%)'
                }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: 'primary.main',
                    fontWeight: 600
                  }}
                >
                  <AssessmentIcon /> Edit Required Skills
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  gap: 1, 
                  mb: 2,
                  alignItems: 'flex-start'
                }}>
                  <StyledTextField
                    fullWidth
                    label="Add New Skill"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                    placeholder="Type a skill and press Enter"
                    InputProps={{
                      endAdornment: (
                        <IconButton 
                          onClick={handleAddSkill}
                          color="primary"
                          disabled={loading || !newSkill.trim()}
                          size="small"
                          sx={{ mr: -1 }}
                        >
                          <AddIcon />
                        </IconButton>
                      ),
                    }}
                  />
                </Box>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  {extractedSkills.length} skills selected
                </Typography>
                <SkillsContainer>
                  {extractedSkills.map((skill) => (
                    <StyledChip
                      key={skill}
                      label={skill}
                      onDelete={() => handleRemoveSkill(skill)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                  {extractedSkills.length === 0 && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontStyle: 'italic'
                      }}
                    >
                      No skills added yet. Start typing to add skills.
                    </Typography>
                  )}
                </SkillsContainer>
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  justifyContent: 'flex-end',
                  mt: 3
                }}>
                  <Button
                    variant="outlined"
                    onClick={() => setShowSkillsEditor(false)}
                    disabled={loading}
                    startIcon={<DeleteIcon />}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleAnalyzeWithSkills}
                    disabled={loading || extractedSkills.length === 0}
                    startIcon={loading ? <CircularProgress size={20} /> : <AssessmentIcon />}
                  >
                    Analyze Resumes
                  </Button>
                </Box>
              </Box>
            )}

            {!showSkillsEditor && (
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Match Threshold</InputLabel>
                  <Select
                    value={matchThreshold}
                    onChange={(e) => setMatchThreshold(e.target.value)}
                    disabled={loading}
                  >
                    <MenuItem value={10}>10%</MenuItem>
                    <MenuItem value={20}>20%</MenuItem>
                    <MenuItem value={30}>30%</MenuItem>
                    <MenuItem value={40}>40%</MenuItem>
                    <MenuItem value={50}>50%</MenuItem>
                    <MenuItem value={60}>60%</MenuItem>
                    <MenuItem value={70}>70%</MenuItem>
                    <MenuItem value={80}>80%</MenuItem>
                    <MenuItem value={90}>90%</MenuItem>
                    <MenuItem value={100}>100%</MenuItem>
                  </Select>
                </FormControl>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleExtractSkills}
                    disabled={loading || isExtracting || !jobDescription}
                    startIcon={isExtracting ? <CircularProgress size={20} /> : <AssessmentIcon />}
                  >
                    Extract Skills
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleAnalyze}
                    disabled={loading || !jobDescription}
                    startIcon={loading ? <CircularProgress size={20} /> : <AssessmentIcon />}
                  >
                    Analyze Resumes
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </StyledPaper>

        {loading && (
          <Box sx={{ 
            width: '100%', 
            mb: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}>
            <CircularProgress 
              size={60}
              thickness={4}
              sx={{
                color: 'primary.main',
                animationDuration: '1.5s',
                '& .MuiCircularProgress-circle': {
                  strokeLinecap: 'round',
                },
              }}
            />
            <Typography variant="body1" color="text.secondary">
              Analyzing resumes...
            </Typography>
          </Box>
        )}

        {results.length > 0 && (
          <StyledTableContainer 
            component={Paper} 
            sx={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fc 100%)',
              '& .MuiTableHead-root': {
                background: 'linear-gradient(135deg, #f8f9fc 0%, #f1f4f9 100%)',
              },
              '& .MuiTableRow-root:nth-of-type(even)': {
                background: 'rgba(248, 249, 252, 0.5)',
              },
              '& .MuiTableRow-root:hover': {
                background: 'rgba(241, 244, 249, 0.8)',
              }
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedRows.length > 0 && selectedRows.length < results.length}
                      checked={results.length > 0 && selectedRows.length === results.length}
                      onChange={handleSelectAllRows}
                    />
                  </StyledTableCell>
                  <StyledTableCell>Name</StyledTableCell>
                  <StyledTableCell>Email</StyledTableCell>
                  <StyledTableCell>Phone</StyledTableCell>
                  <StyledTableCell>Match %</StyledTableCell>
                  <StyledTableCell>Actions</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(rowsPerPage > 0
                  ? results.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  : results
                ).map((resume) => (
                  <StyledTableRow key={resume.id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedRows.includes(resume.id)}
                        onChange={() => handleSelectRow(resume.id)}
                      />
                    </TableCell>
                    <TableCell>{resume.name}</TableCell>
                    <TableCell>{resume.email}</TableCell>
                    <TableCell>{resume.phone_number}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress
                          variant="determinate"
                          value={Math.min(100, resume.match_percentage)}
                          size={24}
                          thickness={5}
                          sx={{
                            color: theme => {
                              const percentage = Math.min(100, resume.match_percentage);
                              if (percentage >= 80) return theme.palette.success.main;
                              if (percentage >= 60) return theme.palette.warning.main;
                              return theme.palette.error.main;
                            }
                          }}
                        />
                        <Typography variant="body2">
                          {Math.min(100, resume.match_percentage)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleViewResume(resume)}
                        startIcon={<AssessmentIcon />}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={results.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </StyledTableContainer>
        )}

        {selectedRows.length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleExportSelected}
              startIcon={<DownloadIcon />}
            >
              Export Selected ({selectedRows.length})
            </Button>
          </Box>
        )}

        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fc 100%)',
              borderRadius: 2,
            }
          }}
        >
          <DialogTitle 
            sx={{ 
              background: 'linear-gradient(135deg, #f8f9fc 0%, #f1f4f9 100%)',
              borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssessmentIcon color="primary" />
              <Typography variant="h6">
                Resume Details - {selectedResume?.name}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Paper 
                  sx={{ 
                    p: 2, 
                    mb: 2,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fc 100%)',
                  }}
                >
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Box 
                        sx={{ 
                          p: 2, 
                          borderRadius: 2, 
                          background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                          border: '1px solid',
                          borderColor: 'primary.main',
                        }}
                      >
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            color: 'primary.dark',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 1
                          }}
                        >
                          <AssessmentIcon /> Required Skills
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                          {(selectedResume?.required_skills || []).map((skill, index) => (
                            <StyledChip
                              key={index}
                              label={skill}
                              color="primary"
                              sx={{
                                bgcolor: 'primary.main',
                                color: 'white',
                                fontWeight: 500,
                                '& .MuiChip-deleteIcon': {
                                  color: 'white',
                                }
                              }}
                              size="small"
                            />
                          ))}
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box 
                        sx={{ 
                          p: 2, 
                          borderRadius: 2, 
                          background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                          border: '1px solid',
                          borderColor: 'success.main',
                        }}
                      >
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            color: 'success.dark',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 1
                          }}
                        >
                          <CheckCircleIcon /> Matched Skills
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                          {(selectedResume?.matched_skills || []).map((skill, index) => (
                            <StyledChip
                              key={index}
                              label={skill}
                              color="success"
                              sx={{
                                bgcolor: 'success.main',
                                color: 'white',
                                fontWeight: 500,
                                '& .MuiChip-deleteIcon': {
                                  color: 'white',
                                }
                              }}
                              size="small"
                            />
                          ))}
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box 
                        sx={{ 
                          p: 2, 
                          borderRadius: 2, 
                          background: 'linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%)',
                          border: '1px solid',
                          borderColor: 'grey.300',
                        }}
                      >
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            color: 'text.primary',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 1
                          }}
                        >
                          <AddCircleOutlineIcon /> Additional Skills
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                          {(selectedResume?.skills || [])
                            .filter(skill => !selectedResume?.matched_skills?.includes(skill))
                            .map((skill, index) => (
                              <StyledChip
                                key={index}
                                label={skill}
                                sx={{
                                  bgcolor: 'grey.300',
                                  color: 'text.primary',
                                  fontWeight: 500,
                                  '&:hover': {
                                    bgcolor: 'grey.200',
                                  },
                                }}
                                size="small"
                              />
                            ))}
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions 
            sx={{ 
              borderTop: '1px solid rgba(0, 0, 0, 0.1)',
              background: 'linear-gradient(135deg, #f8f9fc 0%, #f1f4f9 100%)',
              p: 2
            }}
          >
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
      </Container>
    </Box>
  );
};

export default ATSScore;