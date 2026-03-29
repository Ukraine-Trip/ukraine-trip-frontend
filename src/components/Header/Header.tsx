import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Button,
    Container,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

export const Header: React.FC = () => {
    const [mobileOpen, setMobileOpen] = useState(false);

    // Дані для навігації (закриваємо AC 2)
    const navItems = [
        { label: 'Places', path: '/oblasts' },
        { label: 'Itinerary', path: '/itinerary' },
        { label: "Traveler's Diary", path: '/diary' }
    ];

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <>
            <AppBar
                position="fixed" // AC 1: Завжди зверху
                elevation={0}
                sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid #e0e0e0',
                    color: '#000',
                    // PWA: Важливо для мобільних пристроїв (щоб не залізало під годинник)
                    pt: 'env(safe-area-inset-top)',
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
            >
                <Container maxWidth="xl">
                    <Toolbar disableGutters sx={{ height: { xs: 64, md: 80 }, justifyContent: 'space-between' }}>

                        {/* ЛОГО (Зліва) */}
                        <Box sx={{ flex: 1, display: 'flex' }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 700,
                                    letterSpacing: 2,
                                    textTransform: 'uppercase',
                                    cursor: 'pointer',
                                    fontSize: { xs: '0.9rem', md: '1.1rem' }
                                }}
                            >
                                UKRAINE TRIP
                            </Typography>
                        </Box>

                        {/* ДЕСКТОПНЕ МЕНЮ (AC 3: Ховаємо на мобільці через display: none) */}
                        <Box sx={{ flex: 2, display: { xs: 'none', md: 'flex' }, justifyContent: 'center', gap: 4 }}>
                            {navItems.map((item) => (
                                <Button
                                    key={item.label}
                                    sx={{ color: '#000', fontSize: '0.75rem', letterSpacing: 1.5, fontWeight: 500 }}
                                >
                                    {item.label}
                                </Button>
                            ))}
                        </Box>

                        {/* ПРАВА ЧАСТИНА (Авторизація + Бургер) */}
                        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: { xs: 1, md: 2 } }}>

                            {/* Кнопки авторизації (AC 3: адаптуємо під екран) */}
                            <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
                                <Button sx={{ color: '#000', fontSize: '0.7rem', fontWeight: 600 }}>
                                    Sign In
                                </Button>
                                <Button
                                    variant="contained"
                                    sx={{
                                        bgcolor: '#000',
                                        color: '#fff',
                                        borderRadius: 0, // Преміальний "квадратний" стиль
                                        fontSize: '0.7rem',
                                        px: 2,
                                        '&:hover': { bgcolor: '#333' }
                                    }}
                                >
                                    Register
                                </Button>
                            </Box>

                            {/* БУРГЕР (AC 3: показуємо тільки на мобільці) */}
                            <IconButton
                                color="inherit"
                                aria-label="open drawer"
                                edge="end"
                                onClick={handleDrawerToggle}
                                sx={{ display: { md: 'none' } }}
                            >
                                <MenuIcon />
                            </IconButton>
                        </Box>

                    </Toolbar>
                </Container>
            </AppBar>

            {/* МОБІЛЬНЕ МЕНЮ (Drawer - AC 3) */}
            <Drawer
                anchor="right"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }} // Краще для SEO
                PaperProps={{
                    sx: { width: '100%', maxWidth: '280px', pt: 'env(safe-area-inset-top)' }
                }}
            >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <IconButton onClick={handleDrawerToggle}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Divider />
                <List sx={{ pt: 2 }}>
                    {navItems.map((item) => (
                        <ListItem key={item.label} disablePadding>
                            <ListItemButton onClick={handleDrawerToggle} sx={{ py: 1.5 }}>
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500, letterSpacing: 1 }}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ px: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Button fullWidth variant="outlined" sx={{ color: '#000', borderColor: '#000', borderRadius: 0 }}>
                            Sign In
                        </Button>
                        <Button fullWidth variant="contained" sx={{ bgcolor: '#000', borderRadius: 0 }}>
                            Register
                        </Button>
                    </Box>
                </List>
            </Drawer>
        </>
    );
};

export default Header;