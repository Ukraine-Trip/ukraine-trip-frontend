import React from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
} from '@mui/material';
import { SubTitle, CommonInput, PrimaryButton } from '../../style/common';

export const Footer: React.FC = () => {
  const darkAccordionStyle = {
    bgcolor: 'transparent',
    color: '#fff',
    boxShadow: 'none',
    borderBottom: '1px solid #333',
    '&:before': { display: 'none' },
    m: '0 !important',
  };

  return (
    <Box
      component="footer"
      sx={{ bgcolor: '#111', color: '#fff', p: { xs: 4, md: 6 } }}
    >
      <Box sx={{ mb: 5 }}>
        <Accordion sx={darkAccordionStyle} disableGutters>
          <AccordionSummary
            expandIcon={
              <Typography color="white" fontSize="20px">
                +
              </Typography>
            }
          >
            <Typography sx={{ fontWeight: 'bold', letterSpacing: '1px' }}>
              UKRAINE TRIP
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" sx={{ color: '#ccc' }}>
              Про нас | Наша команда | Вакансії
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion sx={darkAccordionStyle} disableGutters>
          <AccordionSummary
            expandIcon={
              <Typography color="white" fontSize="20px">
                +
              </Typography>
            }
          >
            <Typography sx={{ fontWeight: 'bold', letterSpacing: '1px' }}>
              USEFUL INFORMATION
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" sx={{ color: '#ccc' }}>
              FAQ | Умови повернення | Страхування
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion sx={darkAccordionStyle} disableGutters>
          <AccordionSummary
            expandIcon={
              <Typography color="white" fontSize="20px">
                +
              </Typography>
            }
          >
            <Typography sx={{ fontWeight: 'bold', letterSpacing: '1px' }}>
              WHO/WHAT
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" sx={{ color: '#ccc' }}>
              Партнери | Блог | Галерея
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Box>

      <Box sx={{ mb: 5 }}>
        <SubTitle sx={{ color: '#fff', mb: 2 }}>
          SIGN UP TO OUR NEWSLETTER
        </SubTitle>
        <Stack direction="row" sx={{ maxWidth: '400px' }}>
          <CommonInput
            placeholder="youremail@example.com"
            variant="outlined"
            size="small"
            sx={{
              flex: 1,
              bgcolor: '#fff',
              '& .MuiOutlinedInput-root': { borderRadius: 0 },
            }}
          />
          <PrimaryButton sx={{ minWidth: '50px', p: 0, fontSize: '1.2rem' }}>
            {'>'}
          </PrimaryButton>
        </Stack>
      </Box>

      <Stack direction="row" spacing={3} sx={{ mb: 5 }}>
        <Typography sx={{ cursor: 'pointer', '&:hover': { color: '#888' } }}>
          [IG]
        </Typography>
        <Typography sx={{ cursor: 'pointer', '&:hover': { color: '#888' } }}>
          [YT]
        </Typography>
        <Typography sx={{ cursor: 'pointer', '&:hover': { color: '#888' } }}>
          [IN]
        </Typography>
        <Typography sx={{ cursor: 'pointer', '&:hover': { color: '#888' } }}>
          [SP]
        </Typography>
      </Stack>

      <Box sx={{ color: '#ccc' }}>
        <Typography variant="caption" display="block" sx={{ mb: 1 }}>
          Головний офіс, вулиця Хрещатик 22, Київ, 01001
        </Typography>
        <Typography
          variant="body2"
          sx={{ mb: 2, fontWeight: 'bold', color: '#fff' }}
        >
          +380 44 123 45 67
        </Typography>
        <Typography
          variant="caption"
          display="block"
          sx={{ fontStyle: 'italic', lineHeight: 1.6 }}
        >
          Туристичні послуги надаються компанією Ukraine Trip як офіційним
          оператором в Україні.
          <br />
          Будь ласка, ознайомтеся з нашими умовами бронювання для отримання
          додаткової інформації.
          <br />
          &copy; 2026 Ukraine Trip.
          <br />
          Дзвінки можуть записуватися з метою навчання та контролю якості.
        </Typography>
      </Box>
    </Box>
  );
};
