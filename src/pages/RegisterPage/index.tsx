import { useState, useContext } from 'react';
import {
  TextField,
  Typography,
  Container,
  Link as MuiLink,
  Alert,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { api, loginUser } from '../../api/auth.ts';
import { getApiErrorMessage } from '../../utils/apiError';

import { PageWrapper } from '../../style/common';
import { FormContainer, StyledForm, SubmitButton, LinksWrapper } from './style';
import { AuthContext } from '../../context/AuthContext.tsx';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { setToken, setUser } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      await api.post('/auth/register', {
        full_name: formData.fullName,
        email: formData.email,
        password: formData.password,
      });

      const loginResponse = await loginUser({
        username: formData.email,
        password: formData.password,
      });
      const { access_token, token: tokenFromResponse, user: responseUser, email: responseEmail, full_name } = loginResponse.data || {};
      const authToken = access_token || tokenFromResponse;

      if (!authToken) {
        throw new Error('Unable to log in after registration.');
      }

      setToken(authToken);
      setUser(
        responseUser || {
          email: responseEmail || formData.email,
          full_name: full_name || formData.fullName,
        }
      );

      navigate('/account');
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Registration failed. Please try again.'));
    }
  };

  return (
    <PageWrapper sx={{ pt: 15, pb: 8 }}>
      <Container component="main" maxWidth="xs">
        <FormContainer>
          <Typography component="h1" variant="h5" fontWeight="700">
            Sign Up
          </Typography>

          <StyledForm onSubmit={handleSubmit} noValidate>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TextField
              margin="normal"
              required
              fullWidth
              id="fullName"
              label="Full Name"
              name="fullName"
              autoComplete="name"
              autoFocus
              value={formData.fullName}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
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
              value={formData.password}
              onChange={handleChange}
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