import React from 'react';
import { Alert } from '@mui/material';
import type { ItineraryPoint } from '../../../../types/types';
import { isDangerousRegion, getRegionForCity } from '../utils/mapHelpers';

interface PointDetailsCardProps {
  point: ItineraryPoint;
  isSelected: boolean;
  onSelect: () => void;
  onClose?: () => void;
  backLabel?: string;
  actionLabel?: {
    selected: string;
    unselected: string;
  };
  variant?: 'light' | 'blue';
}

const defaultActionLabel = {
  selected: 'Видалити з маршруту',
  unselected: 'Додати до маршруту',
};

export const PointDetailsCard: React.FC<PointDetailsCardProps> = ({
  point,
  isSelected,
  onSelect,
  onClose,
  backLabel,
  actionLabel = defaultActionLabel,
  variant = 'light',
}) => {
  const backgroundColor = variant === 'blue' ? '#f8f9ff' : '#f8f9fa';
  const borderColor = variant === 'blue' ? '#e0e6ff' : '#ebebeb';
  const buttonBgColor = isSelected ? '#ff4d4f' : variant === 'blue' ? '#3b5bdb' : '#000';
  const isDangerous = isDangerousRegion(point.name);

  return (
    <div
      style={{
        padding: '12px',
        background: backgroundColor,
        borderRadius: variant === 'blue' ? '8px' : '10px',
        border: `1px solid ${borderColor}`,
        marginBottom: '12px',
      }}
    >
      {onClose && (
        <button
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#888',
            fontSize: '11px',
            fontWeight: 600,
            padding: '0 0 8px',
            letterSpacing: '0.3px',
          }}
        >
          ← {backLabel || 'Back'}
        </button>
      )}

      {getRegionForCity(point.name) && variant !== 'blue' && (
        <span
          style={{
            fontSize: '10px',
            fontWeight: 700,
            color: '#aaa',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            display: 'block',
            marginBottom: '2px',
          }}
        >
          {getRegionForCity(point.name)}
        </span>
      )}

      <h3
        style={{
          fontSize: variant === 'blue' ? '15px' : '16px',
          fontWeight: 700,
          margin: '0 0 8px',
          color: '#1a1a2e',
        }}
      >
        {point.name}
      </h3>

      {isDangerous && (
        <Alert severity="warning" style={{ marginBottom: '10px', fontSize: '12px' }}>
          Warning: This route point is located in a high-risk area due to the ongoing war.
        </Alert>
      )}

      {point.imageUrl && (
        <img
          src={point.imageUrl}
          alt={point.name}
          style={{
            width: '100%',
            borderRadius: '6px',
            marginBottom: '8px',
            objectFit: 'cover',
            maxHeight: variant === 'blue' ? undefined : '140px',
          }}
        />
      )}

      {point.description && (
        <p
          style={{
            fontSize: '13px',
            color: '#666',
            lineHeight: 1.5,
            margin: '0 0 10px',
          }}
        >
          {point.description.length > 120
            ? point.description.slice(0, 120) + '…'
            : point.description}
        </p>
      )}

      <button
        onClick={onSelect}
        style={{
          width: '100%',
          padding: '8px',
          borderRadius: '6px',
          border: 'none',
          backgroundColor: buttonBgColor,
          color: 'white',
          fontWeight: 600,
          cursor: 'pointer',
          fontSize: '13px',
          transition: 'background 0.15s',
        }}
      >
        {isSelected ? actionLabel.selected : actionLabel.unselected}
      </button>
    </div>
  );
};
