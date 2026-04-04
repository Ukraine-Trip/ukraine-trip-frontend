import React from 'react';
import { Typography, Box, Container, Button, Card, CardMedia } from '@mui/material';
import type { CarouselItemData } from './types';

interface CarouselSectionProps {
    carousel: CarouselItemData[];
}

export const CarouselSection: React.FC<CarouselSectionProps> = ({ carousel }) => {
    return (
        <Box className="carousel-section">
            <Container maxWidth="lg" sx={{ pl: { xs: 2, md: 4 }, pr: 0 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h3" component="h3" sx={{ fontWeight: 800, mb: 1 }}>
                        Explore our trips
                    </Typography>
                    <Typography variant="h5" sx={{ color: '#e0e0e0', fontWeight: 300 }}>
                        Incredible, breathtaking sensations
                    </Typography>
                </Box>

                <Box className="carousel-container">
                    {carousel.map((item) => (
                        <Card className="carousel-card" key={item.id}>
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
                        </Card>
                    ))}
                </Box>
            </Container>
        </Box>
    );
};