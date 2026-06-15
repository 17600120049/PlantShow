import { create } from 'zustand';
import { Plant } from '@/types';
import { plantService } from '@/services/plantService';

interface PlantStore {
  plants: Plant[];
  currentPlant: Plant | null;
  fetchPlants: () => Promise<void>;
  fetchPlant: (id: string) => Promise<void>;
  createPlant: (data: Partial<Plant>) => Promise<void>;
  updatePlant: (id: string, data: Partial<Plant>) => Promise<void>;
  deletePlant: (id: string) => Promise<void>;
}

export const usePlantStore = create<PlantStore>((set) => ({
  plants: [],
  currentPlant: null,
  fetchPlants: async () => {
    try {
      const plants = await plantService.getPlants();
      set({ plants });
    } catch (error) {
      console.error('Fetch plants failed:', error);
    }
  },
  fetchPlant: async (id) => {
    try {
      const plant = await plantService.getPlant(id);
      set({ currentPlant: plant });
    } catch (error) {
      console.error('Fetch plant failed:', error);
    }
  },
  createPlant: async (data) => {
    try {
      const plant = await plantService.createPlant(data);
      set((state) => ({ plants: [plant, ...state.plants] }));
    } catch (error) {
      console.error('Create plant failed:', error);
    }
  },
  updatePlant: async (id, data) => {
    try {
      const plant = await plantService.updatePlant(id, data);
      set((state) => ({
        plants: state.plants.map((p) => (p.id === id ? plant : p)),
        currentPlant: state.currentPlant?.id === id ? plant : state.currentPlant,
      }));
    } catch (error) {
      console.error('Update plant failed:', error);
    }
  },
  deletePlant: async (id) => {
    try {
      await plantService.deletePlant(id);
      set((state) => ({
        plants: state.plants.filter((p) => p.id !== id),
        currentPlant: state.currentPlant?.id === id ? null : state.currentPlant,
      }));
    } catch (error) {
      console.error('Delete plant failed:', error);
    }
  },
}));
