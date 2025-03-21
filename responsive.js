import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// Breakpoint values (in px)
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536
};

// Custom hook for responsive design
export const useResponsive = () => {
  const theme = useTheme();
  
  return {
    isMobile: useMediaQuery(theme.breakpoints.down('sm')),
    isTablet: useMediaQuery(theme.breakpoints.between('sm', 'md')),
    isDesktop: useMediaQuery(theme.breakpoints.up('md')),
    isLargeScreen: useMediaQuery(theme.breakpoints.up('lg')),
  };
};

// Responsive spacing utility
export const getResponsiveSpacing = (baseSpacing = 1) => ({
  xs: baseSpacing,
  sm: baseSpacing * 1.5,
  md: baseSpacing * 2,
  lg: baseSpacing * 2.5,
  xl: baseSpacing * 3,
});

// Responsive font sizes
export const responsiveFontSizes = {
  h1: {
    xs: '2rem',
    sm: '2.5rem',
    md: '3rem',
    lg: '3.5rem',
    xl: '4rem',
  },
  h2: {
    xs: '1.75rem',
    sm: '2rem',
    md: '2.5rem',
    lg: '3rem',
    xl: '3.5rem',
  },
  h3: {
    xs: '1.5rem',
    sm: '1.75rem',
    md: '2rem',
    lg: '2.25rem',
    xl: '2.5rem',
  },
  body1: {
    xs: '0.875rem',
    sm: '1rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
  },
}; 