import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    AppBar, Toolbar, Typography, Box, Button, Container,
    IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

export const Header: React.FC = () => {
    const [mobileOpen, setMobileOpen] = useState(false);

    // Масив з маршрутами
    const navItems = [
        { label: 'Regions', path: '/oblasts' },
        { label: 'Itinerary', path: '/itinerary' },
        { label: "Traveler's Diary", path: '/diary' }
    ];

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <>
            <AppBar position="fixed" elevation={0} sx={{
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid #e0e0e0',
                color: '#000',
                pt: 'env(safe-area-inset-top)'
            }}>
                <Container maxWidth="xl">
                    <Toolbar disableGutters sx={{ height: { xs: 64, md: 80 }, justifyContent: 'space-between' }}>

                        {/*Logo*/}
                        <Box sx={{ flex: 1, display: 'flex' }}>
                            <Typography
                                variant="h6"
                                component={Link} // Тепер логотип — це посилання
                                to="/"
                                sx={{
                                    fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase',
                                    textDecoration: 'none', color: 'inherit'
                                }}
                            >
                                UKRAINE TRIP
                            </Typography>
                        </Box>

                        {/* ДЕСКТОПНЕ МЕНЮ */}
                        <Box sx={{ flex: 2, display: { xs: 'none', md: 'flex' }, justifyContent: 'center', gap: 4 }}>
                            {navItems.map((item) => (
                                <Button
                                    key={item.label}
                                    component={Link}
                                    to={item.path}
                                    sx={{ color: '#000', fontSize: '0.75rem', letterSpacing: 1.5, fontWeight: 500 }}
                                >
                                    {item.label}
                                </Button>
                            ))}
                        </Box>
                        {/* ПРАВА ЧАСТИНА (Авторизація + Бургер) */}
                        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <IconButton color="inherit" onClick={handleDrawerToggle} sx={{ display: { md: 'none' } }}>
                                <MenuIcon />
                            </IconButton>
                            {/* Кнопки авторизації  */}
                            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
                                <Button component={Link} to="/login" sx={{ color: '#000', fontSize: '0.7rem' }}>Sign In</Button>
                                <Button
                                    variant="contained"
                                    component={Link}
                                    to="/register"
                                    sx={{ bgcolor: '#000', color: '#fff', borderRadius: 0 }}
                                >
                                    Register
                                </Button>
                            </Box>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>

            {/* МОБІЛЬНЕ МЕНЮ  */}
            <Drawer anchor="right" open={mobileOpen} onClose={handleDrawerToggle} PaperProps={{ sx: { width: '100%', maxWidth: '280px' } }}>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}><IconButton onClick={handleDrawerToggle}><CloseIcon /></IconButton></Box>
                <Divider />
                <List sx={{ pt: 2 }}>
                    {navItems.map((item) => (
                        <ListItem key={item.label} disablePadding>
                            <ListItemButton
                                component={Link}
                                to={item.path}
                                onClick={handleDrawerToggle}
                                sx={{ py: 1.5 }}
                            >
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