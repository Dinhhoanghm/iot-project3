import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { SensorData } from '../types';

type MessageCallback = (data: SensorData) => void;
type StatusCallback = (data: unknown) => void;

class WebSocketService {
  private client: Client | null = null;
  private sensorCallbacks: Map<string, MessageCallback[]> = new Map();
  private statusCallbacks: StatusCallback[] = [];
  private connected = false;

  connect() {
    if (this.client && this.connected) {
      return;
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        console.log('STOMP: ' + str);
      },
    });

    this.client.onConnect = () => {
      console.log('WebSocket connected');
      this.connected = true;

      // Subscribe to all sensors
      this.client?.subscribe('/topic/sensors', (message: IMessage) => {
        const data = JSON.parse(message.body) as SensorData;
        this.notifySensorCallbacks(data.deviceId, data);
        this.notifySensorCallbacks('all', data);
      });

      // Subscribe to device status updates
      this.client?.subscribe('/topic/devices/status', (message: IMessage) => {
        try {
          const data = JSON.parse(message.body);
          this.statusCallbacks.forEach((cb) => cb(data));
        } catch {
          this.statusCallbacks.forEach((cb) => cb(message.body));
        }
      });
    };

    this.client.onStompError = (frame) => {
      console.error('STOMP error:', frame.headers['message']);
    };

    this.client.onDisconnect = () => {
      console.log('WebSocket disconnected');
      this.connected = false;
    };

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.connected = false;
    }
  }

  subscribeSensors(deviceId: string, callback: MessageCallback) {
    if (!this.sensorCallbacks.has(deviceId)) {
      this.sensorCallbacks.set(deviceId, []);
    }
    this.sensorCallbacks.get(deviceId)!.push(callback);

    return () => {
      const callbacks = this.sensorCallbacks.get(deviceId);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  subscribeStatus(callback: StatusCallback) {
    this.statusCallbacks.push(callback);
    return () => {
      const index = this.statusCallbacks.indexOf(callback);
      if (index > -1) {
        this.statusCallbacks.splice(index, 1);
      }
    };
  }

  private notifySensorCallbacks(deviceId: string, data: SensorData) {
    const callbacks = this.sensorCallbacks.get(deviceId);
    if (callbacks) {
      callbacks.forEach((cb) => cb(data));
    }
  }
}

export const wsService = new WebSocketService();
export default wsService;
