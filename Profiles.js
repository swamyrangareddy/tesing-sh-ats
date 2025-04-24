import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormGroup,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Chip,
  Card,
  CardContent,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  LocationOn as LocationIcon,
  School as SchoolIcon,
  Description as DescriptionIcon,
  Business as BusinessIcon,
  Language as LanguageIcon,
  LinkedIn as LinkedInIcon,
  CalendarToday as CalendarIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { getResumes } from '../services/api';

// Styled components
const FilterPanel = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  borderRadius: theme.spacing(1),
  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
}));

const ResumeListPanel = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  borderRadius: theme.spacing(1),
  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
  overflow: 'auto',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: '#f1f1f1',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#c1c1c1',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: '#a8a8a8',
  },
}));

const ResumeDetailPanel = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  borderRadius: theme.spacing(1),
  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
  overflow: 'auto',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: '#f1f1f1',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#c1c1c1',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: '#a8a8a8',
  },
}));

const ResumeListItem = styled(ListItem)(({ theme, selected }) => ({
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(1),
  backgroundColor: selected ? 'rgba(0, 123, 255, 0.08)' : 'white',
  border: selected ? '1px solid rgba(0, 123, 255, 0.5)' : '1px solid rgba(0, 0, 0, 0.08)',
  transition: 'all 0.2s ease',
  padding: '12px 16px',
  '&:hover': {
    backgroundColor: selected ? 'rgba(0, 123, 255, 0.12)' : 'rgba(0, 0, 0, 0.04)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    left: 0,
    bottom: -5,
    width: 40,
    height: 3,
    backgroundColor: theme.palette.primary.main,
    borderRadius: 3,
  },
}));

const DetailSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: 'rgba(0, 0, 0, 0.02)',
  borderRadius: theme.spacing(1),
}));

const SkillChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const SearchField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const Profiles = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [filteredResumes, setFilteredResumes] = useState([]);
  const [selectedResumeIndex, setSelectedResumeIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter states
  const [filters, setFilters] = useState({
    skills: [],
    experience: '',
    location: '',
    jobTitle: '',
    education: '',
  });
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const response = await getResumes();
      
      // Extract resumes data and filter out empty objects
      const resumesData = response.data?.resumes || response?.resumes || response || [];
      const validResumes = Array.isArray(resumesData) 
        ? resumesData.filter(resume => {
            // Only keep resumes that have actual data
            return resume && 
                   Object.keys(resume).length > 0 && 
                   (resume.name || resume.filename || resume.email);
          })
        : [];

      setResumes(validResumes);
      setFilteredResumes(validResumes);
      
      if (validResumes.length > 0) {
        setSelectedResumeIndex(0);
      }
    } catch (err) {
      console.error('Error fetching resumes:', err);
      setError('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    applyFilters(value, filters);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const updatedFilters = {
      ...filters,
      [name]: value,
    };
    setFilters(updatedFilters);
    applyFilters(searchTerm, updatedFilters);
  };

  const applyFilters = (search, filterCriteria) => {
    let result = [...resumes];

    // Apply search term filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(resume => 
        (resume.name && resume.name.toLowerCase().includes(searchLower)) ||
        (resume.email && resume.email.toLowerCase().includes(searchLower)) ||
        (resume.skills && typeof resume.skills === 'string' && resume.skills.toLowerCase().includes(searchLower)) ||
        (resume.job_title && resume.job_title.toLowerCase().includes(searchLower)) ||
        (resume.location && resume.location.toLowerCase().includes(searchLower))
      );
    }

    // Apply other filters
    if (filterCriteria.experience) {
      result = result.filter(resume => 
        resume.total_experience && resume.total_experience.includes(filterCriteria.experience)
      );
    }

    if (filterCriteria.location) {
      result = result.filter(resume => 
        resume.location && resume.location.toLowerCase().includes(filterCriteria.location.toLowerCase())
      );
    }

    if (filterCriteria.jobTitle) {
      result = result.filter(resume => 
        (resume.job_title && resume.job_title.toLowerCase().includes(filterCriteria.jobTitle.toLowerCase())) ||
        (resume.current_role && resume.current_role.toLowerCase().includes(filterCriteria.jobTitle.toLowerCase()))
      );
    }

    if (filterCriteria.education) {
      result = result.filter(resume => {
        if (typeof resume.education === 'string') {
          return resume.education.toLowerCase().includes(filterCriteria.education.toLowerCase());
        } else if (Array.isArray(resume.education)) {
          return resume.education.some(edu => 
            (edu.degree && edu.degree.toLowerCase().includes(filterCriteria.education.toLowerCase())) ||
            (edu.institution && edu.institution.toLowerCase().includes(filterCriteria.education.toLowerCase()))
          );
        }
        return false;
      });
    }

    setFilteredResumes(result);
    
    // Reset selected resume index if filtered list is not empty
    if (result.length > 0) {
      setSelectedResumeIndex(0);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      skills: [],
      experience: '',
      location: '',
      jobTitle: '',
      education: '',
    });
    setFilteredResumes(resumes);
  };

  const handleResumeSelect = (index) => {
    setSelectedResumeIndex(index);
  };

  const getSkillsArray = (resume) => {
    if (!resume.skills) return [];
    
    if (typeof resume.skills === 'string') {
      return resume.skills.split(',').map(skill => skill.trim());
    }
    
    if (Array.isArray(resume.skills)) {
      return resume.skills.map(skill => 
        typeof skill === 'string' ? skill : skill.name || ''
      ).filter(Boolean);
    }
    
    return [];
  };

  const getEducationDisplay = (resume) => {
    if (!resume.education) return 'N/A';
    
    if (typeof resume.education === 'string') {
      return resume.education;
    }
    
    if (Array.isArray(resume.education)) {
      return resume.education.map((edu, index) => (
        <Box key={index} sx={{ mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {edu.degree || 'Degree N/A'}
          </Typography>
          <Typography variant="body2">
            {edu.institution || 'Institution N/A'}, {edu.year || 'Year N/A'}
          </Typography>
        </Box>
      ));
    }
    
    return 'N/A';
  };

  const getExperienceDisplay = (resume) => {
    if (!resume.experience && !resume.experience_details) return 'N/A';
    
    const experiences = resume.experience_details || resume.experience || [];
    
    if (!Array.isArray(experiences)) return 'N/A';
    
    return experiences.map((exp, index) => (
      <Card 
        key={index} 
        sx={{ 
          mb: 2, 
          borderRadius: 2, 
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)', 
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          }
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              {exp.title || exp.job_title || exp.role || 'Position N/A'}
            </Typography>
            <Chip 
              size="small" 
              label={exp.duration || 'Duration N/A'} 
              sx={{ 
                bgcolor: 'rgba(0, 123, 255, 0.08)', 
                color: 'primary.main',
                fontWeight: 500,
                fontSize: '0.75rem'
              }} 
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <BusinessIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {exp.company || exp.current_company || 'Company N/A'}
            </Typography>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {Array.isArray(exp.responsibilities) 
              ? exp.responsibilities.map((resp, i) => (
                  <Box key={i} sx={{ display: 'flex', mb: 1 }}>
                    <Box sx={{ mr: 1 }}>•</Box>
                    <Box>{resp}</Box>
                  </Box>
                ))
              : typeof exp.responsibilities === 'string'
                ? exp.responsibilities.split('\n').map((line, i) => (
                    line.trim() ? (
                      <Box key={i} sx={{ display: 'flex', mb: 1 }}>
                        <Box sx={{ mr: 1 }}>•</Box>
                        <Box>{line.trim()}</Box>
                      </Box>
                    ) : null
                  ))
                : exp.description
                  ? exp.description.split('\n').map((line, i) => (
                      line.trim() ? (
                        <Box key={i} sx={{ display: 'flex', mb: 1 }}>
                          <Box sx={{ mr: 1 }}>•</Box>
                          <Box>{line.trim()}</Box>
                        </Box>
                      ) : null
                    ))
                  : 'No description available'}
          </Typography>
        </CardContent>
      </Card>
    ));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const selectedResume = filteredResumes[selectedResumeIndex] || {};

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, height: '850px', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Profile Management
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2, flexGrow: 1 }}>
        {/* Left Panel - Filters */}
        <Grid item xs={12} md={2}>
          <FilterPanel>
            <SectionTitle variant="h6">
              Filters
            </SectionTitle>
            
            <SearchField
              fullWidth
              variant="outlined"
              placeholder="Search profiles..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
              }}
            />
            
            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
              <InputLabel>Experience</InputLabel>
              <Select
                name="experience"
                value={filters.experience}
                onChange={handleFilterChange}
                label="Experience"
              >
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="0-2">0-2 years</MenuItem>
                <MenuItem value="2-5">2-5 years</MenuItem>
                <MenuItem value="5-10">5-10 years</MenuItem>
                <MenuItem value="10+">10+ years</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Location"
              name="location"
              variant="outlined"
              value={filters.location}
              onChange={handleFilterChange}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Job Title"
              name="jobTitle"
              variant="outlined"
              value={filters.jobTitle}
              onChange={handleFilterChange}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Education"
              name="education"
              variant="outlined"
              value={filters.education}
              onChange={handleFilterChange}
              sx={{ mb: 3 }}
            />
            
            <Button 
              variant="outlined" 
              startIcon={<ClearIcon />}
              onClick={clearFilters}
              fullWidth
            >
              Clear Filters
            </Button>
          </FilterPanel>
        </Grid>
        
        {/* Center Panel - Resume List */}
        <Grid item xs={12} md={4}>
          <ResumeListPanel>
            <SectionTitle variant="h6">
              Profiles ({filteredResumes.length})
            </SectionTitle>
            
            {filteredResumes.length === 0 ? (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No profiles match your filters
                </Typography>
              </Box>
            ) : (
              <List sx={{ pt: 0, height: '700px', overflow: 'auto' }}>
                {filteredResumes.map((resume, index) => (
                  <ResumeListItem
                    key={index}
                    selected={index === selectedResumeIndex}
                    onClick={() => handleResumeSelect(index)}
                    button
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: index === selectedResumeIndex ? 'primary.main' : 'grey.400' }}>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {resume.name || 'Unnamed Profile'}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <EmailIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary', fontSize: '0.9rem' }} />
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                              {resume.email || 'No email'}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <WorkIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary', fontSize: '0.9rem' }} />
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                              {resume.job_title || resume.current_role || 'No job title'}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </ResumeListItem>
                ))}
              </List>
            )}
          </ResumeListPanel>
        </Grid>
        
        {/* Right Panel - Resume Details */}
        <Grid item xs={12} md={6}>
          <ResumeDetailPanel sx={{ height: '700px', overflow: 'auto' }}>
            {filteredResumes.length === 0 ? (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No profile selected
                </Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      bgcolor: 'primary.main',
                      mr: 2
                    }}
                  >
                    {selectedResume.name ? selectedResume.name.charAt(0).toUpperCase() : 'P'}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {selectedResume.name || 'Unnamed Profile'}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      {selectedResume.job_title || selectedResume.current_role || 'No job title'}
                    </Typography>
                  </Box>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <DetailSection>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="body1">
                          {selectedResume.email || 'No email'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="body1">
                          {selectedResume.phone_number || selectedResume.phone || 'No phone'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="body1">
                          {selectedResume.location || 'No location'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LinkedInIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="body1">
                          {selectedResume.linkedin || 'No LinkedIn'}
                        </Typography>
                      </Box>
                    </DetailSection>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <DetailSection>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="body1">
                          {selectedResume.current_company || selectedResume.company || 'No company'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CalendarIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="body1">
                          {selectedResume.total_experience || 'Experience not specified'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="body1">
                          {selectedResume.visa || 'Visa status not specified'}
                        </Typography>
                      </Box>
                    </DetailSection>
                  </Grid>
                </Grid>
                
                <DetailSection sx={{ mt: 2 }}>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    Summary
                  </Typography>
                  <Typography variant="body1">
                    {selectedResume.resume_summary || selectedResume.summary || 'No summary available'}
                  </Typography>
                </DetailSection>
                
                <DetailSection>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    Skills
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                    {getSkillsArray(selectedResume).length > 0 ? (
                      getSkillsArray(selectedResume).map((skill, index) => (
                        <SkillChip key={index} label={skill} />
                      ))
                    ) : (
                      <Typography variant="body1">No skills listed</Typography>
                    )}
                  </Box>
                </DetailSection>
                
                <DetailSection sx={{ p: 0, bgcolor: 'transparent' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, px: 2, pt: 2 }}>
                    Work Experience
                  </Typography>
                  <Box sx={{ px: 2, pb: 2 }}>
                    {getExperienceDisplay(selectedResume)}
                  </Box>
                </DetailSection>
                
                <DetailSection>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    Education
                  </Typography>
                  {getEducationDisplay(selectedResume)}
                </DetailSection>
              </>
            )}
          </ResumeDetailPanel>
        </Grid>
      </Grid>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profiles;
