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
} from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';
import NoData from '../components/NoData';
import { getJobs, createJob, updateJob, deleteJob } from '../services/api';

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
                <TableCell>Job ID</TableCell>
                <TableCell>Job Title</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Bill Rate</TableCell>
                <TableCell>Visas</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredJobs
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((job) => (
                  <StyledTableRow key={job.id}>
                    <TableCell sx={{ color: 'text.secondary' }}>{job.id}</TableCell>
                    <TableCell sx={{ fontWeight: 500, color: '#333' }}>{job.title}</TableCell>
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

      {/* Job Details Dialog */}
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
    </Container>
  );
};

export default Jobs; 