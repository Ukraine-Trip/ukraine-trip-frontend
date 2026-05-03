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

  /* Стилі для твоїх кастомних іконок маркерів */
  .custom-mui-icon {
    background: none;
    border: none;
  }

  /* СТИЛІЗАЦІЯ КЛАСТЕРА (кола з цифрами) */
  .custom-cluster-icon {
    background: #ffffff;
    border: 2px solid #222222;
    border-radius: 50%;
    color: #222222;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 14px;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
    transition: all 0.2s ease-in-out;
  }

  .custom-cluster-icon:hover {
    transform: scale(1.1);
    background: #f8f8f8;
    border-color: #000;
  }
`;
