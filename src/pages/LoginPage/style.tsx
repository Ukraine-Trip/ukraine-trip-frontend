import { styled } from '@mui/material/styles';
import { Box, Button } from '@mui/material';

// Біла карточка з тінню, в якій лежить форма
export const FormContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  backgroundColor: '#ffffff',
  padding: theme.spacing(4),
  borderRadius: 16,
  boxShadow: '0px 4px 20px rgba(0,0,0,0.05)',
}));

export const StyledForm = styled('form')(({ theme }) => ({
  marginTop: theme.spacing(3),
  width: '100%',
}));

export const SubmitButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(2),
  backgroundColor: '#d81b60',
  paddingTop: theme.spacing(1.5),
  paddingBottom: theme.spacing(1.5),
  fontWeight: 'bold',
  '&:hover': {
    backgroundColor: '#ad1457', // Трохи темніший колір при наведенні
  },
}));

// Обгортка для посилання на реєстрацію
export const LinksWrapper = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginTop: theme.spacing(1),
}));
