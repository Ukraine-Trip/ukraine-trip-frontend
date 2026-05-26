import { api } from './auth';
import type { Trip } from '../types/types';

export const createTrip = (
  payload: { title: string; location_ids: string[]; optimize?: boolean },
  token: string,
): Promise<Trip> =>
  api
    .post<Trip>('/trips/build', payload, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => res.data);

    export const createTripAI = (
  payload: { "prompt": string },
  token: string,
): Promise<Trip> =>
  api
    .post<Trip>('/trips/genarate-ai', payload, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => res.data);

export const getAllTrips = (): Promise<Trip[]> =>
  api.get<Trip[]>('/trips/').then((res) => res.data);

export const getMyTrips = (token: string): Promise<Trip[]> => {
  if (!token || token === 'null' || token === 'undefined') {
    return Promise.resolve([]);
  }
  const cleanToken = token.replace(/["']/g, '');
  return api
    .get<Trip[]>('/trips/', {
      params: { filter_type: 'my' },
      headers: { Authorization: `Bearer ${cleanToken}` },
    })
    .then((res) => res.data);
};

export const getTripById = (tripId: string): Promise<Trip> =>
  api.get<Trip>(`/trips/${tripId}`).then((res) => res.data);

export const updateTrip = (
  tripId: string,
  payload: Partial<Pick<Trip, 'title' | 'description' | 'start_date' | 'end_date'>> & {
    location_ids?: string[];
  },
  token?: string,
): Promise<Trip> =>
  api
    .put<Trip>(`/trips/${tripId}`, payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
    .then((res) => res.data);

// Функція для отримання всіх твоїх лайків (з правильним URL)
export const getLikedTrips = (token: string): Promise<Trip[]> => {
  if (!token || token === 'null' || token === 'undefined') {
    return Promise.resolve([]);
  }
  const cleanToken = token.replace(/["']/g, '');
  return api
    .get<Trip[]>('/users/me/liked-trips', {
      headers: { Authorization: `Bearer ${cleanToken}` },
    })
    .then((res) => res.data);
};

// Функція для кліку по сердечку
export const toggleTripLike = (tripId: string, token: string): Promise<any> => {
  const cleanToken = token.replace(/["']/g, '');
  
  // Відправляємо null замість {}, щоб FastAPI не сварився на зайве тіло запиту
  return api.post(`/trips/${tripId}/like`, null, {
    headers: { Authorization: `Bearer ${cleanToken}` },
  });
};
