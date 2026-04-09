import { styled } from '@mui/material/styles';
import { Typography } from '@mui/material';

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
  '& > *': {
    zIndex: 2,
  },
}));

export const TitleBlockSection = styled('section')({
  background: 'rgb(235, 236, 241)',
  paddingTop: '56px',
  paddingBottom: '56px',
  fontWeight: 'bold',
});

export const CardsSection = styled('section')({
  backgroundColor: '#ffffff',
  paddingTop: '32px',
  paddingBottom: '32px',
});

export const CityCard = styled('div')({
  position: 'relative',
  borderRadius: '4px',
  overflow: 'hidden',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.02)',
  },
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
  [theme.breakpoints.up('sm')]: {
    fontSize: '2.5rem',
  },
  [theme.breakpoints.up('md')]: {
    fontSize: '3rem',
  },
})) as typeof Typography;

export const CarouselSection = styled('section')({
  backgroundColor: '#1b3224',
  color: '#ffffff',
  paddingTop: '40px',
  paddingBottom: '80px',
  overflow: 'hidden',
});

export const CarouselContainer = styled('div')({
  display: 'flex',
  overflowX: 'auto',
  gap: '24px',
  padding: '16px 0',
  scrollSnapType: 'x mandatory',
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
});

export const CarouselCard = styled('div')({
  minWidth: '300px',
  height: '450px',
  position: 'relative',
  scrollSnapAlign: 'start',
  borderRadius: '30px !important',
  overflow: 'hidden',
  flexShrink: 0,
});
