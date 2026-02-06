import axios from 'axios';
import { Device, SensorReading, PageResponse } from '../types';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const deviceApi = {
  getAll: async (): Promise<Device[]> => {
    const response = await api.get<Device[]>('/devices');
    return response.data;
  },

  getById: async (deviceId: string): Promise<Device> => {
    const response = await api.get<Device>(`/devices/${deviceId}`);
    return response.data;
  },

  update: async (deviceId: string, name: string): Promise<Device> => {
    const response = await api.put<Device>(`/devices/${deviceId}`, { name });
    return response.data;
  },

  getReadings: async (
    deviceId: string,
    page = 0,
    size = 100
  ): Promise<PageResponse<SensorReading>> => {
    const response = await api.get<PageResponse<SensorReading>>(
      `/devices/${deviceId}/readings`,
      { params: { page, size } }
    );
    return response.data;
  },

  getLatestReading: async (deviceId: string): Promise<SensorReading | null> => {
    try {
      const response = await api.get<SensorReading>(
        `/devices/${deviceId}/readings/latest`
      );
      return response.data;
    } catch {
      return null;
    }
  },

  getReadingsInRange: async (
    deviceId: string,
    start: Date,
    end: Date
  ): Promise<SensorReading[]> => {
    const response = await api.get<SensorReading[]>(
      `/devices/${deviceId}/readings/range`,
      {
        params: {
          start: start.toISOString(),
          end: end.toISOString(),
        },
      }
    );
    return response.data;
  },
};

export default api;
