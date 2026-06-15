import { Plant } from '@/types';
import { get, post, put, del } from './request';

export const plantService = {
  getPlants: async (): Promise<Plant[]> => {
    return get('/plants');
  },

  getPlant: async (id: string): Promise<Plant> => {
    return get(`/plants/${id}`);
  },

  createPlant: async (data: Partial<Plant>): Promise<Plant> => {
    return post('/plants', data);
  },

  updatePlant: async (id: string, data: Partial<Plant>): Promise<Plant> => {
    return put(`/plants/${id}`, data);
  },

  deletePlant: async (id: string): Promise<void> => {
    return del(`/plants/${id}`);
  },
};
