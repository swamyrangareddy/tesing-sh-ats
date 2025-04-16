import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  useTheme,
  useMediaQuery,
  Paper,
} from '@mui/material';
import {
  Work as WorkIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Upload as UploadIcon,
  CloudUpload,
  Analytics,
  Search,
  Assessment,
  Group,
  Timeline,
  Speed,
  Security,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import animationData from '../assets/animations/Animation - 1743156441748.json';
import animationData2 from '../assets/animations/Animation - 1743158348579.json';
import animationData3 from '../assets/animations/Animation - 1743158522363.json';

const HeroSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 90%)',
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

    opacity: 0.1,
  },
}));

const HeroContent = styled(Container)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  color: theme.palette.common.white,
  textAlign: 'center',
}));

const FeatureCard = styled(motion(Card))(({ theme }) => ({
  height: '100%',
  background: '#ffffff',
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease',
  border: '1px solid rgba(25, 118, 210, 0.1)',
  boxShadow: '0 4px 20px rgba(25, 118, 210, 0.08)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 28px rgba(25, 118, 210, 0.15)',
    border: '1px solid rgba(25, 118, 210, 0.2)',
  },
}));
const IconWrapper = styled(Box)(({ theme }) => ({
  width: 60,
  height: 60,
  borderRadius: '15px',
  background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 90%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto', // Center the icon horizontally
  marginBottom: theme.spacing(2),
  '& svg': {
    fontSize: 28,
    color: '#ffffff',
  },
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: '#F0F8FF',
  boxShadow: '0 2px 12px rgba(25, 118, 210, 0.2)',
  height: '70px',
  display: 'flex',
  justifyContent: 'center',
  position: 'fixed',
  zIndex: 1200,
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  maxWidth: '1200px',
  width: '100%',
  margin: '0 auto',
  padding: theme.spacing(0, 3),
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const Logo = styled(Typography)(({ theme }) => ({
  color: theme.palette.common.white,
  fontWeight: 800,
  fontSize: '1.8rem',
  textDecoration: 'none',
  letterSpacing: '-0.02em',
  transition: 'all 0.3s ease',
  '&:hover': {

    transform: 'scale(1.02)',
    textShadow: '0 2px 8px rgba(255,255,255,0.2)',
  },
}));

const NavButton = styled(Button)(({ theme }) => ({
  marginLeft: theme.spacing(2),
  borderRadius: '8px',
  padding: '8px 24px',
  textTransform: 'none',
  fontSize: '0.95rem',
  fontWeight: 600,
  letterSpacing: '0.01em',
  transition: 'all 0.3s ease',
  '&.login': {
    background: theme.palette.primary.main,
    color: '#fff',
    border: '1px solid rgba(25, 118, 210, 0.1)',
    '&:hover': {
      backgroundColor: '#fff',
      border: '2px solid #1976d2',
      color: theme.palette.primary.main,
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
    },
  },
  '&.signup': {
    background:  theme.palette.primary.main,
    color:'#fff',
    '&:hover': {
      backgroundColor: '#fff',
      border: '2px solid #1976d2',
      color: theme.palette.primary.main,
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
    },
  },
}));

const GradientSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(180deg, #ffffff 0%, #f5f9ff 90%)',
  padding: theme.spacing(15, 0),
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '80px',
    background: 'linear-gradient(to bottom, #ffffff, transparent)',
  },
}));

const ProcessStep = styled(motion(Paper))(({ theme }) => ({
  padding: theme.spacing(4),
  background: '#ffffff',
  borderRadius: theme.spacing(2),
  border: '1px solid rgba(25, 118, 210, 0.1)',
  boxShadow: '0 4px 20px rgba(25, 118, 210, 0.08)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 28px rgba(25, 118, 210, 0.15)',
    border: '1px solid rgba(25, 118, 210, 0.2)',
    '& .step-number': {
      color: '#1976d2',
      opacity: 0.15,
    },
  },
}));


