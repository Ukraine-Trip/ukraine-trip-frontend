import { api } from './auth';
import type { Trip } from '../types/types';

export const getAllTrips = (): Promise<Trip[]> =>
  api.get<Trip[]>('/trips/').then((res) => res.data);