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
  Grid,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';
import NoData from '../components/NoData';
import { getRecruiters, createRecruiter, updateRecruiter, deleteRecruiter } from '../services/api';
import ReactCountryFlag from 'react-country-flag';
import useDebounce from '../hooks/useDebounce';

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

const DetailChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  fontWeight: 500,
}));

// Add country codes data
const countryCodes = [
  { code: '+1', country: 'US', name: 'United States' },
  { code: '+44', country: 'GB', name: 'United Kingdom' },
  { code: '+91', country: 'IN', name: 'India' },
  { code: '+86', country: 'CN', name: 'China' },
  { code: '+81', country: 'JP', name: 'Japan' },
  { code: '+49', country: 'DE', name: 'Germany' },
  { code: '+33', country: 'FR', name: 'France' },
  { code: '+61', country: 'AU', name: 'Australia' },
  { code: '+55', country: 'BR', name: 'Brazil' },
  { code: '+7', country: 'RU', name: 'Russia' },
  { code: '+82', country: 'KR', name: 'South Korea' },
  { code: '+65', country: 'SG', name: 'Singapore' },
  { code: '+971', country: 'AE', name: 'United Arab Emirates' },
  { code: '+966', country: 'SA', name: 'Saudi Arabia' },
  { code: '+20', country: 'EG', name: 'Egypt' },
  { code: '+27', country: 'ZA', name: 'South Africa' },
  { code: '+52', country: 'MX', name: 'Mexico' },
  { code: '+34', country: 'ES', name: 'Spain' },
  { code: '+39', country: 'IT', name: 'Italy' },
  { code: '+31', country: 'NL', name: 'Netherlands' },
];

