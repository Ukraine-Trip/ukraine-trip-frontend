import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
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
import { AuthContext } from '../../context/AuthContext.tsx';

export const Header: React.FC = () => {
  const { user, token, logout } = useContext(AuthContext);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  // ОНОВЛЕНИЙ МАСИВ КНОПОК
  const navItems = [
    { label: 'Regions', path: '/create-route' },
    { label: 'Trips', path: '/trips' }, // Публічна кнопка для всіх маршрутів
    { label: 'Itinerary', path: '/itinerary', private: true },
    { label: 'My Trips', path: '/my-trips', private: true }, // Тільки для своїх
  ];

  const isAuthenticated = Boolean(token);
  const displayName = user?.full_name || user?.email || 'User';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part[0].toUpperCase())
    .join('') || 'U';

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const handleAccountClick = () => {
    handleMenuClose();
    navigate('/account');
  };

  return (
    <>
      <AppBar position="fixed" elevation={0}>
        <Container maxWidth="xl">
          <StyledToolbar disableGutters>
            <Box sx={{ flex: 1, display: 'flex' }}>
              <LogoText variant="h6" component={Link} to="/">
                UKRAINE TRIP
              </LogoText>
            </Box>

            <Box
              sx={{
                flex: 2,
                display: { xs: 'none', md: 'flex' },
                justifyContent: 'center',
                gap: 4,
              }}
            >
              {navItems
                .filter((item) => !item.private || isAuthenticated)
                .map((item) => (
                  <NavButton key={item.label} component={Link} to={item.path}>
                    {item.label}
                  </NavButton>
                ))}
            </Box>

            <Box
              sx={{
                flex: 1,
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}
            >
              <BurgerIconButton onClick={handleDrawerToggle}>
                <MenuIcon />
              </BurgerIconButton>

              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, ml: 2, alignItems: 'center' }}>
                {isAuthenticated ? (
                  <>
                    <Tooltip title={displayName}>
                      <IconButton onClick={handleMenuOpen} size="small" sx={{ p: 0 }}>
                        <Avatar>{initials}</Avatar>
                      </IconButton>
                    </Tooltip>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleMenuClose}
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                      <MenuItem onClick={handleAccountClick}>Account</MenuItem>
                      <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </Menu>
                  </>
                ) : (
                  <>
                    <NavButton component={Link} to="/login" sx={{ fontSize: '0.7rem' }}>
                      Sign In
                    </NavButton>
                    <PrimaryButton variant="contained" component={Link} to="/register">
                      Register
                    </PrimaryButton>
                  </>
                )}
              </Box>
            </Box>
          </StyledToolbar>
        </Container>
      </AppBar>

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
          {navItems
            .filter((item) => !item.private || isAuthenticated)
            .map((item) => (
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
          {isAuthenticated ? (
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  handleDrawerToggle();
                  logout();
                  navigate('/');
                }}
              >
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          ) : (
            <>
              <ListItem disablePadding>
                <ListItemButton component={Link} to="/login" onClick={handleDrawerToggle}>
                  <ListItemText primary="Sign In" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton component={Link} to="/register" onClick={handleDrawerToggle}>
                  <ListItemText primary="Register" />
                </ListItemButton>
              </ListItem>
            </>
          )}
        </List>
      </Drawer>
    </>
  );
};