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
        height: '100vh', // Весь екран
        width: '100vw',
        overflow: 'hidden',
      }}
    >
      {/* Карта заповнює все вільне місце */}
      <Box sx={{ flex: 1, position: 'relative' }}>
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 1100,
            p: '4px 12px',
            borderRadius: '20px',
            backgroundColor: 'rgba(255,255,255,0.9)',
          }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={isOptimized}
                onChange={(e) => setIsOptimized(e.target.checked)}
                size="small"
              />
            }
            label={
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                🚀 SMART
              </Typography>
            }
          />
        </Paper>
        <MapComponent isOptimized={isOptimized} />
      </Box>
    </Box>
  );
};
