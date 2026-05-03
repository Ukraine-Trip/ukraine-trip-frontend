import { useState } from 'react';
import {
  TextField,
  Typography,
  Container,
  Link as MuiLink,
  Alert,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/auth.ts';

import { PageWrapper } from '../../style/common';
import { FormContainer, StyledForm, SubmitButton, LinksWrapper } from './style';

export const RegisterPage = () => {
  const navigate = useNavigate();

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
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    }

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
