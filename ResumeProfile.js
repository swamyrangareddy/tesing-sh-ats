import React, { useState } from 'react';
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
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

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

const ResumeProfile = () => {
  const [profile] = useState({
    name: 'John Smith',
    title: 'Senior Full Stack Developer',
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/johnsmith',
    experience: '8 years',
    currentCTC: '$120,000',
    expectedCTC: '$150,000',
    noticePeriod: '2 months',
    summary: 'Experienced Full Stack Developer with 8+ years of expertise in building scalable web applications. Proficient in React, Node.js, and cloud technologies. Led multiple successful projects and mentored junior developers.',
    skills: [
      { name: 'React.js', level: 90 },
      { name: 'Node.js', level: 85 },
      { name: 'Python', level: 80 },
      { name: 'AWS', level: 75 },
      { name: 'Docker', level: 85 },
      { name: 'MongoDB', level: 80 },
    ],
    workExperience: [
      {
        role: 'Senior Full Stack Developer',
        company: 'Tech Solutions Inc.',
        duration: 'Jan 2020 - Present',
        location: 'San Francisco, CA',
        achievements: [
          'Led a team of 5 developers in building a cloud-native e-commerce platform',
          'Improved application performance by 40% through optimization',
          'Implemented CI/CD pipeline reducing deployment time by 60%',
        ],
      },
      {
        role: 'Full Stack Developer',
        company: 'Digital Innovations Ltd.',
        duration: 'Mar 2017 - Dec 2019',
        location: 'Boston, MA',
        achievements: [
          'Developed and maintained multiple client-facing applications',
          'Reduced server costs by 30% through architecture optimization',
          'Mentored 3 junior developers',
        ],
      },
    ],
    education: [
      {
        degree: 'Master of Science in Computer Science',
        institution: 'Stanford University',
        year: '2015-2017',
        gpa: '3.8/4.0',
      },
      {
        degree: 'Bachelor of Science in Computer Engineering',
        institution: 'University of California, Berkeley',
        year: '2011-2015',
        gpa: '3.9/4.0',
      },
    ],
    certifications: [
      'AWS Certified Solutions Architect',
      'Google Cloud Professional Developer',
      'MongoDB Certified Developer',
    ],
    languages: [
      { name: 'English', proficiency: 'Native' },
      { name: 'Spanish', proficiency: 'Professional' },
      { name: 'French', proficiency: 'Intermediate' },
    ],
  });

  return (
    <ProfileContainer maxWidth="lg">
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
                startIcon={<AttachFileIcon />}
                sx={{ color: 'white', borderColor: 'white' }}
              >
                Resume.pdf
              </Button>
            </Grid>
            <Grid item xs={12} md={9}>
              <Typography variant="h4" gutterBottom>
                {profile.name}
              </Typography>
              <Typography variant="h6" gutterBottom>
                {profile.title}
              </Typography>
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

        <ProfileSection>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <DescriptionIcon sx={{ mr: 1 }} />
            Professional Summary
          </Typography>
          <Typography variant="body1" paragraph>
            {profile.summary}
          </Typography>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" color="textSecondary">
                Current CTC
              </Typography>
              <Typography variant="body1">{profile.currentCTC}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" color="textSecondary">
                Expected CTC
              </Typography>
              <Typography variant="body1">{profile.expectedCTC}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" color="textSecondary">
                Notice Period
              </Typography>
              <Typography variant="body1">{profile.noticePeriod}</Typography>
            </Grid>
          </Grid>
        </ProfileSection>

        <ProfileSection>
          <Typography variant="h6" gutterBottom>
            Key Skills
          </Typography>
          <Grid container spacing={2}>
            {profile.skills.map((skill, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">{skill.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {skill.level}%
                    </Typography>
                  </Box>
                  <ProgressBar
                    variant="determinate"
                    value={skill.level}
                    sx={{
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: `hsl(${skill.level * 1.2}, 70%, 50%)`,
                      },
                    }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </ProfileSection>

        <ProfileSection>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <WorkIcon sx={{ mr: 1 }} />
            Work Experience
          </Typography>
          {profile.workExperience.map((exp, index) => (
            <ExperienceCard key={index}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {exp.role}
                </Typography>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  {exp.company}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {exp.duration} | {exp.location}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {exp.achievements.map((achievement, i) => (
                    <Typography key={i} variant="body2" sx={{ mb: 1 }}>
                      • {achievement}
                    </Typography>
                  ))}
                </Box>
              </CardContent>
            </ExperienceCard>
          ))}
        </ProfileSection>

        <ProfileSection>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <SchoolIcon sx={{ mr: 1 }} />
            Education
          </Typography>
          {profile.education.map((edu, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {edu.degree}
                </Typography>
                <Typography variant="subtitle1" color="primary">
                  {edu.institution}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {edu.year} | GPA: {edu.gpa}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </ProfileSection>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <ProfileSection>
              <Typography variant="h6" gutterBottom>
                Certifications
              </Typography>
              {profile.certifications.map((cert, index) => (
                <Chip
                  key={index}
                  label={cert}
                  color="primary"
                  variant="outlined"
                  sx={{ m: 0.5 }}
                />
              ))}
            </ProfileSection>
          </Grid>
          <Grid item xs={12} md={6}>
            <ProfileSection>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <LanguageIcon sx={{ mr: 1 }} />
                Languages
              </Typography>
              {profile.languages.map((lang, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1">{lang.name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {lang.proficiency}
                  </Typography>
                </Box>
              ))}
            </ProfileSection>
          </Grid>
        </Grid>
      </motion.div>
    </ProfileContainer>
  );
};

export default ResumeProfile; 