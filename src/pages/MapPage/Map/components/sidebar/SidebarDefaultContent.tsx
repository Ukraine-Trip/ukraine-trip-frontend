import React from 'react';
import { PointDetailsCard } from '../PointDetailsCard';
import { RoutePointsList } from '../RoutePointsList';
import type { ItineraryPoint } from '../../../../types/types';

interface SidebarDefaultContentProps {
  selectedRoutePoints: ItineraryPoint[];
  activePointDetails: ItineraryPoint | null;
  mapDraggingIdx: number | null;
  mapDragOverIdx: number | null;
  saveError: string | null;
  saveLoading: boolean;
  token: string | null;
  // Event handlers
  onSelectPoint: (point: ItineraryPoint) => void;
  onMapDragStart: (idx: number) => void;
  onMapDragOver: (e: React.DragEvent, idx: number) => void;
  onMapDrop: (e: React.DragEvent, idx: number) => void;
  onMapDragEnd: () => void;
  onMapTouchStart: (idx: number) => void;
  onMapTouchMove: (e: React.TouchEvent) => void;
  onMapTouchEnd: () => void;
  onSetActivePointDetails: (point: ItineraryPoint | null) => void;
  onShowDetails: () => void;
}

export const SidebarDefaultContent: React.FC<SidebarDefaultContentProps> = ({
  selectedRoutePoints,
  activePointDetails,
  mapDraggingIdx,
  mapDragOverIdx,
  saveError,
  saveLoading,
  token,
  onSelectPoint,
  onMapDragStart,
  onMapDragOver,
  onMapDrop,
  onMapDragEnd,
  onMapTouchStart,
  onMapTouchMove,
  onMapTouchEnd,
  onSetActivePointDetails,
  onShowDetails,
}) => {
  return (
    <div
      style={{
        padding: '12px 20px 24px',
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header label */}
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
        {selectedRoutePoints.length === 0
          ? 'Оберіть точки на карті'
          : `Trip · ${selectedRoutePoints.length} ${
            selectedRoutePoints.length % 10 === 1 &&
            selectedRoutePoints.length % 100 !== 11
              ? 'зупинка'
              : [2, 3, 4].includes(selectedRoutePoints.length % 10) &&
                ![12, 13, 14].includes(selectedRoutePoints.length % 100)
                ? 'зупинки'
                : 'зупинок'
          }`}
      </div>

      {/* Empty-state hint */}
      {selectedRoutePoints.length === 0 ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '24px 0 16px',
            textAlign: 'center',
            color: '#ccc',
          }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ddd"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginBottom: '12px' }}
          >
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6 }}>
            Натискайте на маркери,
            <br />
            щоб додати точки до маршруту
          </p>
        </div>
      ) : (
        /* Selected points list */
        <RoutePointsList
          points={selectedRoutePoints}
          onSelectPoint={onSelectPoint}
          onDragStart={onMapDragStart}
          onDragOver={onMapDragOver}
          onDrop={onMapDrop}
          onDragEnd={onMapDragEnd}
          onTouchStart={onMapTouchStart}
          onTouchMove={onMapTouchMove}
          onTouchEnd={onMapTouchEnd}
          draggingIdx={mapDraggingIdx}
          dragOverIdx={mapDragOverIdx}
        />
      )}

      {/* Active point detail card */}
      {activePointDetails && (
        <PointDetailsCard
          point={activePointDetails}
          isSelected={selectedRoutePoints.some((p) => p.id === activePointDetails.id)}
          onSelect={() => onSelectPoint(activePointDetails)}
          variant="light"
        />
      )}

      <div style={{ flex: 1 }} />

      {/* Hint when < 2 points */}
      {selectedRoutePoints.length > 0 && selectedRoutePoints.length < 2 && (
        <p
          style={{
            margin: '0 0 8px',
            fontSize: '12px',
            color: '#aaa',
            textAlign: 'center',
          }}
        >
          Оберіть ще{' '}
          {2 - selectedRoutePoints.length === 1
            ? '1 точку'
            : `${2 - selectedRoutePoints.length} точки`}{' '}
          для побудови маршруту
        </p>
      )}

      {/* Error message */}
      {saveError && (
        <p
          style={{
            margin: '0 0 8px',
            fontSize: '12px',
            color: '#c0392b',
            textAlign: 'center',
          }}
        >
          {saveError}
        </p>
      )}

      {/* Show Details button */}
      <button
        onClick={onShowDetails}
        disabled={selectedRoutePoints.length < 2 || saveLoading}
        title={
          selectedRoutePoints.length < 2
            ? 'Оберіть щонайменше 2 точки для побудови маршруту'
            : !token
              ? 'Увійдіть, щоб переглянути деталі'
              : ''
        }
        style={{
          width: '100%',
          padding: '13px',
          borderRadius: '8px',
          border: 'none',
          backgroundColor:
            selectedRoutePoints.length >= 2 && !saveLoading
              ? '#000'
              : '#e8e8e8',
          color:
            selectedRoutePoints.length >= 2 && !saveLoading
              ? '#fff'
              : '#aaa',
          fontWeight: 700,
          cursor:
            selectedRoutePoints.length >= 2 && !saveLoading
              ? 'pointer'
              : 'not-allowed',
          fontSize: '14px',
          letterSpacing: '0.5px',
          transition: 'background-color 0.2s, color 0.2s',
        }}
        onMouseOver={(e) => {
          if (selectedRoutePoints.length >= 2 && !saveLoading)
            e.currentTarget.style.backgroundColor = '#222';
        }}
        onMouseOut={(e) => {
          if (selectedRoutePoints.length >= 2 && !saveLoading)
            e.currentTarget.style.backgroundColor = '#000';
        }}
      >
        {saveLoading ? 'Завантаження...' : 'Show Details'}
      </button>

      {/* Login prompt */}
      {!token && selectedRoutePoints.length >= 2 && (
        <p
          style={{
            margin: '8px 0 0',
            fontSize: '12px',
            color: '#999',
            textAlign: 'center',
          }}
        >
          Увійдіть в акаунт для перегляду деталей маршруту
        </p>
      )}
    </div>
  );
};
