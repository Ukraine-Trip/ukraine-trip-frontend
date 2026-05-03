import type { ItineraryPoint } from '../types/types.ts';

export const calculateDistance = (
  p1: ItineraryPoint,
  p2: ItineraryPoint
): number => {
  return Math.sqrt(Math.pow(p2.lat - p1.lat, 2) + Math.pow(p2.lng - p1.lng, 2));
};

export const optimizeRoute = (points: ItineraryPoint[]): ItineraryPoint[] => {
  if (points.length <= 2) return points;
  const result = [points[0]]; // Старт завжди фіксований
  const remaining = [...points.slice(1)];

  while (remaining.length > 0) {
    const last = result[result.length - 1];
    let closestIdx = 0;
    let minD = calculateDistance(last, remaining[0]);

    for (let i = 1; i < remaining.length; i++) {
      const d = calculateDistance(last, remaining[i]);
      if (d < minD) {
        minD = d;
        closestIdx = i;
      }
    }
    result.push(remaining.splice(closestIdx, 1)[0]);
  }
  return result;
};
