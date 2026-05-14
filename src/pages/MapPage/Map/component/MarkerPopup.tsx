import React from 'react';
import { Popup } from 'react-leaflet';
import type { ItineraryPoint } from '../../../../types/types.ts';
import regionsData from '../../../../librarian/cities.json';

interface MarkerPopupProps {
  point: ItineraryPoint;
  onSelectPoint: (point: ItineraryPoint) => void;
  isSelected: boolean;
}

export const MarkerPopup: React.FC<MarkerPopupProps> = ({
  point,
  onSelectPoint,
  isSelected,
}) => {
  const getRegionForCity = (cityName: string) => {
    const foundRegion = regionsData.find(
      (region) =>
        region.center === cityName ||
        region.cities.some((city) => city.name === cityName)
    );
    return foundRegion ? foundRegion.name : null;
  };

  const regionName = getRegionForCity(point.name);

  return (
    <Popup minWidth={200}>
      <div style={{ textAlign: 'center', fontFamily: 'sans-serif' }}>
        {regionName && (
          <span
            style={{
              fontSize: '0.75rem',
              color: '#888',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '4px',
            }}
          >
            {regionName}
          </span>
        )}

        <strong style={{ fontSize: '1.1rem' }}>{point.name}</strong>

        {point.priority <= 2 && (
          <>
            {point.imageUrl && (
              <img
                src={point.imageUrl}
                alt={point.name}
                style={{ width: '100%', borderRadius: '4px', marginTop: '8px' }}
              />
            )}
            <p style={{ margin: '8px 0 0', fontSize: '0.9rem', color: '#444' }}>
              {point.description}
            </p>
          </>
        )}

        {point.priority === 3 && point.imageUrl && (
          <img
            src={point.imageUrl}
            alt={point.name}
            style={{ width: '100%', borderRadius: '4px', marginTop: '8px' }}
          />
        )}

        <button
          onClick={() => onSelectPoint(point)}
          style={{
            marginTop: '12px',
            width: '100%',
            padding: '8px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: isSelected ? '#ff4d4f' : '#3b5bdb',
            color: 'white',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.85rem',
          }}
        >
          {isSelected ? 'Remove from route' : 'Add to route'}
        </button>
      </div>
    </Popup>
  );
};
