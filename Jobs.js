import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Alert,
  Snackbar,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Work as WorkIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Description as DescriptionIcon,
  Business as BusinessIcon,
  Share as ShareIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';
import NoData from '../components/NoData';
import { getJobs, createJob, updateJob, deleteJob, getJobByUrl, applyForJob } from '../services/api';
import { Link } from 'react-router-dom';

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

const StyledDescription = styled(Typography)(({ theme }) => ({
  maxWidth: '300px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: theme.palette.text.secondary,
}));

const StyledStatusChip = styled(Chip)(({ theme, status }) => {
  const getStatusColor = () => {
    switch (status?.toLowerCase()) {
      case 'open':
        return '#4caf50';
      case 'closed':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  return {
    backgroundColor: getStatusColor(),
    color: '#fff',
    fontWeight: 500,
    fontSize: '0.75rem',
    textTransform: 'capitalize',
  };
});

const DetailChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  fontWeight: 500,
}));

const StyledJobTitle = styled(Link)(({ theme }) => ({
  color: theme.palette.primary.main,
  textDecoration: 'none',
  fontWeight: 500,
  '&:hover': {
    textDecoration: 'underline',
  },
}));

const ShareButton = styled(IconButton)(({ theme }) => ({
  transition: 'all 0.3s ease',
  padding: theme.spacing(1),
  '&:hover': {
    transform: 'scale(1.1)',
    color: theme.palette.primary.main,
  },
}));

const ShareLink = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1),
  backgroundColor: 'rgba(0, 0, 0, 0.04)',
  borderRadius: theme.spacing(1),
  '& .MuiTypography-root': {
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
}));

