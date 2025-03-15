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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  MenuItem,
  TablePagination,
  RadioGroup,
  Radio,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';
import NoData from '../components/NoData';
import { getSubmissions, createSubmission, updateSubmission, deleteSubmission, getJobs, getRecruiters } from '../services/api';

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

const ActionButton = styled(IconButton)(({ theme }) => ({
  transition: 'all 0.3s ease',
  padding: theme.spacing(1),
  '&:hover': {
    transform: 'scale(1.1)',
  },
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
    status === 'Submitted' ? 'rgba(149, 165, 166, 0.1)' :
    'rgba(189, 195, 199, 0.1)',
  color:
    status === 'Hired' ? '#27ae60' :
    status === 'Rejected' ? '#c0392b' :
    status === 'Shortlisted' ? '#2980b9' :
    status === 'In Review' ? '#f39c12' :
    status === 'Submitted' ? '#7f8c8d' :
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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadMode, setUploadMode] = useState('select');
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const getJobTitle = useCallback((jobId) => {
    if (!jobId) return '';
    const job = jobs.find(j => j.id === jobId);
    return job?.title || '';
  }, [jobs]);

  const getRecruiterName = useCallback((recruiterId) => {
    if (!recruiterId) return '';
    const recruiter = recruiters.find(r => r.id === recruiterId);
    return recruiter?.name || '';
  }, [recruiters]);

  useEffect(() => {
    fetchSubmissions();
    fetchJobs();
    fetchRecruiters();
  }, []);

  useEffect(() => {
    const filtered = submissions.filter(
      (submission) => {
        const candidateName = submission?.candidate_name?.toLowerCase() || '';
        const candidateEmail = submission?.candidate_email?.toLowerCase() || '';
        const jobTitle = getJobTitle(submission?.job_id)?.toLowerCase() || '';
        const recruiterName = getRecruiterName(submission?.recruiter_id)?.toLowerCase() || '';
        const searchTermLower = searchTerm.toLowerCase();
        
        return candidateName.includes(searchTermLower) ||
               candidateEmail.includes(searchTermLower) ||
               jobTitle.includes(searchTermLower) ||
               recruiterName.includes(searchTermLower);
      }
    );
    setFilteredSubmissions(filtered);
    setPage(0);
  }, [searchTerm, submissions, jobs, recruiters, getJobTitle, getRecruiterName]);

  const fetchSubmissions = async () => {
    try {
      const data = await getSubmissions();
      setSubmissions(data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setError('Failed to load submissions');
    }
  };

  const fetchJobs = async () => {
    try {
      const data = await getJobs();
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchRecruiters = async () => {
    try {
      const data = await getRecruiters();
      setRecruiters(data);
    } catch (error) {
      console.error('Error fetching recruiters:', error);
    }
  };

  const fetchResumes = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/resumes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch resumes');
      const data = await response.json();
      setResumes(data);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      setError('Failed to fetch resumes');
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
        status: 'Submitted',
        notes: '',
      });
      setSearchEmail('');
      setSearchResults([]);
      setUploadedFileName('');
      setSelectedResume(null);
      fetchResumes();
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
        setSuccess('Submission updated successfully');
      } else {
        // For create, we use FormData
        submissionData.created_at = new Date().toISOString();
        submissionData.updated_at = new Date().toISOString();
        await createSubmission(submissionData);
        setSuccess('Submission added successfully');
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
      setSuccess('Submission deleted successfully');
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
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');
    setUploadedFileName(file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('job_id', formData.job_id);

      const response = await fetch('http://localhost:5000/api/submissions', {
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
      
      if (data.submission && data.resume) {
        // Update form data with extracted information
        setFormData(prev => ({
          ...prev,
          candidate_name: data.resume.name || '',
          candidate_email: data.resume.email || '',
          candidate_phone: data.resume.phone_number || '',
          candidate_city: data.resume.location?.split(',')[0]?.trim() || '',
          candidate_state: data.resume.location?.split(',')[1]?.trim() || '',
          candidate_country: data.resume.location?.split(',')[2]?.trim() || '',
          current_job: data.resume.current_job || '',
          skills: data.resume.skills || [],
          status: 'Submitted',
          resume_id: data.resume.id
        }));
        
        setSuccess('Resume processed and details extracted successfully');
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
      setSuccess('Candidate details loaded from database');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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

      <SearchBox>
        <StyledTextField
          label="Search Submissions"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
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
          Add Submission
        </Button>
      </SearchBox>

      {submissions.length === 0 ? (
        <NoData type="submissions" />
      ) : (
        <StyledTableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Job</TableCell>
                <TableCell>Candidate Name</TableCell>
                <TableCell>Candidate Email</TableCell>
                <TableCell>Recruiter</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Visa</TableCell>
                <TableCell>Pay Rate</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSubmissions
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((submission) => (
                <StyledTableRow key={submission._id}>
                  <TableCell>{getJobTitle(submission.job_id)}</TableCell>
                  <TableCell>{submission.candidate_name}</TableCell>
                  <TableCell>{submission.candidate_email}</TableCell>
                  <TableCell>{getRecruiterName(submission.recruiter_id)}</TableCell>
                  <TableCell>{`${submission.candidate_city}, ${submission.candidate_state}`}</TableCell>
                  <TableCell>{submission.visa}</TableCell>
                  <TableCell>{submission.pay_rate}</TableCell>
                  <TableCell>
                    <StyledStatus status={submission.status}>
                      {submission.status}
                    </StyledStatus>
                  </TableCell>
                  <TableCell align="right">
                    <ActionButton
                      onClick={() => handleOpen(submission)}
                      sx={{ color: theme.palette.primary.main }}
                    >
                      <EditIcon />
                    </ActionButton>
                    <ActionButton
                      onClick={() => handleDelete(submission._id)}
                      sx={{ color: theme.palette.error.main }}
                    >
                      <DeleteIcon />
                    </ActionButton>
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

      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        <DialogTitle>
          {editMode ? 'Edit Submission' : 'Add New Submission'}
        </DialogTitle>
        <DialogContent>
        <StyledTextField
              label="Search by Email"
              name="searchEmail"
              value={searchEmail}
              onChange={(e) => handleEmailSearch(e.target.value)}
              fullWidth
              margin="normal"
              helperText="Enter candidate email to auto-fill details"
            />
          <Box component="form" sx={{ 
            mt: 2,
            display: 'grid',
            gap: 2,
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
              required
              fullWidth
              error={!formData.recruiter_id}
              helperText={!formData.recruiter_id ? "Please select a recruiter" : ""}
            >
              {recruiters.map((recruiter) => (
                <MenuItem key={recruiter.id} value={recruiter.id}>
                  {recruiter.name}
                </MenuItem>
              ))}
            </StyledTextField>
            <StyledTextField
              label="Candidate Name"
              name="candidate_name"
              value={formData.candidate_name}
              onChange={handleChange}
              required
              fullWidth
            />
            <StyledTextField
              label="Candidate Email"
              name="candidate_email"
              value={formData.candidate_email}
              onChange={handleChange}
              required
              fullWidth
            />
            <StyledTextField
              label="Candidate Phone"
              name="candidate_phone"
              value={formData.candidate_phone}
              onChange={handleChange}
              fullWidth
            />
            <StyledTextField
              label="Candidate City"
              name="candidate_city"
              value={formData.candidate_city}
              onChange={handleChange}
              required
              fullWidth
            />
            <StyledTextField
              label="Candidate State"
              name="candidate_state"
              value={formData.candidate_state}
              onChange={handleChange}
              required
              fullWidth
            />
            <StyledTextField
              label="Candidate Country"
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
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleClose}
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: 'none',
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
              },
            }}
          >
            {editMode ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Submissions; 