const HeroButton = styled(Button)(({ theme }) => ({
  borderRadius: '30px',
  padding: '12px 36px',
  fontSize: '1.1rem',
  fontWeight: 600,
  textTransform: 'none',
  background: '#1976d2',
  color: '#ffffff',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  '&:hover': {
    background: '#f8f9fa',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
  },
}));

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const mainFeatures = [
    {
      icon: <WorkIcon />,
      title: 'Job Management',
      description: 'Efficiently manage job postings, requirements, and applications in one place.',
    },
    {
      icon: <PeopleIcon />,
      title: 'Recruiter Portal',
      description: 'Dedicated space for recruiters to manage candidates and track submissions.',
    },
    {
      icon: <AssignmentIcon />,
      title: 'Submission Tracking',
      description: 'Track and manage candidate submissions with detailed status updates.',
    },
    {
      icon: <UploadIcon />,
      title: 'Resume Management',
      description: 'Upload, store, and analyze resumes with our advanced ATS system.',
    },
  ];

  const atsFeatures = [
    {
      icon: <CloudUpload />,
      title: 'Smart Resume Upload',
      description: 'Upload resumes in multiple formats (PDF, DOCX). Our system automatically extracts and organizes key information.',
      color: '#2196f3',
    },
    {
      icon: <Analytics />,
      title: 'AI-Powered Analysis',
      description: 'Advanced AI algorithms analyze resumes to match candidates with job requirements and provide comprehensive insights.',
      color: '#4caf50',
    },
    {
      icon: <Search />,
      title: 'Intelligent Search',
      description: 'Powerful search capabilities to find the right candidates based on skills, experience, and qualifications.',
      color: '#9c27b0',
    },
    {
      icon: <Assessment />,
      title: 'ATS Scoring',
      description: 'Automated scoring system to evaluate resumes against job requirements and identify the best matches.',
      color: '#ff9800',
    },
    {
      icon: <Group />,
      title: 'Team Collaboration',
      description: 'Streamlined collaboration tools for recruiters and hiring managers to work together efficiently.',
      color: '#f44336',
    },
    {
      icon: <Security />,
      title: 'Secure & Compliant',
      description: 'Enterprise-grade security and compliance features to protect sensitive candidate data.',
      color: '#607d8b',
    },
  ];

  const processSteps = [
    {
      icon: <CloudUpload />,
      title: 'Resume Upload',
      description: 'Upload candidate resumes in various formats',
    },
    {
      icon: <Analytics />,
      title: 'AI Analysis',
      description: 'Automatic extraction and analysis of resume data',
    },
    {
      icon: <Assessment />,
      title: 'Candidate Scoring',
      description: 'Evaluate candidates against job requirements',
    },
    {
      icon: <Timeline />,
      title: 'Track Progress',
      description: 'Monitor recruitment pipeline and status',
    },
  ];

  return (
    <Box>
      <StyledAppBar position="fixed">
        <StyledToolbar>
          <Logo component={RouterLink} to="/" sx={{ flexGrow: 1 , color: theme.palette.primary.main}}>
            ATS System
          </Logo>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <NavButton
              component={RouterLink}
              to="/login"
              variant="outlined"
              className="login"
            >
              Login
            </NavButton>
            <NavButton
              component={RouterLink}
              to="/signup"
              variant="contained"
              className="signup"
            >
              Sign Up
            </NavButton>
          </Box>
        </StyledToolbar>
      </StyledAppBar>

      <HeroSection>
        <HeroContent>
          <Grid container alignItems="center" spacing={4}>
            <Grid item xs={12} md={6}>
              <Lottie 
                animationData={animationData} 
                style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }} 
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography
                  variant={isMobile ? 'h4' : 'h3'}
                  component="h1"
                  gutterBottom
                  sx={{ 
                    fontWeight: 800,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                    color: 'white',
                    mb: 3,
                    letterSpacing: '-1px'
                  }}
                >
                  Transform Your Hiring Process
                </Typography>
                <Typography
                  variant={isMobile ? 'h6' : 'h4'}
                  sx={{ 
                    mb: 6, 
                    maxWidth: '800px', 
                    mx: 'auto',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                    color: 'white',
                    fontWeight: 200,
                    fontSize: '1.8rem',
                  }}
                >
                  Our advanced Applicant Tracking System combines AI technology with intuitive design to streamline your recruitment workflow.
                </Typography>
                <HeroButton
                  component={RouterLink}
                  to="/signup"
                  variant="contained"
                  size="large"
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                  }}
                >
                  Get Started
                </HeroButton>
              </motion.div>
            </Grid>
          </Grid>
        </HeroContent>
      </HeroSection>

      <Container sx={{ py: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Typography
            variant="h4"
            component="h2"
            align="center"
            gutterBottom
            sx={{ 
              mb: 6,
              fontWeight: 700,
              color: theme.palette.primary.main
            }}
          >
            Key Features
          </Typography>
          <Lottie 
            animationData={animationData2} 
            style={{ width: '300px', margin: '0 auto', marginBottom: '20px' }} 
          />
          <Grid container spacing={4}>
            {mainFeatures.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <FeatureCard
                  elevation={3}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <IconWrapper>
                      {feature.icon}
                    </IconWrapper>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </FeatureCard>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>

      <GradientSection>
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography
              variant="h3"
              component="h2"
              align="center"
              gutterBottom
              sx={{ 
                mb: 6,
                fontWeight: 800,
                background: 'linear-gradient(135deg, #1E293B 0%, #334155 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
              }}
            >
              Advanced ATS Features
            </Typography>
            <Lottie 
              animationData={animationData3} 
              style={{ width: '300px', margin: '0 auto', marginBottom: '20px' }} 
            />
            <Grid container spacing={4}>
              {atsFeatures.map((feature, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <FeatureCard
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    elevation={3}
                  >
                    <CardContent sx={{ textAlign: 'center' }}>
                      <IconWrapper sx={{ bgcolor: feature.color }}>
                        {feature.icon}
                      </IconWrapper>
                      <Typography variant="h5" component="h3" gutterBottom>
                        {feature.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </FeatureCard>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Container>
      </GradientSection>

      <Container sx={{ py: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Typography
            variant="h3"
            component="h2"
            align="center"
            gutterBottom
            sx={{ 
              mb: 6,
              fontWeight: 800,
              background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}
          >
            How It Works
          </Typography>
          <Grid container spacing={4}>
            {processSteps.map((step, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <ProcessStep
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  elevation={3}
                >
                  <IconWrapper>
                    {step.icon}
                  </IconWrapper>
                  <Typography variant="h6" sx={{textAlign: 'center'}} component="h3" gutterBottom>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" sx={{textAlign: 'center'}} color="text.secondary">
                    {step.description}
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      position: 'absolute',
                      top: -20,
                      left: -10,
                      opacity: 0.1,
                      fontSize: '5rem',
                      fontWeight: 'bold',
                    }}
                  >
                    {index + 1}
                  </Typography>
                </ProcessStep>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>

      <Container sx={{ py: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Typography
            variant="h3"
            component="h2"
            align="center"
            gutterBottom
            sx={{ 
              mb: 6,
              fontWeight: 800,
              background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}
          >
            Why Choose Our ATS?
          </Typography>
          <Grid container spacing={4}>
            {[
              {
                icon: <Speed />,
                title: 'Fast & Efficient',
                description: 'Reduce time-to-hire by up to 50% with our streamlined processes',
              },
              {
                icon: <Analytics />,
                title: 'Data-Driven Decisions',
                description: 'Make informed hiring decisions based on comprehensive analytics',
              },
              {
                icon: <Security />,
                title: 'Enterprise Security',
                description: 'Bank-grade security to protect your sensitive recruitment data',
              },
            ].map((item, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                    <IconWrapper>
                      {item.icon}
                    </IconWrapper>
                    <Typography variant="h6" gutterBottom>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Home;
