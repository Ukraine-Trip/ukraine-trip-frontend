import React, { useState } from 'react';
import {
  Box,
  FormControlLabel,
  Switch,
  Paper,
  Typography,
} from '@mui/material';
import { MapComponent } from './Map';

export const MapPage: React.FC = () => {
  const [isOptimized, setIsOptimized] = useState(false);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* КНОПКА ЛОГИКИ: zIndex 9999 гарантирует, что она будет поверх карты */}
      <Paper
        elevation={6}
        sx={{
          position: 'absolute',
          top: 80, // Опускаем ниже хедера
          right: 20,
          zIndex: 9999,
          p: '6px 16px',
          borderRadius: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid #ccc',
        }}
      >
        <FormControlLabel
          control={
            <Switch
              checked={isOptimized}
              onChange={(e) => setIsOptimized(e.target.checked)}
              color="primary"
            />
          }
          label={
            <Typography variant="button" sx={{ fontWeight: 800 }}>
              {isOptimized ? 'SMART ROUTE' : 'MY ORDER'}
            </Typography>
          }
        />
      </Paper>

      {/* Карта */}
      <Box
        sx={{
          flexGrow: 1,
          position: 'relative',
          width: '100%',
          height: '100%',
        }}
      >
        <MapComponent isOptimized={isOptimized} />
      </Box>
    </Box>
  );
};