const Recruiters = () => {
  const theme = useTheme();
  const [recruiters, setRecruiters] = useState([]);
  const [filteredRecruiters, setFilteredRecruiters] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // 300ms delay
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    country_code: '+1',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchRecruiters = async () => {
    try {
      setLoading(true);
      const response = await getRecruiters();
      const recruitersData = response.data || response || [];
      const recruitersArray = Array.isArray(recruitersData) ? recruitersData : [];
      const sortedRecruiters = recruitersArray.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      setRecruiters(sortedRecruiters);
      setFilteredRecruiters(sortedRecruiters);
    } catch (error) {
      console.error('Error fetching recruiters:', error);
      setError('Failed to load recruiters');
      setRecruiters([]);
      setFilteredRecruiters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruiters();
  }, []);

  useEffect(() => {
    const filtered = recruiters.filter(
      (recruiter) =>
        recruiter.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        recruiter.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (recruiter.company && recruiter.company.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
        (recruiter.phone && recruiter.phone.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
    );
    setFilteredRecruiters(filtered);
    setPage(0); // Reset to first page when filtering
  }, [debouncedSearchTerm, recruiters]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (recruiter = null) => {
    if (recruiter) {
      setSelectedRecruiter(recruiter);
      setFormData({
        name: recruiter.name,
        email: recruiter.email,
        phone: recruiter.phone || '',
        company: recruiter.company || '',
        country_code: recruiter.country_code || '+1',
      });
    } else {
      setSelectedRecruiter(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        country_code: '+1',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRecruiter(null);
    setError('');
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.email) {
        setError('Name and Email are required fields');
        return;
      }

      let response;
      if (selectedRecruiter) {
        response = await updateRecruiter(selectedRecruiter.id, formData);
      } else {
        response = await createRecruiter(formData);
      }

      setSuccessMessage(selectedRecruiter ? 'Recruiter updated successfully' : 'Recruiter added successfully');
      handleCloseDialog();
      await fetchRecruiters();
    } catch (error) {
      console.error('Error saving recruiter:', error);
      setError(error.message || 'Failed to save recruiter');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this recruiter?')) {
      try {
        await deleteRecruiter(id);
        setSuccessMessage('Recruiter deleted successfully');
        await fetchRecruiters();
      } catch (error) {
        console.error('Error deleting recruiter:', error);
        setError('Failed to delete recruiter');
      }
    }
  };

  const handleCloseSnackbar = () => {
    setError('');
    setSuccessMessage('');
  };

  const handleOpenDetailDialog = (recruiter) => {
    setSelectedRecruiter(recruiter);
    setOpenDetailDialog(true);
  };

  const handleCloseDetailDialog = () => {
    setSelectedRecruiter(null);
    setOpenDetailDialog(false);
  };

  // Render method for recruiter details
  const renderRecruiterDetails = () => {
    if (!selectedRecruiter) return null;

    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PersonIcon sx={{ mr: 2, color: theme.palette.primary.main }} />
              <Typography variant="h6">{selectedRecruiter.name}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <EmailIcon sx={{ mr: 2, color: theme.palette.primary.main }} />
              <Typography>{selectedRecruiter.email}</Typography>
            </Box>
            
            {selectedRecruiter.phone && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PhoneIcon sx={{ mr: 2, color: theme.palette.primary.main }} />
                <Typography>
                  {selectedRecruiter.country_code} {selectedRecruiter.phone}
                </Typography>
              </Box>
            )}
            
            {selectedRecruiter.company && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BusinessIcon sx={{ mr: 2, color: theme.palette.primary.main }} />
                <Typography>{selectedRecruiter.company}</Typography>
              </Box>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 2 }}>Additional Information</Typography>
            <Box>
              <DetailChip 
                icon={<PersonIcon />} 
                label={`Recruiter ID: ${selectedRecruiter.id}`} 
                variant="outlined" 
              />
              {selectedRecruiter.created_at && (
                <DetailChip 
                  icon={<PersonIcon />} 
                  label={`Added on: ${new Date(selectedRecruiter.created_at).toLocaleDateString()}`} 
                  variant="outlined" 
                />
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  };

  // Get current page items
  const currentRecruiters = filteredRecruiters.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
          label="Search Recruiters"
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
          Add Recruiter
        </Button>
      </SearchBox>

      {recruiters.length === 0 ? (
        <NoData type="recruiters" />
      ) : (
        <StyledTableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Created At</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRecruiters
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((recruiter) => (
                  <StyledTableRow key={recruiter.id}>
                    <TableCell>
                      {new Date(recruiter.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>{recruiter.name}</TableCell>
                    <TableCell>{recruiter.email}</TableCell>
                    <TableCell>
                      {recruiter.country_code && recruiter.phone 
                        ? `${recruiter.country_code} ${recruiter.phone}`
                        : recruiter.phone || '-'}
                    </TableCell>
                    <TableCell>{recruiter.company || '-'}</TableCell>
                    <TableCell align="right">
                      <ActionButton
                        onClick={() => handleOpenDetailDialog(recruiter)}
                        sx={{ color: theme.palette.info.main }}
                      >
                        <ViewIcon />
                      </ActionButton>
                      <ActionButton
                        onClick={() => handleOpenDialog(recruiter)}
                        sx={{ color: theme.palette.primary.main }}
                      >
                        <EditIcon />
                      </ActionButton>
                      <ActionButton
                        onClick={() => handleDelete(recruiter.id)}
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
            count={filteredRecruiters.length}
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
          {selectedRecruiter ? 'Edit Recruiter' : 'Add New Recruiter'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl sx={{ width: '30%', mt: 2 }}>
                <InputLabel>Country Code</InputLabel>
                <Select
                  value={formData.country_code}
                  onChange={(e) => setFormData({ ...formData, country_code: e.target.value })}
                  label="Country Code"
                >
                  {countryCodes.map((country) => (
                    <MenuItem key={country.code} value={country.code}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ReactCountryFlag
                          countryCode={country.country}
                          svg
                          style={{
                            width: '1.5em',
                            height: '1.5em',
                          }}
                        />
                        <Typography>{country.code}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                margin="normal"
                sx={{ width: '70%' }}
              />
            </Box>
            <TextField
              fullWidth
              label="Company"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedRecruiter ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Recruiter Details Dialog */}
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
          Recruiter Details
        </DialogTitle>
        <DialogContent dividers>
          {renderRecruiterDetails()}
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

export default Recruiters; 