const Jobs = () => {
  const theme = useTheme();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [applicationData, setApplicationData] = useState({
    email: '',
    name: '',
    phone_number: '',
    linkedin_link: '',
    expected_pay: '',
    city: '',
    resume: null,
  });
  const [jobFormData, setJobFormData] = useState({
    title: '',
    location: '',
    bill_rate: '',
    visas: '',
    description: '',
    client: '',
    status: 'open',
  });
  const [status, setStatus] = useState('');
  const [openApplyDialog, setOpenApplyDialog] = useState(false);
  const [selectedJobUrl, setSelectedJobUrl] = useState('');
  const [applicationFormData, setApplicationFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    country: '',
    visa: '',
    pay_rate: '',
    notes: '',
  });
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedShareableLink, setSelectedShareableLink] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    const filtered = jobs.filter(
      (job) =>
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.client?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredJobs(filtered);
  }, [searchTerm, jobs]);

  const fetchJobs = async () => {
    try {
      const data = await getJobs();
      setJobs(data);
      setFilteredJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to fetch jobs. Please try again later.');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (job = null) => {
    if (job) {
      setSelectedJob(job);
      setJobFormData({
        ...job,
        status: job.status || 'open',
      });
    } else {
      setSelectedJob(null);
      setJobFormData({
        title: '',
        location: '',
        bill_rate: '',
        visas: '',
        description: '',
        client: '',
        status: 'open',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedJob(null);
    setError('');
  };

  const handleInputChange = (e) => {
    setJobFormData({
      ...jobFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setApplicationData({
      ...applicationData,
      resume: e.target.files[0],
    });
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!jobFormData.title) {
        setError('Job Title is required');
        return;
      }

      // Ensure status is set and valid
      const jobData = {
        ...jobFormData,
        status: jobFormData.status || 'open'
      };

      let response;
      if (selectedJob) {
        try {
          response = await updateJob(selectedJob.id, jobData);
          setSuccessMessage('Job updated successfully');
        } catch (error) {
          console.error('Error updating job:', error);
          setError(error.response?.data?.error || 'Failed to update job. Please try again.');
          return;
        }
      } else {
        try {
          response = await createJob(jobData);
          setSuccessMessage('Job added successfully');
        } catch (error) {
          console.error('Error creating job:', error);
          setError(error.response?.data?.error || 'Failed to create job. Please try again.');
          return;
        }
      }

      handleCloseDialog();
      await fetchJobs();
    } catch (error) {
      console.error('Error saving job:', error);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await deleteJob(id);
        setSuccessMessage('Job deleted successfully');
        await fetchJobs();
      } catch (error) {
        console.error('Error deleting job:', error);
        setError('Failed to delete job');
      }
    }
  };

  const handleCloseSnackbar = () => {
    setError('');
    setSuccessMessage('');
  };

  const handleOpenDetailDialog = (job) => {
    setSelectedJob(job);
    setOpenDetailDialog(true);
  };

  const handleCloseDetailDialog = () => {
    setSelectedJob(null);
    setOpenDetailDialog(false);
  };

  const handleJobClick = (job) => {
    setSelectedJobUrl(job.url);
    setOpenApplyDialog(true);
  };

  const handleApplySubmit = async () => {
    try {
      await applyForJob(selectedJobUrl, applicationFormData);
      setSuccessMessage('Application submitted successfully');
      setOpenApplyDialog(false);
      setApplicationFormData({
        name: '',
        email: '',
        phone: '',
        city: '',
        state: '',
        country: '',
        visa: '',
        pay_rate: '',
        notes: '',
      });
    } catch (error) {
      setError('Failed to submit application. Please try again.');
    }
  };

  const handleShareClick = (job) => {
    setSelectedShareableLink(`${window.location.origin}/jobs/share/${job.shareable_link}`);
    setShareDialogOpen(true);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(selectedShareableLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  // Render method for job details
  const renderJobDetails = () => {
    if (!selectedJob) return null;

    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <WorkIcon sx={{ mr: 2, color: theme.palette.primary.main }} />
              <Typography variant="h6">{selectedJob.title}</Typography>
            </Box>
            
            {selectedJob.location && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationIcon sx={{ mr: 2, color: theme.palette.primary.main }} />
                <Typography>{selectedJob.location}</Typography>
              </Box>
            )}
            
            {selectedJob.bill_rate && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MoneyIcon sx={{ mr: 2, color: theme.palette.primary.main }} />
                <Typography>{selectedJob.bill_rate}</Typography>
              </Box>
            )}
            
            {selectedJob.client && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BusinessIcon sx={{ mr: 2, color: theme.palette.primary.main }} />
                <Typography>{selectedJob.client}</Typography>
              </Box>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 2 }}>Additional Information</Typography>
            <Box>
              <DetailChip 
                icon={<WorkIcon />} 
                label={`Job ID: ${selectedJob.id}`} 
                variant="outlined" 
              />
              <DetailChip 
                icon={<WorkIcon />} 
                label={`Status: ${selectedJob.status || 'Open'}`} 
                variant="outlined" 
                color={selectedJob.status === 'closed' ? 'error' : 'primary'}
              />
              {selectedJob.visas && (
                <DetailChip 
                  icon={<WorkIcon />} 
                  label={`Visas: ${selectedJob.visas}`} 
                  variant="outlined" 
                />
              )}
            </Box>
          </Grid>
          
          {selectedJob.description && (
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>Job Description</Typography>
              <Box sx={{ 
                p: 2, 
                backgroundColor: 'rgba(0,0,0,0.05)', 
                borderRadius: 2 
              }}>
                <Typography variant="body1">{selectedJob.description}</Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
    );
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

      <SearchBox>
        <StyledTextField
          label="Search Jobs"
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
          onClick={() => handleOpenDialog()}
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
          Add Job
        </Button>
      </SearchBox>

      {jobs.length === 0 ? (
        <NoData type="jobs" />
      ) : (
        <StyledTableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Job Title</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Bill Rate</TableCell>
                <TableCell>Visas</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Share</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredJobs
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((job) => (
                  <StyledTableRow key={job.id}>
                    <TableCell>
                      <TableCell>
                        {job.title}
                      </TableCell>
                    </TableCell>
                    <TableCell>{job.location}</TableCell>
                    <TableCell>{job.bill_rate}</TableCell>
                    <TableCell>{job.visas}</TableCell>
                    <TableCell>
                      <StyledDescription>{job.description}</StyledDescription>
                    </TableCell>
                    <TableCell>{job.client}</TableCell>
                    <TableCell>
                      <StyledStatusChip 
                        label={job.status || 'open'} 
                        status={job.status || 'open'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <ShareButton
                        onClick={() => handleShareClick(job)}
                        sx={{ color: theme.palette.primary.main }}
                      >
                        <ShareIcon />
                      </ShareButton>
                    </TableCell>
                    <TableCell align="right">
                      <ActionButton
                        onClick={() => handleOpenDetailDialog(job)}
                        sx={{ color: theme.palette.info.main }}
                      >
                        <ViewIcon />
                      </ActionButton>
                      <ActionButton
                        onClick={() => handleOpenDialog(job)}
                        sx={{ color: theme.palette.primary.main }}
                      >
                        <EditIcon />
                      </ActionButton>
                      <ActionButton
                        onClick={() => handleDelete(job.id)}
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
            count={filteredJobs.length}
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
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        <DialogTitle>
          {selectedJob ? 'Edit Job' : 'Add New Job'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              name="title"
              label="Job Title"
              value={jobFormData.title}
              onChange={handleInputChange}
              required
              error={!jobFormData.title}
              helperText={!jobFormData.title ? 'Job Title is required' : ''}
              fullWidth
            />
            <TextField
              name="location"
              label="Location"
              value={jobFormData.location}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="bill_rate"
              label="Bill Rate"
              value={jobFormData.bill_rate}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="visas"
              label="Visas"
              value={jobFormData.visas}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="description"
              label="Description"
              value={jobFormData.description}
              onChange={handleInputChange}
              multiline
              rows={4}
              fullWidth
            />
            <TextField
              name="client"
              label="Client"
              value={jobFormData.client}
              onChange={handleInputChange}
              fullWidth
            />
            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={jobFormData.status || 'open'}
                onChange={handleInputChange}
                label="Status"
                name="status"
              >
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedJob ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={openDetailDialog} 
        onClose={handleCloseDetailDialog} 
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
          Job Details
        </DialogTitle>
        <DialogContent dividers>
          {renderJobDetails()}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openApplyDialog}
        onClose={() => setOpenApplyDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Apply for {selectedJob?.title}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Full Name"
              value={applicationFormData.name}
              onChange={(e) => setApplicationFormData({ ...applicationFormData, name: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={applicationFormData.email}
              onChange={(e) => setApplicationFormData({ ...applicationFormData, email: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Phone"
              value={applicationFormData.phone}
              onChange={(e) => setApplicationFormData({ ...applicationFormData, phone: e.target.value })}
              fullWidth
            />
            <TextField
              label="City"
              value={applicationFormData.city}
              onChange={(e) => setApplicationFormData({ ...applicationFormData, city: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="State"
              value={applicationFormData.state}
              onChange={(e) => setApplicationFormData({ ...applicationFormData, state: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Country"
              value={applicationFormData.country}
              onChange={(e) => setApplicationFormData({ ...applicationFormData, country: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Visa Status"
              value={applicationFormData.visa}
              onChange={(e) => setApplicationFormData({ ...applicationFormData, visa: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Expected Pay Rate"
              value={applicationFormData.pay_rate}
              onChange={(e) => setApplicationFormData({ ...applicationFormData, pay_rate: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Additional Notes"
              value={applicationFormData.notes}
              onChange={(e) => setApplicationFormData({ ...applicationFormData, notes: e.target.value })}
              multiline
              rows={4}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenApplyDialog(false)}>Cancel</Button>
          <Button onClick={handleApplySubmit} variant="contained" color="primary">
            Submit Application
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Share Job Link</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Share this link on social media or with candidates:
            </Typography>
            <ShareLink>
              <Typography variant="body2">{selectedShareableLink}</Typography>
              <IconButton
                onClick={handleCopyLink}
                size="small"
                sx={{ color: copySuccess ? 'success.main' : 'primary.main' }}
              >
                <CopyIcon />
              </IconButton>
            </ShareLink>
            {copySuccess && (
              <Typography
                variant="caption"
                color="success.main"
                sx={{ display: 'block', mt: 1 }}
              >
                Link copied to clipboard!
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Jobs; 