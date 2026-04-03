// src/components/Menu/styled.tsx
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
    backgroundColor: 'transparent !important',
    height: '70px',
});

export const NavigationAction = styled(BottomNavigationAction)({
    // Колір іконок (світло-сірий)
    color: 'rgba(255, 255, 255, 0.6) !important',
    '&.Mui-selected': {
        color: '#ffffff !important',
    },
    '& .MuiSvgIcon-root': {
        fontSize: '28px',
    }
}) as typeof BottomNavigationAction;