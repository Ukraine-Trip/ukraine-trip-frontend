import L from 'leaflet';

/**
 * Базові налаштування для всіх іконок, щоб не дублювати код
 */
const ICON_DEFAULT_SETTINGS = {
  iconSize: [32, 32] as L.PointExpression,
  iconAnchor: [16, 32] as L.PointExpression,
  popupAnchor: [0, -32] as L.PointExpression,
};

// Іконка для міст
export const cityIcon = new L.Icon({
  ...ICON_DEFAULT_SETTINGS,
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/149/149060.png',
});

// Іконка для пам'яток (landmarks)
export const landmarkIcon = new L.Icon({
  ...ICON_DEFAULT_SETTINGS,
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
});

// Сюди легко додати нові іконки, наприклад, для готелів чи кафе
export const hotelIcon = new L.Icon({
  ...ICON_DEFAULT_SETTINGS,
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2983/2983803.png',
});
