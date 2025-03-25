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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Card,
  CardContent,
  Avatar,
  Tooltip,
  Alert,
  Snackbar,
  Stack,
  Rating,
  LinearProgress,
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
  Star as StarIcon,
  LinkedIn as LinkedInIcon,
  AttachFile as AttachFileIcon,
  Code as CodeIcon,
  Build as BuildIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';

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
  backgroundColor: theme.palette.primary.light,
  color: 'white',
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
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

// Add new styled components for skills
const SkillContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
}));

const SkillCard = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  width: 150,
  height: 150,
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: theme.shadows[4],
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
  },
}));

const SkillIcon = styled(Box)(({ theme }) => ({
  fontSize: '3rem',
  marginBottom: theme.spacing(1),
  color: theme.palette.primary.main,
}));

const SkillProgressContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const ResumeProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    experience: '',
    currentCTC: '',
    expectedCTC: '',
    noticePeriod: '',
    summary: '',
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
        title: resumeData.job_title || 'N/A',
        email: resumeData.email || 'N/A',
        phone: resumeData.phone_number || 'N/A',
        location: resumeData.location || 'N/A',
        linkedin: resumeData.linkedin || 'N/A',
        experience: resumeData.experience && resumeData.experience.length > 0 
          ? `${resumeData.experience[0].duration || 'N/A'} Experience` 
          : 'N/A',
        currentCTC: resumeData.current_job || 'N/A',
        expectedCTC: resumeData.expected_salary || 'N/A',
        noticePeriod: resumeData.notice_period || 'N/A',
        summary: resumeData.resume_summary || 'No summary available',
        skills: resumeData.skills 
          ? (typeof resumeData.skills === 'string' 
              ? resumeData.skills.split(',').map(skill => ({ name: skill.trim(), level: 70 }))
              : resumeData.skills.map(skill => ({ name: skill, level: 70 })))
          : [],
        workExperience: resumeData.experience 
          ? resumeData.experience.map(exp => ({
              role: exp.position || 'N/A',
              company: exp.company || 'N/A',
              duration: exp.duration || 'N/A',
              location: exp.location || 'N/A',
              achievements: exp.description ? exp.description.split('\n').filter(line => line.trim()) : ['No specific achievements listed']
            }))
          : [],
        education: resumeData.education || [],
        certifications: resumeData.certifications || [], 
        languages: resumeData.languages || []
      };
      setProfile(transformedProfile);
    }
  }, [location.state]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
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

  const handleSave = async () => {
    try {
      // TODO: Implement API call to save profile changes
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });
      setIsEditing(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to update profile',
        severity: 'error'
      });
    }
  };

  const handleAddExperience = () => {
    setProfile(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, {
        role: '',
        company: '',
        duration: '',
        location: '',
        achievements: ['']
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

  const renderSkills = () => {
    if (!profile.skills || profile.skills.length === 0) {
      return <Typography variant="body2" color="text.secondary">No skills available</Typography>;
    }

    return (
      <SkillContainer 
        sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 1.5, 
          alignItems: 'center',
          backgroundColor: 'background.default',
          padding: 2,
          borderRadius: 2
        }}
      >
        {profile.skills.map((skill, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            style={{ display: 'inline-block' }}
          >
            {isEditing ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Skill"
                  name="name"
                  value={skill.name}
                  onChange={(e) => handleInputChange(e, 'skills', index)}
                  variant="outlined"
                  size="small"
                />
                <TextField
                  type="number"
                  label="Proficiency"
                  name="level"
                  value={skill.level}
                  onChange={(e) => handleInputChange(e, 'skills', index)}
                  variant="outlined"
                  size="small"
                  InputProps={{ inputProps: { min: 0, max: 100 } }}
                  sx={{ width: 120 }}
                />
                <IconButton 
                  color="error" 
                  onClick={() => {
                    const updatedSkills = profile.skills.filter((_, i) => i !== index);
                    setProfile(prev => ({ ...prev, skills: updatedSkills }));
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ) : (
              <Chip
                label={skill.name}
                variant="outlined"
                color="primary"
                sx={{
                  margin: 0.5,
                  borderRadius: 1,
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    transform: 'scale(1.05)',
                  }
                }}
              />
            )}
          </motion.div>
        ))}
        {isEditing && (
          <Button 
            startIcon={<AddIcon />} 
            variant="outlined"
            color="primary"
            onClick={() => {
              setProfile(prev => ({
                ...prev,
                skills: [...prev.skills, { name: '', level: 50 }]
              }));
            }}
            sx={{ alignSelf: 'center', mt: 2 }}
          >
            Add Skill
          </Button>
        )}
      </SkillContainer>
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

    return profile.workExperience.map((exp, index) => (
      <ExperienceCard key={index}>
        <CardContent>
          {isEditing ? (
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Role"
                name="role"
                value={exp.role}
                onChange={(e) => handleInputChange(e, 'workExperience', index)}
                variant="outlined"
                size="small"
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                label="Company"
                name="company"
                value={exp.company}
                onChange={(e) => handleInputChange(e, 'workExperience', index)}
                variant="outlined"
                size="small"
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                label="Duration"
                name="duration"
                value={exp.duration}
                onChange={(e) => handleInputChange(e, 'workExperience', index)}
                variant="outlined"
                size="small"
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={exp.location}
                onChange={(e) => handleInputChange(e, 'workExperience', index)}
                variant="outlined"
                size="small"
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                label="Achievements (one per line)"
                name="achievements"
                value={exp.achievements.join('\n')}
                onChange={(e) => {
                  const achievements = e.target.value.split('\n').filter(line => line.trim());
                  handleInputChange({
                    target: {
                      name: 'achievements',
                      value: achievements
                    }
                  }, 'workExperience', index);
                }}
                variant="outlined"
                multiline
                rows={3}
                size="small"
                sx={{ mb: 1 }}
              />
              <Button
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => handleRemoveItem('workExperience', index)}
                size="small"
              >
                Remove Experience
              </Button>
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {exp.role}
                  </Typography>
                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    {exp.company}
                  </Typography>
                </Box>
                <Chip 
                  label={exp.duration} 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                  sx={{ fontWeight: 500 }} 
                />
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 1 }}>
                <LocationIcon sx={{ fontSize: 'inherit', verticalAlign: 'middle', mr: 0.5 }} />
                {exp.location}
              </Typography>
              <Box sx={{ mt: 2 }}>
                {exp.achievements.map((achievement, i) => (
                  <Typography 
                    key={i} 
                    variant="body2" 
                    sx={{ 
                      mb: 1, 
                      display: 'flex', 
                      alignItems: 'flex-start',
                      '&::before': {
                        content: '"•"',
                        mr: 1,
                        color: 'primary.main',
                        fontWeight: 'bold'
                      }
                    }}
                  >
                    {achievement}
                  </Typography>
                ))}
              </Box>
            </>
          )}
        </CardContent>
      </ExperienceCard>
    ));
  };

  const renderEducation = () => {
    if (profile.education.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary">
          No education information available
        </Typography>
      );
    }

    return profile.education.map((edu, index) => (
      <Card key={index} sx={{ mb: 2 }}>
        <CardContent>
          {isEditing ? (
            <Box>
              <TextField
                fullWidth
                label="Degree"
                name="degree"
                value={edu.degree}
                onChange={(e) => handleInputChange(e, 'education', index)}
                variant="outlined"
                size="small"
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                label="Institution"
                name="institution"
                value={edu.institution}
                onChange={(e) => handleInputChange(e, 'education', index)}
                variant="outlined"
                size="small"
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                label="Year"
                name="year"
                value={edu.year}
                onChange={(e) => handleInputChange(e, 'education', index)}
                variant="outlined"
                size="small"
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                label="GPA"
                name="gpa"
                value={edu.gpa}
                onChange={(e) => handleInputChange(e, 'education', index)}
                variant="outlined"
                size="small"
                sx={{ mb: 1 }}
              />
              <Button
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => handleRemoveItem('education', index)}
                size="small"
              >
                Remove Education
              </Button>
            </Box>
          ) : (
            <>
              <Typography variant="h6" gutterBottom>
                {edu.degree}
              </Typography>
              <Typography variant="subtitle1" color="primary">
                {edu.institution}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {edu.year} | GPA: {edu.gpa}
              </Typography>
            </>
          )}
        </CardContent>
      </Card>
    ));
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
        {isEditing ? (
          <Box>
            <TextField
              fullWidth
              label="Language"
              name="name"
              value={lang.name}
              onChange={(e) => handleInputChange(e, 'languages', index)}
              variant="outlined"
              size="small"
              sx={{ mb: 1 }}
            />
            <TextField
              fullWidth
              label="Proficiency"
              name="proficiency"
              value={lang.proficiency}
              onChange={(e) => handleInputChange(e, 'languages', index)}
              variant="outlined"
              size="small"
              sx={{ mb: 1 }}
            />
            <Button
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => handleRemoveItem('languages', index)}
              size="small"
            >
              Remove Language
            </Button>
          </Box>
        ) : (
          <>
            <Typography variant="subtitle1">{lang.name}</Typography>
            <Typography variant="body2" color="textSecondary">
              {lang.proficiency}
            </Typography>
          </>
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

    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {profile.certifications.map((cert, index) => (
          isEditing ? (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <TextField
                label="Certification"
                value={cert}
                onChange={(e) => {
                  const newCerts = [...profile.certifications];
                  newCerts[index] = e.target.value;
                  setProfile(prev => ({ ...prev, certifications: newCerts }));
                }}
                variant="outlined"
                size="small"
                sx={{ width: 200 }}
              />
              <IconButton
                color="error"
                onClick={() => handleRemoveItem('certifications', index)}
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ) : (
            <Chip
              key={index}
              label={cert}
              color="primary"
              variant="outlined"
              sx={{ m: 0.5 }}
            />
          )
        ))}
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
        <ProfileHeader elevation={3} sx={{ position: 'relative' }}>
          {!isEditing && (
            <IconButton 
              onClick={handleEditToggle}
              sx={{ 
                position: 'absolute', 
                top: 16, 
                right: 16, 
                color: 'white' 
              }}
            >
              <EditIcon />
            </IconButton>
          )}
          <Grid container spacing={3}>
            <Grid item xs={12} md={3} sx={{ textAlign: 'center' }}>
              <StyledAvatar>{profile.name.charAt(0)}</StyledAvatar>
              {isEditing ? (
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<AttachFileIcon />}
                  sx={{ color: 'white', borderColor: 'white' }}
                >
                  Upload Resume
                  <input type="file" hidden />
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<AttachFileIcon />}
                  sx={{ color: 'white', borderColor: 'white' }}
                >
                  Resume.pdf
                </Button>
              )}
            </Grid>
            <Grid item xs={12} md={9}>
              {isEditing ? (
                <>
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={profile.name}
                    onChange={handleInputChange}
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Job Title"
                    name="title"
                    value={profile.title}
                    onChange={handleInputChange}
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                </>
              ) : (
                <>
                  <Typography variant="h4" gutterBottom>
                    {profile.name}
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    {profile.title}
                  </Typography>
                </>
              )}
              <Stack direction="row" spacing={3} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationIcon sx={{ mr: 1 }} />
                  {profile.location}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <WorkIcon sx={{ mr: 1 }} />
                  {profile.experience} Experience
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LinkedInIcon sx={{ mr: 1 }} />
                  {profile.linkedin}
                </Box>
              </Stack>
              <Stack direction="row" spacing={3}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EmailIcon sx={{ mr: 1 }} />
                  {profile.email}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PhoneIcon sx={{ mr: 1 }} />
                  {profile.phone}
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </ProfileHeader>

        {isEditing ? (
          <Box sx={{ mt: 3, textAlign: 'right' }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleSave}
              startIcon={<SaveIcon />}
            >
              Save Profile
            </Button>
            <Button 
              variant="outlined" 
              color="secondary" 
              onClick={handleEditToggle}
              sx={{ ml: 2 }}
            >
              Cancel
            </Button>
          </Box>
        ) : null}

        <ProfileSection>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <DescriptionIcon sx={{ mr: 1 }} />
            Professional Summary
          </Typography>
          {isEditing ? (
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Summary"
              name="summary"
              value={profile.summary}
              onChange={handleInputChange}
              variant="outlined"
            />
          ) : (
            <Typography variant="body1" paragraph>
              {profile.summary}
            </Typography>
          )}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" color="textSecondary">
                Current CTC
              </Typography>
              {isEditing ? (
                <TextField
                  fullWidth
                  label="Current CTC"
                  name="currentCTC"
                  value={profile.currentCTC}
                  onChange={handleInputChange}
                  variant="outlined"
                  size="small"
                />
              ) : (
                <Typography variant="body1">{profile.currentCTC}</Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" color="textSecondary">
                Expected CTC
              </Typography>
              {isEditing ? (
                <TextField
                  fullWidth
                  label="Expected CTC"
                  name="expectedCTC"
                  value={profile.expectedCTC}
                  onChange={handleInputChange}
                  variant="outlined"
                  size="small"
                />
              ) : (
                <Typography variant="body1">{profile.expectedCTC}</Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" color="textSecondary">
                Notice Period
              </Typography>
              {isEditing ? (
                <TextField
                  fullWidth
                  label="Notice Period"
                  name="noticePeriod"
                  value={profile.noticePeriod}
                  onChange={handleInputChange}
                  variant="outlined"
                  size="small"
                />
              ) : (
                <Typography variant="body1">{profile.noticePeriod}</Typography>
              )}
            </Grid>
          </Grid>
        </ProfileSection>

        <ProfileSection>
          <Typography variant="h6" gutterBottom>
            Key Skills
            {isEditing && (
              <Button 
                startIcon={<AddIcon />} 
                size="small"
                sx={{ ml: 2 }}
              >
                Add Skill
              </Button>
            )}
          </Typography>
          {renderSkills()}
        </ProfileSection>

        <ProfileSection>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <WorkIcon sx={{ mr: 1 }} />
            Work Experience
            {isEditing && (
              <Button 
                startIcon={<AddIcon />} 
                size="small"
                onClick={handleAddExperience}
                sx={{ ml: 2 }}
              >
                Add Experience
              </Button>
            )}
          </Typography>
          {renderWorkExperience()}
        </ProfileSection>

        <ProfileSection>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <SchoolIcon sx={{ mr: 1 }} />
            Education
            {isEditing && (
              <Button 
                startIcon={<AddIcon />} 
                size="small"
                onClick={handleAddEducation}
                sx={{ ml: 2 }}
              >
                Add Education
              </Button>
            )}
          </Typography>
          {renderEducation()}
        </ProfileSection>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <ProfileSection>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                Certifications
                {isEditing && (
                  <Button 
                    startIcon={<AddIcon />} 
                    size="small"
                    onClick={handleAddCertification}
                    sx={{ ml: 2 }}
                  >
                    Add Certification
                  </Button>
                )}
              </Typography>
              {renderCertifications()}
            </ProfileSection>
          </Grid>
          <Grid item xs={12} md={6}>
            <ProfileSection>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <LanguageIcon sx={{ mr: 1 }} />
                Languages
                {isEditing && (
                  <Button 
                    startIcon={<AddIcon />} 
                    size="small"
                    onClick={handleAddLanguage}
                    sx={{ ml: 2 }}
                  >
                    Add Language
                  </Button>
                )}
              </Typography>
              {renderLanguages()}
            </ProfileSection>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default ResumeProfile; 