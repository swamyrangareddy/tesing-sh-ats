import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Typography,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Work as WorkIcon,
  Assignment as AssignmentIcon,
  Upload as UploadIcon,
  Assessment as AssessmentIcon,
  Search as SearchIcon,
  Menu as MenuIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  borderBottom: '1px solid rgba(231, 235, 240, 0.8)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
}));

const NavButton = styled(Button)(({ theme, active }) => ({
  color: active ? theme.palette.primary.main : '#64748B',
  backgroundColor: active ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
  borderRadius: '12px',
  padding: '8px 16px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',

  '&:hover': {
    backgroundColor: active ? 'rgba(37, 99, 235, 0.12)' : 'rgba(100, 116, 139, 0.08)',
    transform: 'translateY(-2px)',
    '&::after': {
      transform: 'scaleX(1)',
    },
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 4,
    right: 4,
    height: '3px',
    background: 'linear-gradient(90deg, #3D82F6, #2563EB)',
    transform: active ? 'scaleX(1)' : 'scaleX(0)',
    transformOrigin: 'center',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
}));

const StyledMenuItem = styled(MenuItem)(({ theme, active }) => ({
  color: active ? theme.palette.primary.main : '#64748B',
  backgroundColor: active ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
  borderRadius: '12px',
  margin: '4px 8px',
  padding: '10px 16px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    backgroundColor: active ? 'rgba(37, 99, 235, 0.12)' : 'rgba(100, 116, 139, 0.08)',
    transform: 'translateX(4px)',
  },
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  background: 'linear-gradient(45deg, #2196f3, #1976d2)',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
  },
}));

const BrandText = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  background: 'linear-gradient(45deg, #2196f3, #1976d2)',
  
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const navItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { label: 'Recruiters', icon: <PeopleIcon />, path: '/recruiters' },
  { label: 'Jobs', icon: <WorkIcon />, path: '/jobs' },
  { label: 'Submissions', icon: <AssignmentIcon />, path: '/submissions' },
  { label: 'Resume Upload', icon: <UploadIcon />, path: '/resume-upload' },
  { label: 'ATS Score', icon: <AssessmentIcon />, path: '/ats-score' },
  { label: 'Resume Search', icon: <SearchIcon />, path: '/search' },
  { label: 'Profiles', icon: <PeopleIcon />, path: '/profiles' },
];

const Navbar = () => {
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const { logout, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleNavigation = (path) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    console.log('Navigating to:', path);
    navigate(path);
    handleMobileMenuClose();
  };

  const handleLogout = () => {
    logout();
    handleUserMenuClose();
    navigate('/login');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const renderNavItems = () => {
    return navItems.map((item) => (
      <NavButton
        key={item.label}
        startIcon={item.icon}
        onClick={() => handleNavigation(item.path)}
        active={location.pathname === item.path}
        component={motion.div}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {item.label}
      </NavButton>
    ));
  };

  const drawer = (
    <Box
      sx={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(250,252,255,0.95) 100%)',
        height: '100%',
        backdropFilter: 'blur(10px)',
      }}
    >
      <List>
        {navItems.map((item) => (
          <ListItem
            button
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            selected={location.pathname === item.path}
            sx={{
              borderRadius: '12px',
              margin: '4px 8px',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.12)',
                transform: 'translateX(4px)',
              },
              '&.Mui-selected': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.12)',
                },
              },
            }}
          >
            <ListItemIcon 
              sx={{ 
                color: location.pathname === item.path ? 'primary.main' : '#666',
                transition: 'color 0.3s ease',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.label}
              sx={{
                color: location.pathname === item.path ? 'primary.main' : '#666',
                transition: 'color 0.3s ease',
              }}
            />
          </ListItem>
        ))}
        <ListItem
          button
          onClick={handleLogout}
          sx={{
            borderRadius: '12px',
            margin: '4px 8px',
            color: '#666',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: 'rgba(211, 47, 47, 0.08)',
              color: '#d32f2f',
              transform: 'translateX(4px)',
            },
          }}
        >
          <ListItemIcon sx={{ color: 'inherit' }}><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <StyledAppBar position="sticky">
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 200 }}>
          <IconButton
            edge="start"
            aria-label="menu"
            onClick={handleMobileMenuOpen}
            sx={{
              mr: 2,
              display: { sm: 'none' },
              color: '#666',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
              },
            }}
          >
            <MenuIcon />
          </IconButton>
          <BrandText
            variant="h6"
            component={motion.div}
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/dashboard')}
          >
            ATS System
          </BrandText>
        </Box>

        <Box 
          sx={{ 
            display: { xs: 'none', sm: 'flex' }, 
            alignItems: 'center',
            flexGrow: 1,
            justifyContent: 'center',
            gap: 1,
          }}
        >
          {renderNavItems()}
        </Box>

        <Box sx={{ minWidth: 200, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <UserAvatar onClick={handleUserMenuOpen}>
              {user?.email?.[0]?.toUpperCase()}
            </UserAvatar>
          </motion.div>
          <Menu
            anchorEl={userMenuAnchor}
            open={Boolean(userMenuAnchor)}
            onClose={handleUserMenuClose}
            PaperProps={{
              sx: {
                mt: 1,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(231, 235, 240, 0.8)',
              },
            }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="body2" sx={{ color: '#666' }}>
                {user?.email}
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <StyledMenuItem
              onClick={handleLogout}
              sx={{
                color: '#d32f2f',
                '&:hover': {
                  backgroundColor: 'rgba(211, 47, 47, 0.08)',
                },
              }}
            >
              <LogoutIcon sx={{ mr: 1 }} />
              Logout
            </StyledMenuItem>
          </Menu>
        </Box>

        <Menu
          anchorEl={mobileMenuAnchor}
          open={Boolean(mobileMenuAnchor)}
          onClose={handleMobileMenuClose}
          PaperProps={{
            sx: {
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(231, 235, 240, 0.8)',
            },
          }}
        >
          {navItems.map((item) => (
            <StyledMenuItem
              key={item.label}
              onClick={() => handleNavigation(item.path)}
              active={location.pathname === item.path}
            >
              {item.icon}
              <Typography sx={{ ml: 1 }}>{item.label}</Typography>
            </StyledMenuItem>
          ))}
        </Menu>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Navbar; 