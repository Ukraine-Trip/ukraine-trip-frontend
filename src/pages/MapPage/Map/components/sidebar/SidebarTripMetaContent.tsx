import React from 'react';
import { formatDate } from '../utils/mapHelpers';

interface TripMeta {
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  waypoints: Array<{ name: string; order_index: number }>;
}

interface SidebarTripMetaContentProps {
  tripMeta: TripMeta;
  onBack: () => void;
}

export const SidebarTripMetaContent: React.FC<SidebarTripMetaContentProps> = ({
  tripMeta,
  onBack,
}) => {
  return (
    <div style={{ padding: '12px 20px 24px', flex: 1 }}>
      <button
        onClick={onBack}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#555',
          fontSize: '13px',
          fontWeight: 600,
          padding: '6px 0',
          letterSpacing: '0.3px',
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        BACK
      </button>

      <div style={{ padding: '12px 0' }}>
        <h1
          style={{
            fontSize: '22px',
            fontWeight: 800,
            color: '#1a1a2e',
            margin: '0 0 8px',
            lineHeight: 1.2,
            letterSpacing: '-0.3px',
          }}
        >
          {tripMeta.title}
        </h1>

        {(tripMeta.start_date || tripMeta.end_date) && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#f0f4ff',
              border: '1px solid #d0daff',
              borderRadius: '20px',
              padding: '4px 10px',
              fontSize: '12px',
              color: '#3b5bdb',
              fontWeight: 600,
              marginBottom: '16px',
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {formatDate(tripMeta.start_date, tripMeta.end_date)}
          </div>
        )}

        {tripMeta.description && (
          <p
            style={{
              fontSize: '14px',
              color: '#555',
              lineHeight: 1.6,
              margin: '0 0 20px',
            }}
          >
            {tripMeta.description}
          </p>
        )}

        {tripMeta.waypoints.length > 0 && (
          <>
            <div
              style={{
                height: '1px',
                background: '#ebebeb',
                margin: '0 0 16px',
              }}
            />
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#999',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginBottom: '12px',
              }}
            >
              Trip · {tripMeta.waypoints.length} stops
            </div>

            <ol
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              {tripMeta.waypoints.map((wp, i) => (
                <li
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background:
                      i === 0
                        ? '#f0f7f4'
                        : i === tripMeta.waypoints.length - 1
                          ? '#f7f0f0'
                          : 'transparent',
                  }}
                >
                  <span
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background:
                        i === 0
                          ? '#2e7d5a'
                          : i === tripMeta.waypoints.length - 1
                            ? '#c0392b'
                            : '#e8e8e8',
                      color:
                        i === 0 || i === tripMeta.waypoints.length - 1
                          ? '#fff'
                          : '#555',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span
                    style={{
                      fontSize: '13px',
                      color: '#222',
                      fontWeight: 500,
                    }}
                  >
                    {wp.name}
                  </span>
                </li>
              ))}
            </ol>
          </>
        )}
      </div>
    </div>
  );
};
