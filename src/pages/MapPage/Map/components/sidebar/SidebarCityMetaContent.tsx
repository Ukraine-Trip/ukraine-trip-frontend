import React, { useCallback } from 'react';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { PointDetailsCard } from '../PointDetailsCard';
import { RoutePointsList } from '../RoutePointsList';
import type { ItineraryPoint, Trip } from '../../../../types/types';
import { pointsLabel } from '../utils/mapHelpers';

interface CityMeta {
  name: string;
  lat: number;
  lng: number;
}

interface SidebarCityMetaContentProps {
  cityMeta: CityMeta;
  cityLocation: ItineraryPoint | null;
  selectedRoutePoints: ItineraryPoint[];
  activePointDetails: ItineraryPoint | null;
  routeBuildingMode: boolean;
  token: string | null;
  cityTrips: Trip[];
  myCityTrips: Trip[];
  cityTripsLoading: boolean;
  selectedCityTrip: Trip | null;
  likedTripIds: string[];
  routeSource: 'provided' | 'my';
  mapDraggingIdx: number | null;
  mapDragOverIdx: number | null;
  saveError: string | null;
  saveLoading: boolean;
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
  onSetRouteSource: (source: 'provided' | 'my') => void;
  onSetSelectedCityTrip: (trip: Trip | null) => void;
  onLikeClick: (e: React.MouseEvent, tripId: string) => void;
  onShowDetails: () => void;
  onNavigateToItinerary: (filterRegion?: string) => void;
}

