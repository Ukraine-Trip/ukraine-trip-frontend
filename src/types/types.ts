export interface TripLocation {
  id: string;
  lat: number;
  lon: number;
  name?: string;
}

export interface TripNode {
  id: string;
  location_id: string;
  order_index: number;
  location: TripLocation;
}

export interface Trip {
  id: string;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  user_id: number;
  latitude: number | null;
  longitude: number | null;
  trip_nodes: TripNode[];
}

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
