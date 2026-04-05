import { Link } from 'react-router-dom';
import { Container, Stack, Box } from '@mui/material';

import {
  PageWrapper,
  PageTitle,
  SubTitle,
  PrimaryButton
} from '../../style/common';

export const NotFoundPage: React.FC = () => {
  return (
    <PageWrapper sx={{ display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="md">
        <Stack spacing={1} alignItems="center" textAlign="center">

          <SubTitle>Error 404</SubTitle>

          <PageTitle variant="h1" component="h1" sx={{ mb: 2 }}>
            Lost in Ukraine?
          </PageTitle>

          <Box sx={{
            maxWidth: '500px',
            mb: 4,
            color: '#666',
            fontSize: '0.9rem',
            lineHeight: 1.8,
            letterSpacing: '0.5px'
          }}>
            Сторінка, яку ви шукаєте, не існує або була переміщена.
            Спробуйте повернутися на головну сторінку, щоб продовжити свою подорож.
          </Box>

          <PrimaryButton
            component={Link as any}
            to="/"
            elevation={0}
            sx={{
              borderRadius: '10px'
            }}
          >
            Back to Home
          </PrimaryButton>

        </Stack>
      </Container>
    </PageWrapper>
  );
};