import { api } from './auth';

export interface City {
  id: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
}

export const getCities = (): Promise<City[]> =>
  api.get<City[]>('/cities/').then((res) => res.data);