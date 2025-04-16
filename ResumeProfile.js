import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  IconButton,
  Grid,
  Chip,
  TextField,
  Card,
  CardContent,
  Avatar,
  Alert,
  Snackbar,
  Stack,
  LinearProgress,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Save as SaveIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Description as DescriptionIcon,
  Language as LanguageIcon,
  LinkedIn as LinkedInIcon,
  AttachFile as AttachFileIcon,
  Person as PersonIcon,
  Cancel as CancelIcon,
  Business as BusinessIcon,
  AccessTime as AccessTimeIcon,
  FiberManualRecord as FiberManualRecordIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProfileContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const ProfileHeader = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
  color: 'white',
  position: 'relative',
}));

const ProfileSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  position: 'relative',
  '&:hover': {
    boxShadow: theme.shadows[4],
    transition: 'box-shadow 0.3s ease-in-out',
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(20),
  height: theme.spacing(20),
  border: '4px solid white',
  boxShadow: theme.shadows[3],
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    width: theme.spacing(15),
    height: theme.spacing(15),
  },
}));

const SkillChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  '&:hover': {
    backgroundColor: theme.palette.primary.light,
    transform: 'translateY(-2px)',
    transition: 'transform 0.2s',
  },
}));

const ExperienceCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '&:hover': {
    transform: 'translateY(-4px)',
    transition: 'transform 0.3s ease-in-out',
    boxShadow: theme.shadows[4],
  },
}));

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  backgroundColor: theme.palette.grey[200],
  '& .MuiLinearProgress-bar': {
    borderRadius: 5,
  },
}));

const ActionButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.spacing(1),
}));

const SaveButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.success.main,
  color: 'white',
  '&:hover': {
    backgroundColor: theme.palette.success.dark,
  },
  minWidth: 120,
}));

const CancelButton = styled(Button)(({ theme }) => ({
  borderColor: theme.palette.grey[400],
  color: theme.palette.grey[700],
  '&:hover': {
    borderColor: theme.palette.grey[600],
    backgroundColor: theme.palette.grey[100],
  },
  minWidth: 120,
}));

const EditableField = ({ value, label, icon, isEditing, onChange }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {icon}
      {isEditing ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
          <TextField
            label={label}
            value={value}
            onChange={onChange}
            size="small"
            sx={{
              '& .MuiInputBase-input': {
                color: 'white'
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)'
              },
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.7)'
                },
                '&:hover fieldset': {
                  borderColor: 'white'
                }
              }
            }}
          />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
          <Typography sx={{ color: 'white' }}>{value}</Typography>
        </Box>
      )}
    </Box>
  );
};

const ResumeProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [editingSection, setEditingSection] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempProfile, setTempProfile] = useState({});
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    job_title: '',
    current_company: '',
    total_experience: '',
    resume_summary: '',
    visa: '',
    skills: [],
    workExperience: [],
    education: [],
    certifications: [],
    languages: []
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    // Check if resume data is passed through navigation state
    const resumeData = location.state?.resume;
    if (resumeData) {
      // Transform resume data to match profile structure
      const transformedProfile = {
        name: resumeData.name || 'N/A',
        email: resumeData.email || 'N/A',
        phone: resumeData.phone_number || 'N/A',
        location: resumeData.location || 'N/A',
        linkedin: resumeData.linkedin || 'N/A',
        job_title: resumeData.job_title || resumeData.current_role || 'N/A',
        current_company: resumeData.current_company || resumeData.company || 'N/A',
        total_experience: resumeData.total_experience || 'N/A',
        resume_summary: resumeData.resume_summary || 'summary not available',
        visa: resumeData.visa || 'N/A',
        skills: resumeData.skills 
          ? (typeof resumeData.skills === 'string' 
              ? resumeData.skills.split(',').map(skill => ({ name: skill.trim(), level: 70 }))
              : Array.isArray(resumeData.skills) 
                ? resumeData.skills.map(skill => ({ name: skill, level: 70 }))
                : [])
          : [],
        workExperience: Array.isArray(resumeData.experience_details || resumeData.experience) 
          ? (resumeData.experience_details || resumeData.experience).map(exp => ({
              title: exp.title || exp.job_title || exp.role || 'N/A',
              company: exp.company || exp.current_company || 'N/A',
              duration: exp.duration || 'N/A',
              responsibilities: Array.isArray(exp.responsibilities) 
                ? exp.responsibilities.join('\n')
                : typeof exp.responsibilities === 'string'
                  ? exp.responsibilities
                  : exp.description || 'No specific responsibilities listed'
            }))
          : [],
        education: typeof resumeData.education === 'string' 
          ? [{ degree: resumeData.education }]
          : Array.isArray(resumeData.education) 
            ? resumeData.education.map(edu => ({
                degree: edu.degree || 'N/A',
                institution: edu.institution || 'N/A',
                year: edu.year || 'N/A'
              }))
            : [],
        certifications: Array.isArray(resumeData.certifications) ? resumeData.certifications : [],
        languages: Array.isArray(resumeData.languages) ? resumeData.languages : []
      };
      setProfile(transformedProfile);
    }
  }, [location.state]);

  const handleEditToggle = (section) => {
    if (!isAuthenticated) {
      return; // Prevent editing if not authenticated
    }
    setEditingSection(editingSection === section ? null : section);
  };

  const handleInputChange = (e, section = null, index = null) => {
    const { name, value } = e.target;
    
    if (section && index !== null) {
      // Handle nested array updates
      const updatedSection = [...profile[section]];
      updatedSection[index] = {
        ...updatedSection[index],
        [name]: value
      };
      setProfile(prev => ({
        ...prev,
        [section]: updatedSection
      }));
    } else {
      // Handle top-level field updates
      setProfile(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSave = async (section) => {
    try {
      // TODO: Implement API call to save profile changes
      setSnackbar({
        open: true,
        message: `${section} updated successfully`,
        severity: 'success'
      });
      setEditingSection(null);
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Failed to update ${section}`,
        severity: 'error'
      });
    }
  };

  const handleAddExperience = () => {
    setProfile(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, {
        title: '',
        company: '',
        duration: '',
        responsibilities: ['']
      }]
    }));
  };

  const handleAddEducation = () => {
    setProfile(prev => ({
      ...prev,
      education: [...prev.education, {
        degree: '',
        institution: '',
        year: '',
        gpa: ''
      }]
    }));
  };

  const handleAddLanguage = () => {
    setProfile(prev => ({
      ...prev,
      languages: [...prev.languages, {
        name: '',
        proficiency: ''
      }]
    }));
  };

  const handleAddCertification = () => {
    setProfile(prev => ({
      ...prev,
      certifications: [...prev.certifications, '']
    }));
  };

  const handleRemoveItem = (section, index) => {
    setProfile(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const handleCancel = (section) => {
    setEditingSection(null);
  };

  const handleProfileEdit = () => {
    setIsEditingProfile(true);
    setTempProfile({ ...profile });
  };

  const handleProfileSave = () => {
    setProfile(tempProfile);
    setIsEditingProfile(false);
  };

  const handleProfileCancel = () => {
    setIsEditingProfile(false);
  };

  const handleProfileChange = (field, value) => {
    setTempProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderSkills = () => {
    if (!profile.skills || profile.skills.length === 0) {
      return <Typography variant="body2" color="text.secondary">No skills available</Typography>;
    }

    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {profile.skills.map((skill, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            {editingSection === 'skills' ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TextField
                  label="Skill"
                  value={skill.name}
                  onChange={(e) => handleInputChange(e, 'skills', index)}
                  size="small"
                />
                <IconButton 
                  color="error" 
                  onClick={() => handleRemoveItem('skills', index)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ) : (
              <SkillChip
                label={skill.name}
                onDelete={editingSection === 'skills' ? () => handleRemoveItem('skills', index) : undefined}
              />
            )}
          </motion.div>
        ))}
        {editingSection === 'skills' && (
          <Button 
            startIcon={<AddIcon />} 
            variant="outlined"
            onClick={() => {
              setProfile(prev => ({
                ...prev,
                skills: [...prev.skills, { name: '', level: 50 }]
              }));
            }}
          >
            Add Skill
          </Button>
        )}
      </Box>
    );
  };

  const renderWorkExperience = () => {
    if (profile.workExperience.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary">
          No work experience available
        </Typography>
      );
    }

    return (
      <Grid container spacing={2}>
        {profile.workExprience.map((exp, index) => (
          <Grid item xs={12} key={index}>
            <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                  {exp.title || exp.job_title}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessIcon sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
                    <Typography variant="subtitle1" color="text.secondary">
                      {exp.company || exp.current_company}
                    </Typography>
                  </Box>
                  {exp.duration && (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        bgcolor: 'primary.main',
                        color: 'white',
                        px: 2,
                        py: 0.5,
                        borderRadius: 1,
                        display: 'inline-block'
                      }}
                    >
                      {exp.duration}
                    </Typography>
                  )}
                </Box>
                {exp.location && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationIcon sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {exp.location}
                    </Typography>
                  </Box>
                )}
                {exp.responsibilities && exp.responsibilities.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="subtitle2" color="text.primary" sx={{ mb: 1 }}>
                      Responsibilities & Achievements
                    </Typography>
                    {exp.responsibilities.split('\n').map((achievement, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.5 }}>
                        <FiberManualRecordIcon sx={{ fontSize: '0.5rem', mt: 1, color: 'primary.main' }} />
                        <Typography variant="body2">
                          {achievement}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        ))}
        {(!profile.workExperience || profile.workExperience.length === 0) && (
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              No work experience available
            </Typography>
          </Grid>
        )}
      </Grid>
    );
  };

  const renderEducation = () => {
    if (profile.education.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary">
          No education information available
        </Typography>
      );
    }

    return (
      <Grid container spacing={2}>
        {profile.education.map((edu, index) => (
          <Grid item xs={12} key={index}>
            <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="h6" color="primary">
                  {edu.degree}
                </Typography>
                {edu.institution && (
                  <Typography variant="subtitle1" color="text.secondary">
                    {edu.institution}
                  </Typography>
                )}
                {edu.year && (
                  <Typography variant="body2" color="text.secondary">
                    {edu.year}
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>
        ))}
        {(!profile.education || profile.education.length === 0) && (
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              No education details available
            </Typography>
          </Grid>
        )}
      </Grid>
    );
  };

  const renderLanguages = () => {
    if (profile.languages.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary">
          No languages available
        </Typography>
      );
    }

    return profile.languages.map((lang, index) => (
      <Box key={index} sx={{ mb: 2 }}>
        {editingSection === 'languages' ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              label="Language"
              value={lang.name}
              onChange={(e) => handleInputChange(e, 'languages', index)}
              size="small"
            />
            <TextField
              label="Proficiency"
              value={lang.proficiency}
              onChange={(e) => handleInputChange(e, 'languages', index)}
              size="small"
            />
            <IconButton
              color="error"
              onClick={() => handleRemoveItem('languages', index)}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ) : (
          <Chip
            label={`${lang.name} - ${lang.proficiency}`}
            color="primary"
            variant="outlined"
          />
        )}
      </Box>
    ));
  };

  const renderCertifications = () => {
    if (profile.certifications.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary">
          No certifications available
        </Typography>
      );
    }

    return profile.certifications.map((cert, index) => (
      <Box key={index} sx={{ mb: 1 }}>
        {editingSection === 'certifications' ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              fullWidth
              label="Certification"
              value={cert}
              onChange={(e) => {
                const newCerts = [...profile.certifications];
                newCerts[index] = e.target.value;
                setProfile(prev => ({ ...prev, certifications: newCerts }));
              }}
              size="small"
            />
            <IconButton
              color="error"
              onClick={() => handleRemoveItem('certifications', index)}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ) : (
          <Chip
            label={cert}
            color="primary"
            variant="outlined"
          />
        )}
      </Box>
    ));
  };

  const renderEditButton = (section) => {
    if (!isAuthenticated) return null;
    return (
      <IconButton 
        onClick={() => handleEditToggle(section)}
        color={editingSection === section ? 'primary' : 'default'}
      >
        <EditIcon />
      </IconButton>
    );
  };

  return (
    <ProfileContainer maxWidth="lg">
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ProfileHeader elevation={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3} sx={{ textAlign: 'center' }}>
              <StyledAvatar>{profile.name.charAt(0)}</StyledAvatar>
              <Button
                variant="outlined"
                component="label"
                startIcon={<AttachFileIcon />}
                sx={{ color: 'white', borderColor: 'white' }}
              >
                Upload Resume
                <input type="file" hidden />
              </Button>
            </Grid>
            <Grid item xs={12} md={9}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {isEditingProfile ? tempProfile.name : profile.name}
                  </Typography>
                  {isAuthenticated && (
                    <IconButton 
                      onClick={() => handleEditToggle('name')}
                      sx={{ color: 'white' }}
                    >
                    </IconButton>
                  )}
                </Box>
              </Box>
              <Box sx={{ mb: 2 }}>
                <EditableField
                  value={isEditingProfile ? tempProfile.job_title : profile.job_title}
                  label="Job Title"
                  icon={<WorkIcon sx={{ color: 'white' }} />}
                  isEditing={isEditingProfile}
                  onChange={(e) => handleProfileChange('job_title', e.target.value)}
                />
              </Box>
              <Stack direction="row" spacing={3} sx={{ mb: 2 }}>
                <EditableField
                  value={isEditingProfile ? tempProfile.location : profile.location}
                  label="Location"
                  icon={<LocationIcon sx={{ color: 'white' }} />}
                  isEditing={isEditingProfile}
                  onChange={(e) => handleProfileChange('location', e.target.value)}
                />
                <EditableField
                  value={isEditingProfile ? tempProfile.total_experience : profile.total_experience}
                  label="Experience"
                  icon={<WorkIcon sx={{ color: 'white' }} />}
                  isEditing={isEditingProfile}
                  onChange={(e) => handleProfileChange('total_experience', e.target.value)}
                />
                <EditableField
                  value={isEditingProfile ? tempProfile.linkedin : profile.linkedin}
                  label="LinkedIn"
                  icon={<LinkedInIcon sx={{ color: 'white' }} />}
                  isEditing={isEditingProfile}
                  onChange={(e) => handleProfileChange('linkedin', e.target.value)}
                />
              </Stack>
              <Stack direction="row" spacing={3}>
                <EditableField
                  value={isEditingProfile ? tempProfile.email : profile.email}
                  label="Email"
                  icon={<EmailIcon sx={{ color: 'white' }} />}
                  isEditing={isEditingProfile}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                />
                <EditableField
                  value={isEditingProfile ? tempProfile.phone : profile.phone}
                  label="Phone"
                  icon={<PhoneIcon sx={{ color: 'white' }} />}
                  isEditing={isEditingProfile}
                  onChange={(e) => handleProfileChange('phone', e.target.value)}
                />
              </Stack>
            </Grid>
          </Grid>
          {isAuthenticated && (
            <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
              {isEditingProfile ? (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton onClick={handleProfileSave} sx={{ color: 'white' }}>
                    <SaveIcon />
                  </IconButton>
                  <IconButton onClick={handleProfileCancel} sx={{ color: 'white' }}>
                    <CancelIcon />
                  </IconButton>
                </Box>
              ) : (
                <IconButton onClick={handleProfileEdit} sx={{ color: 'white' }}>
                  <EditIcon />
                </IconButton>
              )}
            </Box>
          )}
        </ProfileHeader>

        <ProfileSection>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
              <DescriptionIcon sx={{ mr: 1 }} />
              Professional Summary
            </Typography>
            {renderEditButton('summary')}
          </Box>
          {editingSection === 'summary' ? (
            <>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Summary"
                value={profile.resume_summary}
                onChange={handleInputChange}
              />
              <ActionButtons>
                <CancelButton
                  variant="outlined"
                  onClick={() => handleCancel('summary')}
                >
                  Cancel
                </CancelButton>
                <SaveButton
                  variant="contained"
                  onClick={() => handleSave('summary')}
                  startIcon={<SaveIcon />}
                >
                  Save Changes
                </SaveButton>
              </ActionButtons>
            </>
          ) : (
            <Typography variant="body1" paragraph>
              {profile.resume_summary}
            </Typography>
          )}
        </ProfileSection>

        <ProfileSection>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Key Skills
            </Typography>
            <Box>
              {renderEditButton('skills')}
            </Box>
          </Box>
          {renderSkills()}
        </ProfileSection>

        <ProfileSection>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
              <WorkIcon sx={{ mr: 1 }} />
              Work Experience
            </Typography>
          </Box>
          <Grid container spacing={2}>
            {profile.workExperience.map((exp, index) => (
              <Grid item xs={12} key={index}>
                <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                      {exp.title || exp.job_title}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BusinessIcon sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
                        <Typography variant="subtitle1" color="text.secondary">
                          {exp.company}
                        </Typography>
                      </Box>
                      {exp.duration && (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            bgcolor: 'primary.main',
                            color: 'white',
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                            display: 'inline-block'
                          }}
                        >
                          {exp.duration}
                        </Typography>
                      )}
                    </Box>
                    {exp.location && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationIcon sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {exp.location}
                        </Typography>
                      </Box>
                    )}
                    {exp.responsibilities && exp.responsibilities.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="subtitle2" color="text.primary" sx={{ mb: 1 }}>
                          Responsibilities & Achievements
                        </Typography>
                        {exp.responsibilities.split('\n').map((achievement, i) => (
                          <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.5 }}>
                            <FiberManualRecordIcon sx={{ fontSize: '0.5rem', mt: 1, color: 'primary.main' }} />
                            <Typography variant="body2">
                              {achievement}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Grid>
            ))}
            {(!profile.workExperience || profile.workExperience.length === 0) && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  No work experience available
                </Typography>
              </Grid>
            )}
          </Grid>
        </ProfileSection>

        <ProfileSection>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
              <SchoolIcon sx={{ mr: 1 }} />
              Education
            </Typography>
          </Box>
          <Grid container spacing={2}>
            {profile.education.map((edu, index) => (
              <Grid item xs={12} key={index}>
                <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="h6" color="primary">
                      {edu.degree}
                    </Typography>
                    {edu.institution && (
                      <Typography variant="subtitle1" color="text.secondary">
                        {edu.institution}
                      </Typography>
                    )}
                    {edu.year && (
                      <Typography variant="body2" color="text.secondary">
                        {edu.year}
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>
            ))}
            {(!profile.education || profile.education.length === 0) && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  No education details available
                </Typography>
              </Grid>
            )}
          </Grid>
        </ProfileSection>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <ProfileSection>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Certifications
                </Typography>
                <Box>
                  {renderEditButton('certifications')}
                </Box>
              </Box>
              {renderCertifications()}
            </ProfileSection>
          </Grid>
          <Grid item xs={12} md={6}>
            <ProfileSection>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                  <LanguageIcon sx={{ mr: 1 }} />
                  Languages
                </Typography>
                <Box>
                  {renderEditButton('languages')}
                </Box>
              </Box>
              {renderLanguages()}
            </ProfileSection>
          </Grid>
        </Grid>
      </motion.div>
    </ProfileContainer>
  );
};

export default ResumeProfile; 