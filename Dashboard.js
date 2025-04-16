import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Paper,
  useTheme,
} from '@mui/material';
import {
  People as PeopleIcon,
  Work as WorkIcon,
  Assignment as AssignmentIcon,
  Upload as UploadIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import NoData from '../components/NoData';
import { getRecruiters, getJobs, getSubmissions, getResumes, getPublicApplications } from '../services/api';

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  [theme.breakpoints.up('lg')]: {
    maxWidth: '1400px',
  },
}));

const GradientCard = styled(motion(Paper))(({ theme, color }) => ({
  background: `linear-gradient(135deg, ${color}15 0%, ${color}30 100%)`,
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  color: color,
  border: `1px solid ${color}20`,
  boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  transition: 'all 0.3s ease-in-out',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${color}80, ${color})`,
    transition: 'opacity 0.3s ease-in-out',
    opacity: 0,
  },
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: `0 12px 40px ${color}20`,
    '&::before': {
      opacity: 1,
    },
  },
}));

const ActivityContainer = styled(motion(Paper))(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  height: '100%',
  background: '#ffffff',
  boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
  border: '1px solid rgba(231, 235, 240, 0.8)',
  overflow: 'hidden',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
    transform: 'translateY(-5px)',
  },
}));

const StyledChip = styled(Chip)(({ theme, status }) => ({
  borderRadius: theme.spacing(1),
  padding: theme.spacing(0.5),
  height: 24,
  fontSize: '0.75rem',
  fontWeight: 500,
  
  backgroundColor: 
    status === 'Hired' ? 'rgba(46, 204, 113, 0.1)' :
    status === 'Rejected' ? 'rgba(231, 76, 60, 0.1)' :
    status === 'Shortlisted' ? 'rgba(52, 152, 219, 0.1)' :
    status === 'In Review' ? 'rgba(241, 196, 15, 0.1)' :
    status === 'Submitted' ? '#E0F7FA' :
    'rgba(189, 195, 199, 0.1)',
  color:
    status === 'Hired' ? '#27ae60' :
    status === 'Rejected' ? '#c0392b' :
    status === 'Shortlisted' ? '#2980b9' :
    status === 'In Review' ? '#f39c12' :
    status === 'Submitted' ? '#00838F' :
    '#95a5a6',
  border: `1px solid ${
    status === 'Hired' ? 'rgba(46, 204, 113, 0.2)' :
    status === 'Rejected' ? 'rgba(231, 76, 60, 0.2)' :
    status === 'Shortlisted' ? 'rgba(52, 152, 219, 0.2)' :
    status === 'In Review' ? 'rgba(241, 196, 15, 0.2)' :
    status === 'Submitted' ? 'rgba(149, 165, 166, 0.2)' :
    'rgba(189, 195, 199, 0.2)'
  }`,
  '& .MuiChip-label': {
    padding: '0 8px',
  },
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 
      status === 'Hired' ? 'rgba(46, 204, 113, 0.15)' :
      status === 'Rejected' ? 'rgba(231, 76, 60, 0.15)' :
      status === 'Shortlisted' ? 'rgba(52, 152, 219, 0.15)' :
      status === 'In Review' ? 'rgba(241, 196, 15, 0.15)' :
      status === 'Submitted' ? 'rgba(149, 165, 166, 0.15)' :
      'rgba(189, 195, 199, 0.15)',
  }
}));

const StyledStatusChip = styled(Chip)(({ theme, status }) => {
  const getStatusColor = () => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'rgba(46, 204, 113, 0.2)';
      case 'closed':
        return 'rgba(231, 76, 60, 0.15)';
      default:
        return '#757575';
    }
  };

  const getStatusTextColor = () => {
    switch (status?.toLowerCase()) {
      case 'open':
        return '#27ae60';
      case 'closed':
        return '#c0392b';
      default:
        return '#757575';
    }
  };

  return {
    backgroundColor: getStatusColor(),
    color: getStatusTextColor(),
    fontWeight: 500,
    fontSize: '0.75rem',
    textTransform: 'capitalize',
    width: '80px',
    borderRadius: theme.spacing(1),
    border: `0.5px solid ${getStatusColor()}`,
  };
});

const Dashboard = () => {
  const theme = useTheme();
  const [stats, setStats] = useState({
    totalRecruiters: 0,
    totalJobs: 0,
    totalSubmissions: 0,
    totalResumes: 0,
    totalpublicApplications: 0,
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchRecentActivities();
    fetchResumes();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [recruitersResponse, jobsResponse, submissionsResponse, resumesResponse] = await Promise.all([
        getRecruiters(),
        getJobs(),
        getSubmissions(),
        getResumes()
      ]);

      // Extract data from responses, handling different response formats
      const recruiters = recruitersResponse.data || recruitersResponse || [];
      const jobs = jobsResponse.data || jobsResponse || [];
      const submissions = submissionsResponse.data || submissionsResponse || [];
      const resumes = resumesResponse.data?.resumes || resumesResponse?.resumes || resumesResponse || [];

      setStats({
        totalRecruiters: recruiters.length,
        totalJobs: jobs.length,
        totalSubmissions: submissions.length,
        totalResumes: resumes.length,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      setLoading(true);
      const [jobsResponse, submissionsResponse] = await Promise.all([
        getJobs(),
        getSubmissions()
      ]);

      // Extract data from responses, handling different response formats
      const jobs = jobsResponse.data || jobsResponse || [];
      const submissions = submissionsResponse.data || submissionsResponse || [];

      // Sort jobs by created_at in descending order and take latest 5
      const sortedJobs = jobs
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)
        .map(job => ({
          ...job,
          title: job.title,
          subtitle: job.client,
          icon: <WorkIcon />,
          status: job.status || 'open',
          metadata: [
            { icon: <LocationIcon />, text: job.location || 'N/A' },
            { icon: <CalendarIcon />, text: new Date(job.created_at).toLocaleDateString() }
          ]
        }));

      // Sort submissions by created_at in descending order and take latest 5
      const sortedSubmissions = submissions
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)
        .map(submission => ({
          ...submission,
          title: submission.candidate_name,
          subtitle: jobs.find(j => j.id === submission.job_id)?.title || 'Unknown Job',
          icon: <AssignmentIcon />,
          status: submission.status,
          metadata: [
            { icon: <BusinessIcon />, text: submission.candidate_city || 'N/A' },
            { icon: <CalendarIcon />, text: new Date(submission.created_at).toLocaleDateString() }
          ]
        }));

      setRecentJobs(sortedJobs);
      setRecentSubmissions(sortedSubmissions);
    } catch (err) {
      console.error('Error fetching recent activities:', err);
      setError('Failed to load recent activities');
    } finally {
      setLoading(false);
    }
  };

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const resumesResponse = await getResumes();
      
      // Extract resumes data from the response, handling different response formats
      const resumesData = resumesResponse.data?.resumes || resumesResponse?.resumes || resumesResponse || [];
      
      console.log('Fetched resumes:', resumesData);
      setResumes(Array.isArray(resumesData) ? resumesData : []);
    } catch (err) {
      console.error('Error fetching resumes:', err);
      setError('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  return (
    <StyledContainer>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <GradientCard
            color="#2196f3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PeopleIcon sx={{ fontSize: 40, mr: 2, opacity: 0.9 }} />
              <Typography variant="h6" sx={{ fontWeight: 500 }}>Recruiters</Typography>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 600 }}>
              {stats.totalRecruiters}
            </Typography>
          </GradientCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <GradientCard
            color="#4caf50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <WorkIcon sx={{ fontSize: 40, mr: 2, opacity: 0.9 }} />
              <Typography variant="h6" sx={{ fontWeight: 500 }}>Active Jobs</Typography>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 600 }}>
              {stats.totalJobs}
            </Typography>
          </GradientCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <GradientCard
            color="#ff9800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AssignmentIcon sx={{ fontSize: 40, mr: 2, opacity: 0.9 }} />
              <Typography variant="h6" sx={{ fontWeight: 500 }}>Submissions</Typography>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 600 }}>
              {stats.totalSubmissions}
            </Typography>
          </GradientCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <GradientCard
            color="#9c27b0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <UploadIcon sx={{ fontSize: 40, mr: 2, opacity: 0.9 }} />
              <Typography variant="h6" sx={{ fontWeight: 500 }}>Resumes</Typography>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 600 }}>
              {stats.totalResumes}
            </Typography>
          </GradientCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <ActivityContainer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#333' }}>
              Recent Jobs
            </Typography>
            {recentJobs.slice(0, 3).length > 0 ? (
              <List>
                {recentJobs.slice(0, 3).map((job) => (
                  <ListItem key={job.id} sx={{
                    mb: 2,
                    bgcolor: 'rgba(0, 0, 0, 0.02)',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(231, 235, 240, 0.8)',
                    '&:hover': {
                      transform: 'translateX(10px)',
                      bgcolor: 'rgba(0, 0, 0, 0.03)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }
                  }}>
                    <ListItemIcon>
                      <WorkIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={job.title}
                      secondary={job.subtitle}
                    />
                    <StyledStatusChip 
                      label={job.status} 
                      status={job.status}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <NoData message="No recent jobs found" />
            )}
          </ActivityContainer>
        </Grid>

        <Grid item xs={12} md={6}>
          <ActivityContainer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#333' }}>
              Recent Submissions
            </Typography>
            {recentSubmissions.slice(0, 3).length > 0 ? (
              <List>
                {recentSubmissions.slice(0, 3).map((submission) => (
                  <ListItem key={submission.id} sx={{
                    mb: 2,
                    bgcolor: 'rgba(0, 0, 0, 0.02)',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(231, 235, 240, 0.8)',
                    '&:hover': {
                      transform: 'translateX(10px)',
                      bgcolor: 'rgba(0, 0, 0, 0.03)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    },
                  }}>
                    <ListItemIcon>
                      <AssignmentIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={submission.title}
                      secondary={submission.subtitle}
                    />
                    <StyledChip label={submission.status} status={submission.status} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <NoData message="No recent submissions found" />
            )}
          </ActivityContainer>
        </Grid>

        
      </Grid>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setError(null)} 
          severity="error" 
          sx={{ 
            width: '100%',
            backgroundColor: '#ffebee',
            color: '#dc3545',
            '& .MuiAlert-icon': {
              color: '#dc3545',
            },
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </StyledContainer>
  );
};

export default Dashboard; 