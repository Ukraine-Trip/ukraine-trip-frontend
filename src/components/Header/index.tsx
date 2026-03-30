import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Box, Container, IconButton, Drawer, List, ListItem,
    ListItemButton, ListItemText, Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';


import { AppBar, StyledToolbar, LogoText, NavButton, RegisterButton } from './styled';

export const Header: React.FC = () => {
    const [mobileOpen, setMobileOpen] = useState(false);

    const navItems = [
        { label: 'Regions', path: '/oblasts' },
        { label: 'Itinerary', path: '/itinerary' },
        { label: "Traveler's Diary", path: '/diary' }
    ];

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

    return (
        <>
            <AppBar position="fixed" elevation={0}>
                <Container maxWidth="xl">
                    <StyledToolbar disableGutters>

                        {/* Logo */}
                        <Box sx={{ flex: 1, display: 'flex' }}>
                            <LogoText variant="h6" component={Link} to="/">
                                UKRAINE TRIP
                            </LogoText>
                        </Box>

                        {/* ДЕСКТОПНЕ МЕНЮ */}
                        <Box sx={{ flex: 2, display: { xs: 'none', md: 'flex' }, justifyContent: 'center', gap: 4 }}>
                            {navItems.map((item) => (
                                <NavButton key={item.label} component={Link} to={item.path}>
                                    {item.label}
                                </NavButton>
                            ))}
                        </Box>

                        {/* ПРАВА ЧАСТИНА */}
                        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <IconButton color="inherit" onClick={handleDrawerToggle} sx={{ display: { md: 'none' } }}>
                                <MenuIcon />
                            </IconButton>

                            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
                                <NavButton component={Link} to="/login" sx={{ fontSize: '0.7rem' }}>
                                    Sign In
                                </NavButton>
                                <RegisterButton variant="contained" component={Link} to="/register">
                                    Register
                                </RegisterButton>
                            </Box>
                        </Box>

                    </StyledToolbar>
                </Container>
            </AppBar>

            {/* МОБІЛЬНЕ МЕНЮ */}
            <Drawer
                anchor="right"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                PaperProps={{ sx: { width: '100%', maxWidth: '280px' } }}
            >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <IconButton onClick={handleDrawerToggle}><CloseIcon /></IconButton>
                </Box>
                <Divider />
                <List sx={{ pt: 2 }}>
                    {navItems.map((item) => (
                        <ListItem key={item.label} disablePadding>
                            <ListItemButton component={Link} to={item.path} onClick={handleDrawerToggle} sx={{ py: 1.5 }}>
                                <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Drawer>
        </>
    );
};

export default Header;
