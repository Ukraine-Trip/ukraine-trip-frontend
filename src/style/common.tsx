import { styled } from '@mui/material/styles';
import { Button, Typography, Box, TextField } from '@mui/material';
import React from 'react';

interface CollapseButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export const CollapseButton: React.FC<CollapseButtonProps> = ({
  isOpen,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      aria-label={isOpen ? 'Згорнути' : 'Розгорнути'}
      style={{
        background: '#1a1a1a',
        border: 'none',
        borderRadius: '50%',
        width: '52px',
        height: '52px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition:
          'background 0.2s, transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        const btn = e.currentTarget as HTMLButtonElement;
        btn.style.background = '#333';
        btn.style.transform = 'scale(1.1)';
        btn.style.boxShadow = '0 6px 20px rgba(0,0,0,0.35)';
      }}
      onMouseLeave={(e) => {
        const btn = e.currentTarget as HTMLButtonElement;
        btn.style.background = '#1a1a1a';
        btn.style.transform = 'scale(1)';
        btn.style.boxShadow = 'none';
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)',
          transition: 'transform 0.3s ease',
        }}
      >
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  );
};
export const SecondaryButton = styled(Button)({
  backgroundColor: 'transparent',
  color: '#000',
  border: '1px solid #000',
  borderRadius: 0,
  padding: '11px 27px',
  fontSize: '0.8rem',
  fontWeight: 600,
  letterSpacing: '1.5px',
  textTransform: 'uppercase',
  '&:hover': { backgroundColor: '#f5f5f5', border: '1px solid #000' },
}) as typeof Button;

export const PageTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  fontSize: '2.5rem',
  textTransform: 'uppercase',
  letterSpacing: '2px',
  marginBottom: theme.spacing(0),
  [theme.breakpoints.down('sm')]: { fontSize: '1.8rem' },
})) as typeof Typography;

export const AppealButton = styled('button')({
  width: '50px',
  height: '50px',
  borderRadius: '50%',
  backgroundColor: 'rgb(20, 20, 20)',
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0px 0px 0px 4px rgba(180, 160, 255, 0.253)',
  cursor: 'pointer',
  transition: 'all 0.3s ease',

  '& .svgIcon': {
    width: '14px',
    transition: 'transform 0.3s ease',
    '& path': { fill: 'white' },
  },

  '&:hover': {
    backgroundColor: 'rgb(181, 160, 255)',
    transform: 'scale(1.1)',
    boxShadow: '0px 0px 0px 6px rgba(180, 160, 255, 0.4)',
  },

  '&:hover .svgIcon': {
    transform: 'translateY(-4px)',
  },
}) as React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>>;

export const SubTitle = styled(Typography)({
  fontSize: '0.75rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '4px',
  color: '#999',
  marginBottom: '8px',
});

export const CommonInput = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: 0,
    '& fieldset': { borderColor: '#e0e0e0' },
    '&:hover fieldset': { borderColor: '#000' },
    '&.Mui-focused fieldset': { borderColor: '#000' },
  },
});

export const PageWrapper = styled(Box)(({ theme }) => ({
  paddingTop: 'calc(80px + env(safe-area-inset-top))',
  paddingBottom: '100px',
  minHeight: '100vh',
  [theme.breakpoints.down('md')]: {
    paddingTop: 'calc(64px + env(safe-area-inset-top))',
  },
}));
export const PrimaryButton = styled(Button)({
  backgroundColor: '#000',
  color: '#fff',
  borderRadius: 0,
  padding: '12px 28px',
  fontSize: '0.8rem',
  fontWeight: 600,
  letterSpacing: '1.5px',
  textTransform: 'uppercase',
  '&:hover': { backgroundColor: '#333' },
}) as typeof Button;
