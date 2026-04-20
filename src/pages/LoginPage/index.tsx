import {
  TextField,
  Typography,
  Container,
  Link as MuiLink,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

import { PageWrapper } from '../../style/common';
import { FormContainer, StyledForm, SubmitButton, LinksWrapper } from './style';

export const LoginPage = () => {
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Імітація успішного входу та перехід у профіль
    navigate('/account');
  };

  return (
    <PageWrapper sx={{ pt: 15, pb: 8 }}>
      <style>{`footer { display: none !important; }`}</style>
      <Container component="main" maxWidth="xs">
        <FormContainer>
          <Typography component="h1" variant="h5" fontWeight="700">
            Sign In
          </Typography>

          <StyledForm onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
            />

            <SubmitButton type="submit" fullWidth variant="contained">
              Sign In
            </SubmitButton>

            <LinksWrapper>
              <MuiLink
                component={Link}
                to="/register"
                variant="body2"
                sx={{
                  color: '#d81b60',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                {"Don't have an account? Sign Up"}
              </MuiLink>
            </LinksWrapper>
          </StyledForm>
        </FormContainer>
      </Container>
    </PageWrapper>
  );
};
