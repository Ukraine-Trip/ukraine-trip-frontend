import { styled } from "@mui/material/styles";
import { AppBar as AppBarMUI, Toolbar as ToolbarMUI, Typography, Button } from "@mui/material";

export const AppBar = styled(AppBarMUI)(({ theme }) => ({
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid #e0e0e0',
    color: '#000',
    paddingTop: 'env(safe-area-inset-top)',
    zIndex: theme.zIndex.drawer + 1,
}));

export const StyledToolbar = styled(ToolbarMUI)(({ theme }) => ({
    justifyContent: 'space-between',
    height: 64,
    [theme.breakpoints.up('md')]: {
        height: 80,
    },
}));


export const LogoText = styled(Typography)({
    fontWeight: 700,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textDecoration: 'none',
    color: 'inherit',
}) as typeof Typography;


export const NavButton = styled(Button)({
    color: '#000',
    fontSize: '0.75rem',
    letterSpacing: 1.5,
    fontWeight: 500,
    textTransform: 'none', // щоб текст не був тільки великими літерами
}) as typeof Button;

export const RegisterButton = styled(Button)({
    backgroundColor: '#000',
    color: '#fff',
    borderRadius: 0,
    fontSize: '0.7rem',
    padding: '6px 20px',
    '&:hover': {
        backgroundColor: '#333',
    },
}) as typeof Button;