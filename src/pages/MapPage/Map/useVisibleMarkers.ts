import { useMemo } from 'react';
import type { ItineraryPoint } from './types';

export const useVisibleMarkers = (
  itinerary: ItineraryPoint[],
  zoom: number
) => {
  return useMemo(() => {
    return itinerary.filter((point) => {
      if (zoom <= 7) return point.priority === 1; // Тільки топ (Київ, Львів)
      if (zoom <= 9) return point.priority <= 2; // Додаємо великі пам'ятки
      if (zoom <= 11) return point.priority <= 3; // Середні цікавинки
      if (zoom <= 13) return point.priority <= 4; // Кафе, парки
      return true; // На макс. зумі - все, навіть зупинки (5)
    });
  }, [itinerary, zoom]);
};
