import styled from 'styled-components';

export const MapWrapper = styled.div`
  width: 100%;
  height: calc(100vh - 64px);
  position: relative;
  border-radius: 12px;
  overflow: hidden;

  .leaflet-map-container {
    height: 100%;
    width: 100%;
    z-index: 1;
  }

  /* ПОВНЕ ВИДАЛЕННЯ ТЕКСТОВОГО МАРШРУТУ З ЕКРАНУ */
  .leaflet-routing-container,
  .leaflet-routing-alt,
  .leaflet-routing-geocoders {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
  }

  /* Стилі для твоїх кастомних іконок */
  .custom-mui-icon {
    background: none;
    border: none;
  }
`;
