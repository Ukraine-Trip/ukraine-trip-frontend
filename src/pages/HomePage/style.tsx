import { styled, keyframes } from '@mui/material/styles';
import { Card, Typography, Box, Button, Container } from '@mui/material';

export const ExploreButton = styled(Button)({
  alignSelf: 'flex-start', // або position: 'absolute', залежно від твого макета
  color: '#fff',
  borderColor: '#fff',
  borderRadius: '2px',
  fontWeight: 'bold',
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});

const showup = keyframes`
  0% { opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { opacity: 0; }
`;

const reveal = keyframes`
  0% { opacity: 0; width: 0; }
  20% { opacity: 1; width: 0; }
  30% { width: 11em; } 
  80% { opacity: 1; }
  100% { opacity: 0; width: 11em; }
`;

export const TitleBlockSection = styled('section')({
  paddingTop: '46px',
  paddingBottom: '26px',
  display: 'flex',
  justifyContent: 'center',
  overflow: 'hidden',
});

export const AnimatedRevealText = styled('div')(({ theme }) => ({
  color: '#555',
  fontWeight: 300,
  letterSpacing: '0.05rem',
  textTransform: 'uppercase',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.5rem',
  [theme.breakpoints.up('sm')]: { fontSize: '2rem' },
  [theme.breakpoints.up('md')]: { fontSize: '2.125rem' },

  '& div': {
    display: 'inline-block',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },

  '& .static-text': {
    animation: `${showup} 7s infinite`,
    fontWeight: 800,
  },

  '& .reveal-wrapper': {
    width: 0,
    animation: `${reveal} 7s infinite`,
    fontWeight: 800,
  },
}));

// --- РЕДИЗАЙН КАРУСЕЛІ ---

export const CarouselSection = styled('section')({
  background: 'linear-gradient(180deg, #1b3224 0%, #122218 100%)',
  color: '#ffffff',
  paddingTop: '40px',
  paddingBottom: '40px',
  overflow: 'hidden',
});

export const CarouselWrapper = styled(Container)(({ theme }) => ({
  paddingRight: 0,
  paddingLeft: '16px',
  [theme.breakpoints.up('md')]: {
    paddingLeft: '32px',
  },
}));

export const CarouselHeader = styled(Box)({
  marginBottom: '25px',
});

export const CarouselSubtitle = styled(Typography)({
  color: '#b0c4b8',
  fontWeight: 400,
  marginTop: '8px',
});

export const CarouselContainer = styled('div')({
  display: 'flex',
  overflowX: 'auto',
  gap: '32px',
  padding: '16px 0 40px 0',
  scrollSnapType: 'x mandatory',
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': { display: 'none' },
});

export const CarouselCard = styled(Card)({
  minWidth: '320px',
  height: '460px',
  position: 'relative',
  scrollSnapAlign: 'start',
  borderRadius: '24px !important',
  overflow: 'hidden',
  flexShrink: 0,
  cursor: 'pointer',
  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  transition: 'transform 0.4s ease, box-shadow 0.4s ease',

  '@media (hover: hover) and (pointer: fine)': {
    '&:hover': {
      transform: 'translateY(-10px)',
      boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
      '& .card-image': { transform: 'scale(1.05)' },
    },
  },

  '& .image-wrapper': {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
  },

  '& .card-image': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.7s ease',
  },

  '& .gradient-overlay': {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '75%',
    background:
      'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)',
    pointerEvents: 'none',
  },

  '& .card-content': {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '32px 24px',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 2,
  },
});

export const LocationBadge = styled(Box)({
  position: 'absolute',
  top: 20,
  right: 20,
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  backdropFilter: 'blur(8px)',
  padding: '6px 16px',
  borderRadius: '20px',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  zIndex: 3,
});

export const BadgeText = styled(Typography)({
  color: '#fff',
  fontWeight: 700,
  letterSpacing: '0.05rem',
  textTransform: 'uppercase',
});

export const DescriptionText = styled(Typography)({
  color: '#fff',
  fontWeight: 800,
  marginBottom: '24px',
  lineHeight: 1.3,
  textShadow: '0px 2px 4px rgba(0,0,0,0.5)',
});

export const HeroSection = styled('section')(() => ({
  height: '70vh',
  backgroundImage:
    "url('https://i.pinimg.com/736x/83/f7/42/83f742c6a773422e37e003b09d163e26.jpg')",
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
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 1,
  },
  '& > *': { zIndex: 2 },
}));

export const CardsSection = styled('section')({
  backgroundColor: '#ffffff',
  paddingTop: '32px',
  paddingBottom: '32px',
});

export const CityCard = styled('div')({
  position: 'relative',
  borderRadius: '30px',
  overflow: 'hidden',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': { transform: 'scale(1.02)' },
});

export const CityNameOverlay = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  color: '#fff',
  fontWeight: 'bold',
  letterSpacing: '0.1rem',
  zIndex: 2,
  fontSize: '2rem',
  [theme.breakpoints.up('sm')]: { fontSize: '2.5rem' },
  [theme.breakpoints.up('md')]: { fontSize: '3rem' },
})) as typeof Typography;
