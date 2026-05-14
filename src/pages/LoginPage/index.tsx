import { useState, useContext } from 'react';
import {
  TextField,
  Typography,
  Container,
  Link as MuiLink,
  Alert,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../../api/auth.ts';
import { getApiErrorMessage } from '../../utils/apiError';

import { PageWrapper } from '../../style/common';
import { FormContainer, StyledForm, SubmitButton, LinksWrapper } from './style';
import { AuthContext } from '../../context/AuthContext.tsx';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { setToken, setUser } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      const response = await loginUser({ username: email, password });
      const { access_token, token: tokenFromResponse, user: responseUser, email: responseEmail, full_name } = response.data;
      const authToken = access_token || tokenFromResponse;

      setToken(authToken);
      setUser(
        responseUser || {
          email: responseEmail || email,
          full_name: full_name || '',
        }
      );

      navigate('/account');
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Login failed. Please check your credentials.'));
    }
  };

  return (
    <PageWrapper sx={{ pt: 15, pb: 8 }}>
      <Container component="main" maxWidth="xs">
        <FormContainer>
          <Typography component="h1" variant="h5" fontWeight="700">
            Sign In
          </Typography>

          <StyledForm onSubmit={handleSubmit} noValidate>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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