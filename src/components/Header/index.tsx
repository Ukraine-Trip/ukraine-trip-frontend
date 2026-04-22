import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  IconButton,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

import {
  AppBar,
  StyledToolbar,
  LogoText,
  NavButton,
  BurgerIconButton,
} from './styled';
import { PrimaryButton } from '../../style/common.tsx';

export const Header: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: 'Regions', path: '/create-route' },
    { label: 'Itinerary', path: '/itinerary' },
    { label: "Traveler's Diary", path: '/diary' },
  ];

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  return (
    <>
      <AppBar position="fixed" elevation={0}>
        <Container maxWidth="xl">
          <StyledToolbar disableGutters>
            {/* Logo - Видно завжди */}
            <Box sx={{ flex: 1, display: 'flex' }}>
              <LogoText variant="h6" component={Link} to="/">
                UKRAINE TRIP
              </LogoText>
            </Box>

            {/* Десктопні посилання - тільки на MD (900px+) */}
            <Box
              sx={{
                flex: 2,
                display: { xs: 'none', md: 'flex' },
                justifyContent: 'center',
                gap: 4,
              }}
            >
              {navItems.map((item) => (
                <NavButton key={item.label} component={Link} to={item.path}>
                  {item.label}
                </NavButton>
              ))}
            </Box>

            {/* Права частина: Бургер та Кнопки */}
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}
            >
              {/* Бургер - Тільки на Планшеті та Десктопі */}
              <BurgerIconButton onClick={handleDrawerToggle}>
                <MenuIcon />
              </BurgerIconButton>

              {/* Кнопки входу - Тільки на Десктопі */}
              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, ml: 2 }}>
                <NavButton
                  component={Link}
                  to="/login"
                  sx={{ fontSize: '0.7rem' }}
                >
                  Sign In
                </NavButton>
                <PrimaryButton
                  variant="contained"
                  component={Link}
                  to="/register"
                >
                  Register
                </PrimaryButton>
              </Box>
            </Box>
          </StyledToolbar>
        </Container>
      </AppBar>

      {/* Сайдбар (Drawer) */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        PaperProps={{ sx: { width: '100%', maxWidth: '280px' } }}
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
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={handleDrawerToggle}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
};
