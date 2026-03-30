import React from 'react';
import { AppBar, Toolbar, Typography, Box, Container, Button, Card, CardMedia, CardActionArea } from '@mui/material';
import { styled } from '@mui/material/styles';
import cityCardsData from '../../librarian/images.json';

interface CityCardData {
  id: number;
  cityName: string;
  imageUrl: string;
  linkUrl: string;
}

const HeroSection = styled(Box)(() => ({
  height: '70vh',
  backgroundImage: 'url(/images/hero-kyiv.jpg)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  color: '#fff',
  textAlign: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 1,
  },
  '& > *': { zIndex: 2 },
}));

const CityGridSection = styled(Container)(({ theme }) => ({
  backgroundColor: '#f5f5f5',
  paddingTop: theme.spacing(8),
  paddingBottom: theme.spacing(8),
}));

const CityCardStyled = styled(Card)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': { transform: 'scale(1.02)' },
}));

const CityNameOverlay = styled(Typography)<{ component?: React.ElementType }>(() => ({
  position: 'absolute',
  top: '50%', left: '50%',
  transform: 'translate(-50%, -50%)',
  color: '#fff',
  fontWeight: 'bold',
  letterSpacing: '0.1rem',
  zIndex: 2,
}));

const HomePage: React.FC = () => {
  return (
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="absolute" elevation={0} sx={{ background: 'transparent' }}>
          <Toolbar />
        </AppBar>

        <HeroSection>
          <Typography variant="h2" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Discover Ukraine with us
          </Typography>
          <Typography variant="h5" component="p">Country research site</Typography>
        </HeroSection>

        <CityGridSection maxWidth={false}>
          <Container maxWidth="lg">
            <Typography variant="h4" component="h2" align="center" sx={{ letterSpacing: '0.15rem', textTransform: 'uppercase', mb: 8 }}>
              START YOUR JOURNEY
            </Typography>

            <Box sx={{ display: 'grid', gap: 4, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, mb: 8 }}>
              {(cityCardsData as CityCardData[]).map((city) => (
                  <CityCardStyled key={city.id}>
                    <CardActionArea href={city.linkUrl}>
                      <CardMedia component="img" height="400" image={city.imageUrl} alt={city.cityName} />
                      <CityNameOverlay variant="h3" component="div">{city.cityName}</CityNameOverlay>
                    </CardActionArea>
                  </CityCardStyled>
              ))}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button variant="contained" sx={{ bgcolor: '#000', color: '#fff', px: 6, py: 1.5, '&:hover': { bgcolor: '#333' } }}>
                VIEW MORE
              </Button>
            </Box>
          </Container>
        </CityGridSection>
      </Box>
  );
};

export default HomePage;