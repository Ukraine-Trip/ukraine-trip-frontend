
import { styled } from '@mui/material/styles';
import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';

export const MenuPaper = styled(Paper)(({ theme }) => ({
    display: 'block',
    [theme.breakpoints.up('sm')]: { display: 'none' },
    position: 'fixed',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#302d2c !important',
    borderTopLeftRadius: '24px',
    borderTopRightRadius: '24px',
    overflow: 'hidden',
    zIndex: 100,
    paddingBottom: 'env(safe-area-inset-bottom)',
}));


export const StyledBottomNavigation = styled(BottomNavigation)({
    paddingBottom: 'env(safe-area-inset-bottom)',
    backgroundColor: 'transparent !important',
    height: '70px',
});

export const NavigationAction = styled(BottomNavigationAction)({
    color: 'rgba(255, 255, 255, 0.6) !important',
    transition: 'color 0.25s ease',

    '&.Mui-selected': {
        color: '#ffffff !important',
    },

    '& .MuiSvgIcon-root': {
        fontSize: '28px',
        transition: 'transform 0.1s ease',
    },

    '&:active': {
        color: '#ff2400 !important',
    },
    '&:active .MuiSvgIcon-root': {
        transform: 'scale(1.1)',
    }
}) as typeof BottomNavigationAction;