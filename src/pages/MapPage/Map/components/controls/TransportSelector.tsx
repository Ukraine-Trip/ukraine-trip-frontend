import React from 'react';

type TransportType = 'car' | 'foot' | 'bike';

interface TransportSelectorProps {
  activeTransport: TransportType;
  onTransportChange: (type: TransportType) => void;
  position: {
    top: number;
    right: number;
  };
}

export const TransportSelector: React.FC<TransportSelectorProps> = ({
  activeTransport,
  onTransportChange,
  position,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        right: `${position.right}px`,
        zIndex: 999,
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
        border: '1px solid #e8e8e8',
        overflow: 'hidden',
        width: '44px',
      }}
    >
      {(['car', 'bike', 'foot'] as TransportType[]).map((type, i) => (
        <React.Fragment key={type}>
          {i > 0 && <div style={{ height: '1px', background: '#f0f0f0' }} />}
          <button
            onClick={() => onTransportChange(type)}
            title={
              type === 'car'
                ? 'Автомобіль'
                : type === 'bike'
                  ? 'Велосипед'
                  : 'Пішки'
            }
            style={{
              background: activeTransport === type ? '#000' : 'transparent',
              color: activeTransport === type ? 'white' : '#666',
              border: 'none',
              padding: '9px 0 7px',
              cursor: 'pointer',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              transition: 'background 0.2s, color 0.2s',
            }}
          >
            {type === 'car' && (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 11L7 6h10l2 5" />
                <rect x="2" y="11" width="20" height="7" rx="2" />
                <circle
                  cx="7"
                  cy="18"
                  r="1.5"
                  fill="currentColor"
                  stroke="none"
                />
                <circle
                  cx="17"
                  cy="18"
                  r="1.5"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
            )}
            {type === 'bike' && (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="5.5" cy="17.5" r="3.5" />
                <circle cx="18.5" cy="17.5" r="3.5" />
                <path d="M15 6a1 1 0 0 0-1-1h-4" />
                <path d="M5.5 17.5L9 9l3.5 8.5" />
                <path d="M18.5 17.5L15 6" />
              </svg>
            )}
            {type === 'foot' && (
              <svg
                width="16"
                height="18"
                viewBox="0 0 16 22"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="8" cy="3" r="2" />
                <path d="M5 21l2-7 1 2 1-2 2 7" />
                <path d="M3.5 12l2-5h5" />
                <path d="M3.5 12l-1.5 3" />
                <path d="M12.5 12l1.5 3" />
              </svg>
            )}
            <span
              style={{
                fontSize: '8px',
                fontWeight: 700,
                letterSpacing: '0.4px',
                textTransform: 'uppercase',
                lineHeight: 1,
              }}
            >
              {type}
            </span>
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};
