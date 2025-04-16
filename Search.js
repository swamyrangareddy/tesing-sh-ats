import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  Tooltip,
  Grid,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Email as EmailIcon,
  Work as WorkIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useResumeCount } from '../contexts/ResumeCountContext';
import { styled } from '@mui/material/styles';

// Styled Components
const SearchBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  backdropFilter: 'blur(10px)',
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  border: '1px solid rgba(231, 235, 240, 0.8)',
  background: '#ffffff',
  overflowX: 'auto',
  '& .MuiTable-root': {
    borderCollapse: 'separate',
    borderSpacing: '0 8px',
    minWidth: 1000,
  },
  '& .MuiTableHead-root': {
    '& .MuiTableRow-root': {
      backgroundColor: '#F5F7FA',
    },
    '& .MuiTableCell-root': {
      borderBottom: 'none',
      fontWeight: 600,
      color: '#333',
      padding: theme.spacing(0.5),
      whiteSpace: 'nowrap',
      backgroundColor: '#F5F7FA',
      '&:first-of-type': {
        borderTopLeftRadius: theme.spacing(1),
        borderBottomLeftRadius: theme.spacing(1),
      },
      '&:last-of-type': {
        borderTopRightRadius: theme.spacing(1),
        borderBottomRightRadius: theme.spacing(1),
      },
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

const StyledChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
}));

const StyledSkillsBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(0.5),
  maxHeight: '80px',
  overflowY: 'auto',
  padding: theme.spacing(0.5),
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(0, 0, 0, 0.05)',
    borderRadius: '3px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(0, 0, 0, 0.15)',
    borderRadius: '3px',
    '&:hover': {
      background: 'rgba(0, 0, 0, 0.25)',
    },
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  height: '100px',
  verticalAlign: 'top',
  '& .skills-container': {
    height: '80px',
    position: 'relative',
  },
}));