export const SidebarCityMetaContent: React.FC<SidebarCityMetaContentProps> = ({
  cityMeta,
  cityLocation,
  selectedRoutePoints,
  activePointDetails,
  routeBuildingMode,
  token,
  cityTrips,
  myCityTrips,
  cityTripsLoading,
  selectedCityTrip,
  likedTripIds,
  routeSource,
  mapDraggingIdx,
  mapDragOverIdx,
  saveError,
  saveLoading,
  onSelectPoint,
  onMapDragStart,
  onMapDragOver,
  onMapDrop,
  onMapDragEnd,
  onMapTouchStart,
  onMapTouchMove,
  onMapTouchEnd,
  onSetActivePointDetails,
  onSetRouteSource,
  onSetSelectedCityTrip,
  onLikeClick,
  onShowDetails,
  onNavigateToItinerary,
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
      {/* City title */}
      <h1
        style={{
          fontSize: '22px',
          fontWeight: 800,
          color: '#1a1a2e',
          margin: '0 0 4px',
          lineHeight: 1.2,
          letterSpacing: '-0.3px',
        }}
      >
        {cityMeta.name}
      </h1>

      {cityLocation?.description && (
        <p
          style={{
            fontSize: '13px',
            color: '#888',
            lineHeight: 1.5,
            margin: '0 0 12px',
          }}
        >
          {cityLocation.description.length > 80
            ? cityLocation.description.slice(0, 80) + '…'
            : cityLocation.description}
        </p>
      )}

      {/* ── Selected points list (always visible when any selected) ── */}
      {selectedRoutePoints.length > 0 && (
        <>
          <div
            style={{
              fontSize: '10px',
              fontWeight: 700,
              color: '#aaa',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: '6px',
            }}
          >
            Обрані точки · {selectedRoutePoints.length}
          </div>
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
            compact
          />
          <div
            style={{
              height: '1px',
              background: '#ebebeb',
              margin: '0 0 12px',
            }}
          />
        </>
      )}

      {/* ── Active point detail card ── */}
      {activePointDetails ? (
        <PointDetailsCard
          point={activePointDetails}
          isSelected={selectedRoutePoints.some((p) => p.id === activePointDetails.id)}
          onSelect={() => onSelectPoint(activePointDetails)}
          onClose={() => onSetActivePointDetails(null)}
          backLabel="Назад до міста"
        />
      ) : (
        <>
          <div
            style={{
              height: '1px',
              background: '#ebebeb',
              margin: '0 0 14px',
            }}
          />

          <button
            onClick={() => onNavigateToItinerary(cityMeta?.name || cityMeta?.name)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#000',
              color: 'white',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '14px',
              letterSpacing: '0.3px',
              marginBottom: '20px',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#333')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#000')}
          >
            Create Trip
          </button>

          {token && (
            <div
              style={{
                display: 'flex',
                background: '#f0f0f0',
                borderRadius: '8px',
                padding: '4px',
                marginBottom: '16px',
                gap: '4px',
              }}
            >
              <button
                onClick={() => onSetRouteSource('provided')}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: routeSource === 'provided' ? '#fff' : 'transparent',
                  color: routeSource === 'provided' ? '#000' : '#666',
                  boxShadow:
                    routeSource === 'provided'
                      ? '0 2px 4px rgba(0,0,0,0.05)'
                      : 'none',
                  transition: 'all 0.2s',
                }}
              >
                Надані
              </button>
              <button
                onClick={() => onSetRouteSource('my')}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: routeSource === 'my' ? '#fff' : 'transparent',
                  color: routeSource === 'my' ? '#000' : '#666',
                  boxShadow:
                    routeSource === 'my' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                Мої
              </button>
            </div>
          )}

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
            {routeSource === 'my' ? 'My Trips' : 'Created Trips'}
          </div>

          {cityTripsLoading ? (
            <div style={{ fontSize: '13px', color: '#bbb', padding: '8px 0' }}>
              Завантаження...
            </div>
          ) : (routeSource === 'my' ? myCityTrips : cityTrips).length === 0 ? (
            <div style={{ fontSize: '13px', color: '#bbb', padding: '8px 0' }}>
              {routeSource === 'my'
                ? 'Ви ще не створили маршрутів у цьому регіоні.'
                : 'Маршрутів для цього міста не знайдено.'}
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                marginBottom: '16px',
              }}
            >
              {(routeSource === 'my' ? myCityTrips : cityTrips).map((trip) => {
                const isLiked = likedTripIds.includes(trip.id);
                return (
                  <div
                    key={trip.id}
                    onClick={() =>
                      onSetSelectedCityTrip((prev) =>
                        prev?.id === trip.id ? null : trip
                      )
                    }
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background:
                        selectedCityTrip?.id === trip.id
                          ? '#000'
                          : '#f8f8f8',
                      color:
                        selectedCityTrip?.id === trip.id
                          ? 'white'
                          : '#222',
                      cursor: 'pointer',
                      border: `1px solid ${selectedCityTrip?.id === trip.id ? '#000' : '#ebebeb'}`,
                      transition: 'all 0.15s',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: '13px',
                          marginBottom: '2px',
                        }}
                      >
                        {trip.title}
                      </div>
                      <div style={{ fontSize: '12px', opacity: 0.7 }}>
                        {pointsLabel(trip.trip_nodes.length)}
                      </div>
                    </div>

                    {token && routeSource !== 'my' && (
                      <>
                        {selectedCityTrip?.id === trip.id && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`/trip/${trip.id}`, '_blank');
                            }}
                            style={{
                              backgroundColor: 'white',
                              color: 'black',
                              border: '1px solid black',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              textTransform: 'uppercase',
                            }}
                          >
                            DETAILS
                          </button>
                        )}
                        <button
                          onClick={(e) => onLikeClick(e, trip.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0 0 0 8px',
                            color: selectedCityTrip?.id === trip.id
                              ? isLiked
                                ? '#ff4d4f'
                                : 'rgba(255,255,255,0.7)'
                              : isLiked
                                ? '#ff4d4f'
                                : '#bbb',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          {isLiked ? (
                            <FavoriteIcon sx={{ fontSize: 20 }} />
                          ) : (
                            <FavoriteBorderIcon sx={{ fontSize: 20 }} />
                          )}
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ flex: 1 }} />
        </>
      )}
      
      {/* ── Show Details button (завжди внизу) ── */}
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
          для поїздки
        </p>
      )}
      
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
      
      <button
        onClick={onShowDetails}
        disabled={selectedRoutePoints.length < 2 || saveLoading}
        title={
          selectedRoutePoints.length < 2
            ? 'Оберіть щонайменше 2 точки'
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

      {!token && selectedRoutePoints.length >= 2 && (
        <p
          style={{
            margin: '8px 0 0',
            fontSize: '12px',
            color: '#999',
            textAlign: 'center',
          }}
        >
          Увійдіть для перегляду деталей поїздки
        </p>
      )}
    </div>
  );
};
