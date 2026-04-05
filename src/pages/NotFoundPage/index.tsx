import { Box, Button, Typography, Container, Stack } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        backgroundColor: 'background.default',
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Stack spacing={3} alignItems="center">
          {/* Велика іконка замість картинки */}
          <ErrorOutlineIcon sx={{ fontSize: '10rem', color: 'primary.light', mb: -2 }} />

          <Typography variant="h1" sx={{ fontWeight: 900, fontSize: { xs: '5rem', md: '8rem' }, lineHeight: 1 }}>
            404
          </Typography>

          <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
            Сторінку не знайдено
          </Typography>

          <Typography variant="body1" color="text.secondary">
            Вибачте, але ми не змогли знайти сторінку, яку ви шукаєте.
            Можливо, вона була видалена або ви помилилися в адресі.
          </Typography>

          <Button
            variant="contained"
            size="large"
            component={Link}
            to="/"
            sx={{ mt: 2, textTransform: 'none', borderRadius: '10px', px: 5 }}
          >
            Повернутися додому
          </Button>
        </Stack>
      </Container>
    </Box>
  );
};