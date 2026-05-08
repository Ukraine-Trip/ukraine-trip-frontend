import styled from 'styled-components';

export const MapPageLayout = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const RouteSidebar = styled.aside<{ $collapsed?: boolean }>`
  width: ${({ $collapsed }) => ($collapsed ? '0' : '30%')};
  height: 100%;
  background: #ffffff;
  border-right: ${({ $collapsed }) => ($collapsed ? 'none' : '1px solid #ebebeb')};
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  z-index: 10;
  padding-top: ${({ $collapsed }) => ($collapsed ? '0' : '80px')};
  transition: width 0.3s ease, padding 0.3s ease;

  @media (max-width: 768px) {
    width: 100%;
    height: ${({ $collapsed }) => ($collapsed ? '0' : 'auto')};
    max-height: ${({ $collapsed }) => ($collapsed ? '0' : '42vh')};
    border-right: none;
    border-bottom: ${({ $collapsed }) => ($collapsed ? 'none' : '1px solid #ebebeb')};
    padding-top: ${({ $collapsed }) => ($collapsed ? '0' : '64px')};
    transition: max-height 0.3s ease, padding 0.3s ease;
    overflow-y: auto;
  }
`;

export const MapArea = styled.div`
  flex: 1;
  position: relative;
  height: 100%;
  min-width: 0;
  overflow: hidden;

  @media (max-width: 768px) {
    flex: 1;
    min-height: 55vh;
  }
`;

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
