import { useMemo } from 'react';
import type { ItineraryPoint } from '../../../types/types.ts';

export const useVisibleMarkers = (
  itinerary: ItineraryPoint[],
  zoom: number
) => {
  return useMemo(() => {
    return itinerary.filter((point) => {
      if (zoom <= 7) return point.priority === 1;
      if (zoom <= 9) return point.priority <= 2;
      if (zoom <= 11) return point.priority <= 3;
      if (zoom <= 13) return point.priority <= 4;
      return true;
    });
  }, [itinerary, zoom]);
};
