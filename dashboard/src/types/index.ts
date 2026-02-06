export interface Device {
  id: number;
  deviceId: string;
  name: string;
  ipAddress: string | null;
  rssi: number | null;
  status: 'ONLINE' | 'OFFLINE' | 'UNKNOWN';
  lastSeen: string;
  createdAt: string;
  updatedAt: string;
}

export interface SensorReading {
  id: number;
  timestamp: string;
  obstacle: number;
  vibration: number;
  light: number;
  buzzer: number;
  led: number;
}

export interface SensorData {
  deviceId: string;
  timestamp: number;
  sensors: {
    obstacle: number;
    vibration: number;
    light: number;
  };
  outputs: {
    buzzer: number;
    led: number;
  };
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
