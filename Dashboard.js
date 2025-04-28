import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Work as WorkIcon,
  Assignment as AssignmentIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  Public as PublicIcon,
  Group as GroupIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
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
  overflow: 'auto',
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
  height: 'auto',
  minHeight: '380px',
  display: 'flex',
  flexDirection: 'column',
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
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRecruiters: 0,
    totalJobs: 0,
    totalSubmissions: 0,
    totalResumes: 0,
    totalPublicApplications: 0,
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [jobSubmissions, setJobSubmissions] = useState([]);
  const [publicApplications, setPublicApplications] = useState([]);
  const [submissionsChartData, setSubmissionsChartData] = useState([]);
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
      
      const [recruitersResponse, jobsResponse, submissionsResponse, resumesResponse, publicApplicationsResponse] = await Promise.all([
        getRecruiters(),
        getJobs(),
        getSubmissions(),
        getResumes(),
        getPublicApplications()
      ]);

      // Extract data from responses, handling different response formats
      const recruiters = recruitersResponse.data || recruitersResponse || [];
      const jobs = jobsResponse.data || jobsResponse || [];
      const submissions = submissionsResponse.data || submissionsResponse || [];
      const resumes = resumesResponse.data?.resumes || resumesResponse?.resumes || resumesResponse || [];
      const publicApps = publicApplicationsResponse?.data || publicApplicationsResponse || [];

      // Filter out empty resume objects
      const validResumes = Array.isArray(resumes) 
        ? resumes.filter(resume => {
            return resume && 
                   Object.keys(resume).length > 0 && 
                   (resume.name || resume.filename || resume.email);
          })
        : [];

      setStats({
        totalRecruiters: recruiters.length,
        totalJobs: jobs.length,
        totalSubmissions: submissions.length,
        totalResumes: validResumes.length,
        totalPublicApplications: publicApps.length,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  // Calculate job status distribution for pie chart
  const getJobStatusData = () => {
    const statusCounts = {};
    jobSubmissions.forEach(job => {
      const status = job.status || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  };
  
  const fetchRecentActivities = async () => {
    try {
      setLoading(true);
      
      const [jobsResponse, submissionsResponse, publicApplicationsResponse] = await Promise.all([
        getJobs(),
        getSubmissions(),
        getPublicApplications()
      ]);

      // Extract data from responses, handling different response formats
      const jobs = jobsResponse.data || jobsResponse || [];
      const submissions = submissionsResponse.data || submissionsResponse || [];
      const publicApps = publicApplicationsResponse?.data || publicApplicationsResponse || [];

      // Calculate submissions and public applications per job
      const submissionsPerJob = jobs.map(job => {
        const jobId = typeof job._id === 'string' ? job._id : job._id.$oid || String(job._id);
        
        // Match submissions by job_id
        const jobSubmissions = submissions.filter(sub => {
          const subJobId = typeof sub.job_id === 'string' ? sub.job_id : sub.job_id.$oid || String(sub.job_id);
          return subJobId === jobId;
        });
        
        // Match public applications by job_id
        const jobPublicApplications = publicApps.filter(app => {
          const appJobId = typeof app.job_id === 'string' ? app.job_id : app.job_id.$oid || String(app.job_id);
          
          return appJobId === jobId;
        });
        
        const publicCount = jobPublicApplications.length;

        return {
          id: jobId,
          title: job.title,
          client: job.client,
          status: job.status || 'open',
          submissionCount: jobSubmissions.length,
          publicApplicationsCount: publicCount,
          location: job.location || 'N/A',
          created_at: job.created_at || new Date().toISOString(),
        };
      });
      
      // Sort submissions by date (newest first)
      const sortedSubmissionsPerJob = [...submissionsPerJob].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );

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

      setRecentJobs(sortedJobs);
      setRecentSubmissions(submissions.slice(0, 5).map(submission => ({
        ...submission,
        title: submission.candidate_name,
        subtitle: jobs.find(j => {
          const jobId = typeof j._id === 'string' ? j._id : j._id.$oid || String(j._id);
          const subJobId = typeof submission.job_id === 'string' ? submission.job_id : submission.job_id.$oid || String(submission.job_id);
          return jobId === subJobId;
        })?.title || 'Unknown Job',
        icon: <AssignmentIcon />,
        status: submission.status,
        metadata: [
          { icon: <BusinessIcon />, text: submission.candidate_city || 'N/A' },
          { icon: <CalendarIcon />, text: new Date(submission.created_at).toLocaleDateString() }
        ]
      })));
      setJobSubmissions(sortedSubmissionsPerJob);
      setPublicApplications(publicApps);
      
      // Prepare data for the last 5 days submissions chart
      const today = new Date();
      const last5Days = Array.from({ length: 5 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        return date;
      }).reverse();
      
      const chartData = last5Days.map(date => {
        const dateString = date.toISOString().split('T')[0];
        const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        // Count submissions for this date
        const daySubmissions = submissions.filter(sub => {
          const subDate = new Date(sub.created_at).toISOString().split('T')[0];
          return subDate === dateString;
        }).length;
        
        // Count public applications for this date
        const dayPublicApps = publicApps.filter(app => {
          const appDate = new Date(app.created_at).toISOString().split('T')[0];
          return appDate === dateString;
        }).length;
        
        return {
          date: formattedDate,
          submissions: daySubmissions,
          publicApplications: dayPublicApps
        };
      });
      
      setSubmissionsChartData(chartData);
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
      
      // Extract resumes data and filter out empty objects
      const resumesData = resumesResponse.data?.resumes || resumesResponse?.resumes || resumesResponse || [];
      const validResumes = Array.isArray(resumesData) 
        ? resumesData.filter(resume => {
            // Only keep resumes that have actual data
            return resume && 
                   Object.keys(resume).length > 0 && 
                   (resume.name || resume.filename || resume.email);
          })
        : [];

      setResumes(validResumes);
      
      // Update total resumes count in stats
      setStats(prevStats => ({
        ...prevStats,
        totalResumes: validResumes.length
      }));
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

  const statsCardsData = [
    {
      title: 'Total Recruiters',
      value: stats.totalRecruiters || 0,
      icon: <GroupIcon sx={{ fontSize: 40, opacity: 0.9 }} />,
      color: '#4CAF50'
    },
    {
      title: 'Total Jobs',
      value: stats.totalJobs || 0,
      icon: <WorkIcon sx={{ fontSize: 40, opacity: 0.9 }} />,
      color: '#2196F3'
    },
    {
      title: 'Total Submissions',
      value: stats.totalSubmissions || 0,
      icon: <AssignmentIcon sx={{ fontSize: 40, opacity: 0.9 }} />,
      color: '#FF9800'
    },
    {
      title: 'Total Resumes',
      value: stats.totalResumes || 0,
      icon: <DescriptionIcon sx={{ fontSize: 40, opacity: 0.9 }} />,
      color: '#9C27B0'
    },
    {
      title: 'Public Applications',
      value: stats.totalPublicApplications || 0,
      icon: <PublicIcon sx={{ fontSize: 40, opacity: 0.9 }} />,
      color: '#00BCD4'
    }
  ];

  return (
    <StyledContainer>
      <Grid container spacing={3}>
        {statsCardsData.map((card, index) => (
          <Grid item xs={12} sm={6} md={2.4} key={index}>
            <GradientCard
              color={card.color}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {card.icon}
                <Typography variant="h6" sx={{ fontWeight: 500, ml: 2 }}>
                  {card.title}
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 600 }}>
                {card.value}
              </Typography>
            </GradientCard>
          </Grid>
        ))}
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
              <List sx={{ maxHeight: '250px', overflow: 'auto' }}>
                {recentJobs.slice(0, 3).map((job) => (
                  <ListItem key={job.id} sx={{
                    mb: 2,
                    bgcolor: 'rgba(0, 0, 0, 0.02)',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(231, 235, 240, 0.8)',
                    height: '72px',
                    minHeight: '72px',
                    maxHeight: '72px',
                    overflow: 'hidden',
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
                      primary={<Typography noWrap sx={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>{job.title}</Typography>}
                      secondary={<Typography noWrap sx={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>{job.subtitle}</Typography>}
                    />
                    <StyledStatusChip 
                      label={job.status} 
                      status={job.status}
                      size="small"
                      onClick={() => navigate(`/jobs?id=${job.id}`)}
                      sx={{ cursor: 'pointer' }}
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
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Recent Submissions
              <Chip label="View All" color="primary" size="small" onClick={() => navigate('/submissions')} sx={{ cursor: 'pointer' }} />  
            </Typography>
            {recentSubmissions.slice(0, 3).length > 0 ? (
              <List sx={{ maxHeight: '250px', overflow: 'auto' }}>
                {recentSubmissions.slice(0, 3).map((submission) => (
                  <ListItem key={submission.id} sx={{
                    mb: 2,
                    bgcolor: 'rgba(0, 0, 0, 0.02)',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(231, 235, 240, 0.8)',
                    height: '72px',
                    minHeight: '72px',
                    maxHeight: '72px',
                    overflow: 'hidden',
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
                      primary={<Typography noWrap sx={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>{submission.title}</Typography>}
                      secondary={<Typography noWrap sx={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>{submission.subtitle}</Typography>}
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

        {/* <Grid item xs={12} md={6}>
          <ActivityContainer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#333' }}>
              Last 5 Days Submissions
            </Typography>
            {submissionsChartData.length > 0 ? (
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={submissionsChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="submissions" name="Submissions" fill="#2196F3" />
                    <Bar dataKey="publicApplications" name="Public Applications" fill="#00BCD4" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <NoData message="No submission data available" />
            )}
          </ActivityContainer>
        </Grid> */}

        <Grid item xs={12} md={12}>
          <ActivityContainer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Activity Trends
              <Chip label="Last 5 Days" color="primary" variant="outlined" size="small" />  
            </Typography>
            
            {submissionsChartData.length > 0 ? (
              <Box sx={{ height: 300, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={submissionsChartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        border: 'none'
                      }} 
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="submissions" 
                      name="Submissions" 
                      stroke="#2196F3" 
                      fill="#2196F380" 
                      activeDot={{ r: 8 }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="publicApplications" 
                      name="Public Applications" 
                      stroke="#00BCD4" 
                      fill="#00BCD480" 
                      activeDot={{ r: 6 }} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <NoData message="No activity data available" />
            )}
          </ActivityContainer>
        </Grid>

        <Grid item xs={12} md={6}>
          <ActivityContainer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
          >
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Job Status Distribution
              <Chip label="View All Jobs" color="primary" size="small" onClick={() => navigate('/jobs')} sx={{ cursor: 'pointer' }} />
            </Typography>
            
            {jobSubmissions.length > 0 ? (
              <Box sx={{ height: 300, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getJobStatusData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {getJobStatusData().map((entry, index) => {
                        const COLORS = ['#2196F3', '#4CAF50', '#FF9800', '#F44336', '#9C27B0', '#00BCD4'];
                        return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                      })}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value} jobs`, name]}
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        border: 'none'
                      }} 
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <NoData message="No job status data available" />
            )}
          </ActivityContainer>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <ActivityContainer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.8 }}
          >
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Job Submissions Overview
              <Chip label="View All Jobs" color="primary" size="small" onClick={() => navigate('/jobs')} sx={{ cursor: 'pointer' }} />
            </Typography>
            <TableContainer sx={{ maxHeight: 300, overflow: 'auto' }}>
              <Table stickyHeader sx={{ tableLayout: 'fixed', width: '100%' }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ 
                      backgroundColor: '#f5f5f5', 
                      width: '25%', 
                      minWidth: '120px', 
                      maxWidth: '150px',
                      height: '56px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>Job Title</TableCell>
                    <TableCell sx={{ 
                      backgroundColor: '#f5f5f5', 
                      width: '20%', 
                      minWidth: '100px', 
                      maxWidth: '120px',
                      height: '56px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>Client</TableCell>
                    <TableCell sx={{ 
                      backgroundColor: '#f5f5f5', 
                      width: '15%', 
                      minWidth: '80px', 
                      maxWidth: '100px',
                      height: '56px'
                    }}>Status</TableCell>
                    <TableCell align="right" sx={{ 
                      backgroundColor: '#f5f5f5', 
                      width: '20%', 
                      minWidth: '100px', 
                      maxWidth: '120px',
                      height: '56px'
                    }}>Submissions</TableCell>
                    <TableCell align="right" sx={{ 
                      backgroundColor: '#f5f5f5', 
                      width: '20%', 
                      minWidth: '100px', 
                      maxWidth: '120px',
                      height: '56px'
                    }}>Public Applications</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {jobSubmissions.map((job) => (
                    <TableRow
                      key={job.id}
                      sx={{
                        height: '72px',
                        minHeight: '72px',
                        maxHeight: '72px',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.03)',
                        },
                      }}
                    >
                      <TableCell sx={{ 
                        height: '72px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        <Typography noWrap sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {job.title}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ 
                        height: '72px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        <Typography noWrap sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {job.client}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ height: '72px' }}>
                        <StyledStatusChip
                          label={job.status}
                          status={job.status}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ height: '72px' }}>
                        <Chip
                          label={job.submissionCount}
                          color={job.submissionCount > 0 ? "primary" : "default"}
                          size="small"
                          sx={{ minWidth: '60px' }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ height: '72px' }}>
                        <Chip
                          label={job.publicApplicationsCount}
                          color={job.publicApplicationsCount > 0 ? "primary" : "default"}
                          size="small"
                          sx={{ minWidth: '60px' }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
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