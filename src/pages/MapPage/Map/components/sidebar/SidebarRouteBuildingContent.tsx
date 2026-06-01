import React from 'react';
import { PointDetailsCard } from '../PointDetailsCard';
import { RoutePointsList } from '../RoutePointsList';
import type { ItineraryPoint } from '../../../../types/types';

interface SidebarRouteBuildingContentProps {
  cityMeta: {
    name: string;
    lat: number;
    lng: number;
  } | undefined;
  selectedRoutePoints: ItineraryPoint[];
  activePointDetails: ItineraryPoint | null;
  mapDraggingIdx: number | null;
  mapDragOverIdx: number | null;
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
  onViewItinerary: () => void;
  onExitRouteBuildingMode: () => void;
}

export const SidebarRouteBuildingContent: React.FC<SidebarRouteBuildingContentProps> = ({
  cityMeta,
  selectedRoutePoints,
  activePointDetails,
  mapDraggingIdx,
  mapDragOverIdx,
  onSelectPoint,
  onMapDragStart,
  onMapDragOver,
  onMapDrop,
  onMapDragEnd,
  onMapTouchStart,
  onMapTouchMove,
  onMapTouchEnd,
  onSetActivePointDetails,
  onViewItinerary,
  onExitRouteBuildingMode,
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
        Побудова поїздки
      </div>

      {selectedRoutePoints.length === 0 ? (
        <p style={{ fontSize: '13px', color: '#888', lineHeight: 1.5 }}>
          Натискайте на маркери на карті, щоб додати точки до поїздки
        </p>
      ) : (
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

      {activePointDetails && (
        <div
          style={{
            padding: '12px',
            background: '#f8f9ff',
            borderRadius: '8px',
            border: '1px solid #e0e6ff',
            marginBottom: '16px',
          }}
        >
          <h3
            style={{
              fontSize: '15px',
              fontWeight: 700,
              margin: '0 0 8px',
              color: '#1a1a2e',
            }}
          >
            {activePointDetails.name}
          </h3>
          <button
            onClick={() => onSelectPoint(activePointDetails)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: selectedRoutePoints.some(
                (p) => p.id === activePointDetails.id
              )
                ? '#ff4d4f'
                : '#3b5bdb',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            {selectedRoutePoints.some((p) => p.id === activePointDetails.id)
              ? 'Видалити з маршруту'
              : 'Додати до маршруту'}
          </button>
        </div>
      )}

      <div style={{ flex: 1 }} />

      {selectedRoutePoints.length > 0 && (
        <button
          onClick={onViewItinerary}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor:
              selectedRoutePoints.length > 0 ? '#3b5bdb' : '#ccc',
            color: 'white',
            fontWeight: 700,
            cursor:
              selectedRoutePoints.length > 0
                ? 'pointer'
                : 'not-allowed',
            fontSize: '14px',
            letterSpacing: '0.5px',
            marginBottom: '10px',
          }}
        >
          Переглянути поїздку
        </button>
      )}

      {cityMeta && (
        <button
          onClick={onExitRouteBuildingMode}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            backgroundColor: 'transparent',
            color: '#555',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          ← Назад до {cityMeta.name}
        </button>
      )}
    </div>
  );
};
