import { api } from './auth';

export interface Location {
  id: string;
  name: string;
  lat: number;
  lon: number;
  region: string;
  type: string;
  rating: number;
}

export interface LocationFilters {
  region?: string;
  type?: string;
  min_rating?: number;
  zoom?: number;
}

export const getLocations = (filters?: LocationFilters): Promise<Location[]> =>
  api.get<Location[]>('/locations/', { params: filters }).then((res) => res.data);
