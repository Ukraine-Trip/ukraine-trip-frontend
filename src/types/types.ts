export interface ItineraryPoint {
  id: string;
  name: string;
  category: 'city' | 'landmark' | 'cafe' | 'park' | 'culture' | 'stop';
  priority: 1 | 2 | 3 | 4 | 5; // 1 - топ, 5 - дрібниці
  description?: string;
  imageUrl?: string;
  lat: number;
  lng: number;
}
