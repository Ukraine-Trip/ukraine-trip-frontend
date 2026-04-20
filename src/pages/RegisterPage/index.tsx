import {
  TextField,
  Typography,
  Container,
  Link as MuiLink,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

import { PageWrapper } from '../../style/common';
import { FormContainer, StyledForm, SubmitButton, LinksWrapper } from './style';

export const RegisterPage = () => {
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Імітуємо успішну реєстрацію і перекидаємо у профіль
    navigate('/account');
  };

  return (
    <PageWrapper sx={{ pt: 15, pb: 8 }}>
      <style>{`footer { display: none !important; }`}</style>
      <Container component="main" maxWidth="xs">
        <FormContainer>
          <Typography component="h1" variant="h5" fontWeight="700">
            Sign Up
          </Typography>

          <StyledForm onSubmit={handleSubmit} noValidate>
            {/* Нове поле для імені */}
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Full Name"
              name="name"
              autoComplete="name"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
            />

            <SubmitButton type="submit" fullWidth variant="contained">
              Sign Up
            </SubmitButton>

            <LinksWrapper>
              <MuiLink
                component={Link}
                to="/login"
                variant="body2"
                sx={{
                  color: '#d81b60',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                {'Already have an account? Sign In'}
              </MuiLink>
            </LinksWrapper>
          </StyledForm>
        </FormContainer>
      </Container>
    </PageWrapper>
  );
};
