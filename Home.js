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

const HeroSection = styled(Box)(({ theme }) => ({
  backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.7)), url("https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1500")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
  height: '100vh',
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
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.4) 0%, rgba(147, 51, 234, 0.4) 100%)',
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
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: theme.spacing(3),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'visible',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  '&:hover': {
    transform: 'translateY(-12px)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
}));

const IconWrapper = styled(Box)(({ theme, color }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 84,
  height: 84,
  borderRadius: '24px',
  backgroundColor: color || theme.palette.primary.main,
  marginBottom: theme.spacing(3),
  transform: 'rotate(45deg) translateY(-10px)',
  boxShadow: `0 8px 24px ${color}40 || rgba(0, 0, 0, 0.1)`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '& svg': {
    fontSize: 36,
    color: '#ffffff',
    transform: 'rotate(-45deg)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  '&:hover': {
    transform: 'rotate(45deg) translateY(-14px)',
    boxShadow: `0 12px 28px ${color}60 || rgba(0, 0, 0, 0.15)`,
    '& svg': {
      transform: 'rotate(-45deg) scale(1.1)',
    },
  },
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'transparent',
  boxShadow: 'none',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(8px)',
  height: '80px',
  display: 'flex',
  justifyContent: 'center',
  transition: 'all 0.3s ease',
  '&.scrolled': {
    background: 'rgba(33, 33, 33, 0.95)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  maxWidth: '1200px',
  width: '100%',
  margin: '0 auto',
  padding: '0 24px',
}));

const Logo = styled(Typography)(({ theme }) => ({
  color: theme.palette.common.white,
  fontWeight: 800,
  fontSize: '2rem',
  textDecoration: 'none',
  background: 'linear-gradient(45deg, #fff 30%, #E3F2FD 90%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  letterSpacing: '-0.02em',
  textShadow: '0 2px 10px rgba(0,0,0,0.2)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'scale(1.05)',
    filter: 'brightness(1.2)',
  },
}));

const NavButton = styled(Button)(({ theme }) => ({
  marginLeft: theme.spacing(2),
  borderRadius: '16px',
  padding: '12px 28px',
  textTransform: 'none',
  fontSize: '1rem',
  fontWeight: 600,
  letterSpacing: '0.01em',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&.login': {
    backgroundColor: 'transparent',
    border: '2px solid rgba(255, 255, 255, 0.8)',
    color: '#fff',
    backdropFilter: 'blur(10px)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 24px rgba(255, 255, 255, 0.2)',
    },
  },
  '&.signup': {
    background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    color: '#fff',
    boxShadow: '0 8px 24px rgba(37, 99, 235, 0.25)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 12px 28px rgba(37, 99, 235, 0.35)',
    },
  },
}));

const GradientSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%)',
  color: theme.palette.text.primary,
  padding: theme.spacing(15, 0),
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '120px',
    background: 'linear-gradient(to bottom, #ffffff, transparent)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '120px',
    background: 'linear-gradient(to top, #ffffff, transparent)',
  },
}));

const ProcessStep = styled(motion(Paper))(({ theme }) => ({
  padding: theme.spacing(4),
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  height: '100%',
  position: 'relative',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  '&:hover': {
    transform: 'translateY(-12px)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    '& .step-number': {
      transform: 'scale(1.1)',
      opacity: 0.15,
    },
  },
  '& .step-number': {
    position: 'absolute',
    top: -30,
    left: -20,
    fontSize: '8rem',
    fontWeight: 800,
    opacity: 0.1,
    color: theme.palette.primary.main,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 0,
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
          <Logo component={RouterLink} to="/" sx={{ flexGrow: 1 }}>
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
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography
              variant={isMobile ? 'h3' : 'h1'}
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
                fontWeight: 300
              }}
            >
              Our advanced Applicant Tracking System combines AI technology with intuitive design to streamline your recruitment workflow.
            </Typography>
            <Button
              component={RouterLink}
              to="/signup"
              variant="contained"
              size="large"
              sx={{ 
                borderRadius: '20px',
                padding: '16px 48px',
                fontSize: '1.2rem',
                fontWeight: 600,
                textTransform: 'none',
                background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                boxShadow: '0 8px 24px rgba(37, 99, 235, 0.25)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                letterSpacing: '0.01em',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 12px 28px rgba(37, 99, 235, 0.35)',
                  background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                },
              }}
            >
              Get Started
            </Button>
          </motion.div>
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
                background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
              }}
            >
              Advanced ATS Features
            </Typography>
            <Grid container spacing={4}>
              {atsFeatures.map((feature, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <FeatureCard
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
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
                  <Typography variant="h6" component="h3" gutterBottom>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
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