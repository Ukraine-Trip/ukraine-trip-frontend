import React, { useMemo } from 'react';
import { Popup } from 'react-leaflet';
import type { ItineraryPoint } from '../../../../types/types.ts';
import regionsData from '../../../../librarian/cities.json';

const DANGEROUS_REGIONS = [
  'DONETSK OBLAST', 'DONETSK',
  'LUHANSK OBLAST', 'LUHANSK',
  'ZAPORIZHZHIA OBLAST', 'ZAPORIZHZHIA',
  'KHERSON OBLAST', 'KHERSON',
  'MYKOLAIV OBLAST', 'MYKOLAIV',
  'KHARKIV OBLAST', 'KHARKIV',
  'SUMY OBLAST', 'SUMY',
  'KYIV OBLAST', 'KYIV',
  'CHERNIHIV OBLAST', 'CHERNIHIV',
  'DNIPROPETROVSK OBLAST', 'DNIPROPETROVSK',
  'ODESA OBLAST', 'ODESA'
];

const getRegionForCity = (cityName: string) => {
  const foundRegion = regionsData.find(
    (region) =>
      region.center === cityName ||
      region.cities.some((city) => city.name === cityName)
  );
  return foundRegion ? foundRegion.name : null;
};

interface MarkerPopupProps {
  point: ItineraryPoint;
  region?: string;
  onSelectPoint: (point: ItineraryPoint) => void;
  isSelected: boolean;
}

const MarkerPopupComponent: React.FC<MarkerPopupProps> = ({
  point,
  region,
  onSelectPoint,
  isSelected,
}) => {
  const regionName = useMemo(() => {
    return point.region || getRegionForCity(point.name);
  }, [point.region, point.name]);

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

        {region && DANGEROUS_REGIONS.includes(region.toUpperCase()) && (
          <div style={{
            backgroundColor: '#ff9800',
            color: '#fff',
            padding: '4px 8px',
            margin: '8px 0',
            borderRadius: '4px',
            fontSize: '12px',
            lineHeight: '1.4'
          }}>
            ⚠️ Warning: This point is in a dangerous area due to war.
          </div>
        )}

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
            backgroundColor: isSelected ? '#ff4d4f' : '#000',
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

export const MarkerPopup = React.memo(MarkerPopupComponent, (prevProps, nextProps) => {
  return (
    prevProps.point.id === nextProps.point.id &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.region === nextProps.region
  );
});