const Search = () => {
  const navigate = useNavigate();
  const { token, logout, isAuthenticated } = useAuth();
  const { totalResumes } = useResumeCount();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('skills');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedResume, setSelectedResume] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDownloadDialog, setOpenDownloadDialog] = useState(false);
  const [downloadingResume, setDownloadingResume] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const lastModifiedRef = useRef(null);

  const handleSearch = async () => {
    if (!isAuthenticated || !token) {
      navigate('/login');
      return;
    }

    if (!searchTerm.trim()) {
      setError('Please enter search terms');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);
    setHasSearched(true);

    try {
      const response = await fetch('http://localhost:5000/api/resumes/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          search_term: searchTerm.trim(),
          search_type: searchType,
        }),
      });

      if (response.status === 401) {
        logout();
        navigate('/login');
        return;
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to search resumes');
      }

      setResults(data.resumes || []);
      setPage(0);
    } catch (error) {
      console.error('Search error:', error);
      setError(error.message || 'Failed to search resumes');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleDownloadClick = (resume) => {
    setDownloadingResume(resume);
    setOpenDownloadDialog(true);
  };

  const handleDownload = async () => {
    if (!downloadingResume) return;

    try {
      setError('');
      
      if (!downloadingResume.id) {
        throw new Error('Invalid resume data');
      }

      const response = await fetch(`http://localhost:5000/api/resumes/${downloadingResume.id}/download`, {
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
    } catch (error) {
      console.error('Download error:', error);
      setError(error.message || 'Failed to download resume');
    } finally {
      setDownloadingResume(null);
    }
  };

  const handleCloseDownloadDialog = () => {
    setOpenDownloadDialog(false);
    setDownloadingResume(null);
  };

  const handleViewResume = (resume) => {
    setSelectedResume(resume);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedResume(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCloseSnackbar = () => {
    setError('');
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

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: '#333' }}>
          Resume Search
        </Typography>
        <Box sx={{ 
          backgroundColor: 'primary.main', 
          color: 'white',
          padding: '8px 16px',
          borderRadius: 2,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Typography variant="subtitle1">
            Total Resumes : {totalResumes}
          </Typography>
        </Box>
      </Box>

      <SearchBox>
        <Stack spacing={2}>
          <StyledFormControl fullWidth>
            <InputLabel>Search Type</InputLabel>
            <Select
              value={searchType}
              label="Search Type"
              onChange={(e) => {
                setSearchType(e.target.value);
                setHasSearched(false);
                setResults([]);
              }}
            >
              <MenuItem value="skills">Search by Skills</MenuItem>
              <MenuItem value="email">Search by Email(s)</MenuItem>
            </Select>
          </StyledFormControl>

          <StyledTextField
            label={searchType === 'skills' ? "Enter skills (comma-separated)" : "Enter email(s) (space-separated)"}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (hasSearched) {
                setHasSearched(false);
                setResults([]);
              }
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={searchType === 'skills' ? "e.g., React, Node.js, Python" : "e.g., email1@example.com email2@example.com"}
            fullWidth
            multiline={searchType === 'skills'}
            rows={searchType === 'skills' ? 2 : 1}
          />

          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            disabled={loading}
            startIcon={<SearchIcon />}
            sx={{
              borderRadius: 2,
              py: 1.5,
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
              },
            }}
          >
            {loading ? 'Searching...' : 'Search Resumes'}
          </Button>
        </Stack>
      </SearchBox>

      {loading && (
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress />
        </Box>
      )}

      {hasSearched && (
        <Paper sx={{ 
          p: 3, 
          borderRadius: 2, 
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          mt: 3,
          opacity: loading ? 0.7 : 1,
          transition: 'opacity 0.3s ease'
        }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#333' }}>
            Search Results {results.length > 0 ? `(${results.length})` : ''}
          </Typography>
          <StyledTableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width="20%">Name</TableCell>
                  <TableCell width="20%">Email</TableCell>
                  <TableCell width="20%">Skills</TableCell>
                  <TableCell width="10%" align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.length > 0 ? (
                  results
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((resume) => (
                      <StyledTableRow key={resume.id}>
                        <TableCell width="30%" sx={{ fontWeight: 500 }}>{resume.name || 'N/A'}</TableCell>
                        <TableCell width="30%">{resume.email || 'N/A'}</TableCell>
                        <TableCell width="40%">
                          <div className="skills-container">
                            {resume.skills ? (
                              <StyledSkillsBox>
                                {resume.skills.split(',').map((skill, index) => (
                                  <StyledChip
                                    key={index}
                                    label={skill.trim()}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                  />
                                ))}
                              </StyledSkillsBox>
                            ) : (
                              <Typography variant="body2" color="textSecondary">
                                No skills listed
                              </Typography>
                            )}
                          </div>
                        </TableCell>
                        <TableCell width="10%" align="center">
                          <Tooltip title="View Details">
                            <ActionButton
                              color="primary"
                              onClick={() => handleViewResume(resume)}
                            >
                              <VisibilityIcon />
                            </ActionButton>
                          </Tooltip>
                        </TableCell>
                      </StyledTableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <Typography variant="h6" color="textSecondary">
                        No matching resumes found
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        Try adjusting your search terms or search type
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </StyledTableContainer>
          {results.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={results.length}
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
          )}
        </Paper>
      )}

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
          Resume Details
        </DialogTitle>
        <DialogContent dividers>
          {selectedResume && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Personal Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmailIcon color="primary" />
                          <Typography>{selectedResume.email}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PhoneIcon color="primary" />
                          <Typography>{selectedResume.phone_number}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationIcon color="primary" />
                          <Typography>{selectedResume.location}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <WorkIcon color="primary" />
                          <Typography>{selectedResume.current_job}</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Skills
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedResume.skills?.split(',').map((skill, index) => (
                        <StyledChip
                          key={index}
                          label={skill.trim()}
                          color="primary"
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              

              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Experience
                    </Typography>
                    <hr />
                    {selectedResume.experience && Array.isArray(selectedResume.experience) ? (
                      selectedResume.experience.map((exp, index) => (
                        <Box key={index} sx={{ mb: 2 }}>
                          <Box  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 ,}}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {exp.role || exp.title} at {exp.company}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                bgcolor: 'primary.main',
                                color: 'white',
                                px: 2,
                                py: 0.5,
                                borderRadius: 1,
                                display: 'inline-block',
                                textAlign: 'right'
                              }}
                            >
                              {exp.duration}
                            </Typography>
                          </Box>
                          <Typography variant="body1">
                            {exp.description || exp.responsibilities}
                          </Typography>
                          {index < selectedResume.experience.length - 1 && (
                            <Divider sx={{ my: 2 }} />
                          )}
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body1" color="textSecondary">
                        No experience details available
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
          <Button onClick={handleCloseDialog}>Close</Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonIcon />}
            onClick={() => {
              handleCloseDialog();
              navigate('/resume-profile', { state: { resume: selectedResume } });
            }}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
            }}
          >
            View Full Profile
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={() => selectedResume && handleDownloadClick(selectedResume)}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
            }}
          >
            Download Resume
          </Button>
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
    </Container>
  );
};

export default Search; 