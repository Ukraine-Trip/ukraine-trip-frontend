import { styled } from "@mui/material/styles";
import { Button, Typography, Box, TextField, Paper, BottomNavigationAction } from "@mui/material";



export const PrimaryButton = styled(Button)({
    backgroundColor: '#000',
    color: '#fff',
    borderRadius: 0,
    padding: '12px 28px',
    fontSize: '0.8rem',
    fontWeight: 600,
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    '&:hover': { backgroundColor: '#333' },
}) as typeof Button;

export const SecondaryButton = styled(Button)({
    backgroundColor: 'transparent',
    color: '#000',
    border: '1px solid #000',
    borderRadius: 0,
    padding: '11px 27px',
    fontSize: '0.8rem',
    fontWeight: 600,
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    '&:hover': { backgroundColor: '#f5f5f5', border: '1px solid #000' }
}) as typeof Button;



export const PageTitle = styled(Typography)(({ theme }) => ({
    fontWeight: 800,
    fontSize: '2.5rem',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    marginBottom: theme.spacing(4),
    [theme.breakpoints.down('sm')]: { fontSize: '1.8rem' },
}));

export const SubTitle = styled(Typography)({
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '4px',
    color: '#999',
    marginBottom: '8px',
});



export const CommonInput = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        borderRadius: 0,
        '& fieldset': { borderColor: '#e0e0e0' },
        '&:hover fieldset': { borderColor: '#000' },
        '&.Mui-focused fieldset': { borderColor: '#000' },
    },
});



// Обгортка для всього контенту сторінки (враховує Хедер та Меню)
export const PageWrapper = styled(Box)(({ theme }) => ({
    paddingTop: 'calc(80px + env(safe-area-inset-top))',
    paddingBottom: '100px',
    minHeight: '100vh',
    [theme.breakpoints.down('md')]: {
        paddingTop: 'calc(64px + env(safe-area-inset-top))',
    },
}));


export const MobileStickyContainer = styled(Paper)(({ theme }) => ({
    display: 'block',
    [theme.breakpoints.up('sm')]: { display: 'none' },
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#302d2c',
    borderTopLeftRadius: '24px',
    borderTopRightRadius: '24px',
    overflow: 'hidden',
    zIndex: 100,
    paddingBottom: 'env(safe-area-inset-bottom)',
}));


export const BaseNavAction = styled(BottomNavigationAction)({
    color: 'rgba(255, 255, 255, 0.6)',
    '&.Mui-selected': { color: '#ffffff !important' },
    '&:active': { color: '#ff2400 !important' },
    '& .MuiSvgIcon-root': { fontSize: '28px' },
    '&:active .MuiSvgIcon-root': { transform: 'scale(1.1)' }
}) as typeof BottomNavigationAction;