import React from 'react';
import { AppBar, Toolbar, Typography, Box, Container, Button, Card, CardMedia, CardActionArea } from '@mui/material';
import { styled } from '@mui/material/styles';

import cityCardsData from '../../librarian/images.json';
import carouselData from '../../librarian/carousel.json';

interface CityCardData {
    id: number;
    cityName: string;
    imageUrl: string;
    linkUrl: string;
}

interface CarouselItemData {
    id: number;
    location: string;
    description: string;
    imageUrl: string;
}

const HeroSection = styled(Box)(() => ({
    height: '70vh',
    backgroundImage: 'url(https://i.pinimg.com/736x/83/f7/42/83f742c6a773422e37e003b09d163e26.jpg)',
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

const TitleBlockSection = styled(Box)(({ theme }) => ({
    background: 'rgb(235,236,241)',
    paddingTop: theme.spacing(7),
    paddingBottom: theme.spacing(7),
    fontWeight: 'bold',
}));

const CardsSection = styled(Box)(({ theme }) => ({
    backgroundColor: '#ffffff',
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
}));

const CityCardStyled = styled(Card)(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    transition: 'transform 0.3s ease-in-out',
    '&:hover': { transform: 'scale(1.02)' },
}));

const CityNameOverlay = styled(Typography)<{ component?: React.ElementType }>(({ theme }) => ({
    position: 'absolute',
    top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: '0.1rem',
    zIndex: 2,
    [theme.breakpoints.up('xs')]: { fontSize: '2rem' },
    [theme.breakpoints.up('sm')]: { fontSize: '2.5rem' },
    [theme.breakpoints.up('md')]: { fontSize: '3rem' },
}));

const CarouselSection = styled(Box)(({ theme }) => ({
    backgroundColor: '#1b3224',
    color: '#ffffff',
    paddingTop: theme.spacing(5),
    paddingBottom: theme.spacing(10),
    overflow: 'hidden',
}));

const CarouselContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    overflowX: 'auto',
    gap: theme.spacing(3),
    padding: theme.spacing(2, 0),
    scrollSnapType: 'x mandatory',
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': { display: 'none' },
}));

const CarouselCard = styled(Card)(() => ({
    minWidth: '300px',
    height: '450px',
    position: 'relative',
    scrollSnapAlign: 'start',
    borderRadius: 0,
    overflow: 'hidden',
    flexShrink: 0,
}));

export const HomePage: React.FC = () => {
    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="absolute" elevation={0} sx={{ background: 'transparent' }}>
                <Toolbar />
            </AppBar>

            <HeroSection>
                <Typography variant="h2" component="h1" sx={{ fontWeight: 'bold', mb: 1, fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}>
                    Discover Ukraine with us
                </Typography>
                <Typography variant="h5" component="p" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.75rem' } }}>
                    Country research site
                </Typography>
            </HeroSection>

            <TitleBlockSection>
                <Typography variant="h4" component="h2" align="center" sx={{ letterSpacing: '0.15rem', textTransform: 'uppercase',fontWeight: 800, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
                    START YOUR JOURNEY
                </Typography>
            </TitleBlockSection>

            <CardsSection>
                <Container maxWidth="lg">
                    <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, mb: 3 }}>
                        {(cityCardsData as CityCardData[]).map((city) => (
                            <CityCardStyled key={city.id}>
                                <CardActionArea href={city.linkUrl}>
                                    <CardMedia component="img" height="214" image={city.imageUrl} alt={city.cityName} />
                                    <CityNameOverlay variant="h3" component="div">
                                        {city.cityName}
                                    </CityNameOverlay>
                                </CardActionArea>
                            </CityCardStyled>
                        ))}
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Button variant="contained" sx={{ bgcolor: '#000', color: '#fff', px: 6, py: 1.5, '&:hover': { bgcolor: '#333' } }}>
                            VIEW MORE
                        </Button>
                    </Box>
                </Container>
            </CardsSection>

            <CarouselSection>
                <Container maxWidth="lg" sx={{ pl: { xs: 2, md: 4 }, pr: 0 }}>
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h3" component="h3" sx={{ fontWeight: 800, mb: 1 }}>
                            Choose your place
                        </Typography>
                        <Typography variant="h5" sx={{ color: '#e0e0e0', fontWeight: 300 }}>
                            Incredible, breathtaking sensations
                        </Typography>
                    </Box>

                    <CarouselContainer>
                        {(carouselData as CarouselItemData[]).map((item) => (
                            <CarouselCard key={item.id}>
                                <CardMedia
                                    component="img"
                                    height="100%"
                                    image={item.imageUrl}
                                    alt={item.location}
                                    sx={{ filter: 'brightness(0.85)' }}
                                />

                                <Typography
                                    variant="subtitle1"
                                    sx={{ position: 'absolute', top: 16, right: 16, color: '#fff', fontWeight: 'bold' }}
                                >
                                    {item.location}
                                </Typography>

                                <Box sx={{ position: 'absolute', bottom: 24, left: 24, right: 24 }}>
                                    <Typography
                                        variant="h6"
                                        sx={{ color: '#fff', fontWeight: 'bold', mb: 2, lineHeight: 1.2 }}
                                    >
                                        {item.description}
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        sx={{
                                            color: '#fff',
                                            borderColor: '#fff',
                                            borderRadius: 0,
                                            fontWeight: 'bold',
                                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                                        }}
                                    >
                                        EXPLORE TRIP
                                    </Button>
                                </Box>
                            </CarouselCard>
                        ))}
                    </CarouselContainer>
                </Container>
            </CarouselSection>
        </Box>
    );
};