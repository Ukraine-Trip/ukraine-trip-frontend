import { api } from './auth';
import type { Trip } from '../types/types';

export const getAllTrips = (): Promise<Trip[]> =>
  api.get<Trip[]>('/trips/').then((res) => res.data);

export const getMyTrips = (token: string): Promise<Trip[]> =>
  api
    .get<Trip[]>('/trips/my', { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => res.data);