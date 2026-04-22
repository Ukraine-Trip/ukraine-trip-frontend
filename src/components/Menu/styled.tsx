import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';

export const MenuPaper = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  bottom: '6px',
  left: '50%',
  transform: 'translateX(-50%)',
  width: 'calc(100% - 32px)',
  maxWidth: '400px',
  borderRadius: '40px',
  overflow: 'hidden',
  boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
  zIndex: 1000,
  backgroundColor: 'rgba(255, 255, 255, 0.75)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',


  [theme.breakpoints.up('md')]: {
    display: 'none',
  },
}));

export const StyledBottomNavigation = styled(BottomNavigation)({
  backgroundColor: 'transparent',
  height: '68px',
});

export const NavigationAction = styled(BottomNavigationAction)(() => ({
  color: '#757575',
  minWidth: 'auto',
  padding: '6px 0',

  '& .MuiSvgIcon-root': {
    fontSize: '28px',
    transition: 'color 0.2s ease-in-out',
  },

  '& .MuiBottomNavigationAction-label': {
    fontSize: '0.65rem',
    marginTop: '4px',
    fontWeight: 500,
    transition: 'all 0.2s ease-in-out',
    '&.Mui-selected': {
      fontSize: '0.65rem',
      fontWeight: 600,
    },
  },

  '&.Mui-selected': {
    color: '#000000',
    '& .MuiSvgIcon-root': {
      color: '#000000',
    },
  },

  '&:hover': {
    backgroundColor: 'transparent',
  },
}));
