import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
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
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid,
  Checkbox,
  Chip,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { analyzeResumes, getJobs } from '../services/api';

const StyledChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(231, 235, 240, 0.8)',
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

const ATSScore = () => {
  const { token, isAuthenticated, navigate } = useAuth();
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

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchJobs();
  }, [isAuthenticated, navigate]);

  const fetchJobs = useCallback(async () => {
    try {
      const data = await getJobs();
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to fetch jobs');
    }
  }, [setJobs, setError]);

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
    if (type === 'job' && selectedJob) {
      const selectedJobData = jobs.find(job => job.id === selectedJob);
      setJobDescription(selectedJobData?.description || '');
    } else if (type === 'custom') {
      setJobDescription('');
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
      
      setResults(data.results || []);
      if (data.message) {
        setSuccessMessage(data.message);
      }
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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

      <StyledPaper sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom color="primary" sx={{ mb: 3 }}>
          ATS Resume Analyzer
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <RadioGroup
            row
            value={descriptionType}
            onChange={handleDescriptionTypeChange}
            sx={{ mb: 2 }}
          >
            <FormControlLabel 
              value="custom" 
              control={<Radio color="primary" />} 
              label="Custom Description" 
            />
            <FormControlLabel 
              value="job" 
              control={<Radio color="primary" />} 
              label="Job Description" 
            />
          </RadioGroup>

          {descriptionType === 'job' && (
            <>
              <StyledFormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Job</InputLabel>
                <Select
                  value={selectedJob}
                  onChange={handleJobChange}
                  label="Select Job"
                >
                  {jobs.map((job) => (
                    <MenuItem key={job.id} value={job.id}>
                      {job.title} - {job.company}
                    </MenuItem>
                  ))}
                </Select>
              </StyledFormControl>
              <StyledTextField
                fullWidth
                multiline
                rows={6}
                label="Job Description"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Job description will appear here..."
                disabled={!selectedJob}
              />
            </>
          )}

          {descriptionType === 'custom' && (
            <StyledTextField
              fullWidth
              multiline
              rows={6}
              label="Job Description"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Enter the job description here..."
            />
          )}

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Typography>Match Threshold:</Typography>
            <StyledTextField
              type="number"
              value={matchThreshold}
              onChange={(e) => setMatchThreshold(Number(e.target.value))}
              inputProps={{ min: 0, max: 100 }}
              sx={{ width: 100 }}
            />
            <Typography>%</Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <ActionButton
              variant="contained"
              color="primary"
              onClick={handleAnalyze}
              disabled={loading || (!jobDescription && descriptionType === 'custom') || (!selectedJob && descriptionType === 'job')}
              startIcon={<AssessmentIcon />}
            >
              Analyze Resumes
            </ActionButton>
            {results.length > 0 && (
              <ActionButton
                variant="outlined"
                color="primary"
                onClick={handleExport}
                startIcon={<DownloadIcon />}
              >
                Export Results
              </ActionButton>
            )}
          </Box>
        </Box>
      </StyledPaper>

      {loading && (
        <Box sx={{ width: '100%', mb: 3 }}>
          <ProgressBar />
        </Box>
      )}

      {results.length > 0 && (
        <StyledTableContainer component={Paper}>
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
                        value={resume.match_percentage}
                        size={24}
                        thickness={5}
                        sx={{
                          color: theme => {
                            if (resume.match_percentage >= 80) return theme.palette.success.main;
                            if (resume.match_percentage >= 60) return theme.palette.warning.main;
                            return theme.palette.error.main;
                          }
                        }}
                      />
                      <Typography variant="body2">
                        {resume.match_percentage}%
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
      >
        <DialogTitle>
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
              <Paper sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="textSecondary">Contact Information</Typography>
                    <Typography variant="body1">
                      <strong>Email:</strong> {selectedResume?.email}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Phone:</strong> {selectedResume?.phone_number}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="textSecondary">Job Category</Typography>
                    <Chip
                      label={selectedResume?.category || 'N/A'}
                      color="primary"
                      sx={{ mt: 1 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="textSecondary">Match Analysis</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <CircularProgress
                        variant="determinate"
                        value={selectedResume?.match_percentage || 0}
                        size={40}
                        thickness={4}
                        sx={{
                          color: theme => {
                            const score = selectedResume?.match_percentage || 0;
                            if (score >= 80) return theme.palette.success.main;
                            if (score >= 60) return theme.palette.warning.main;
                            return theme.palette.error.main;
                          }
                        }}
                      />
                      <Box>
                        <Typography variant="h6" color="primary">
                          {selectedResume?.match_percentage}%
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Match Score
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Skills Analysis
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" color="primary">Required Skills</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                      {(selectedResume?.required_skills || []).map((skill, index) => (
                        <StyledChip
                          key={index}
                          label={skill}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" color="success.main">Matched Skills</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                      {(selectedResume?.matched_skills || []).map((skill, index) => (
                        <StyledChip
                          key={index}
                          label={skill}
                          color="success"
                          variant="outlined"
                          size="small"
                        />
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">Additional Skills</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                      {(selectedResume?.skills || [])
                        .filter(skill => !selectedResume?.matched_skills?.includes(skill))
                        .map((skill, index) => (
                          <StyledChip
                            key={index}
                            label={skill}
                            color="default"
                            variant="outlined"
                            size="small"
                          />
                        ))}
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ATSScore;