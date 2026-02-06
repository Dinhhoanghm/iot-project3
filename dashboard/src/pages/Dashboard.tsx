import React, { useEffect, useState, useCallback } from 'react';
import { deviceApi } from '../services/api';
import wsService from '../services/websocket';
import { Device, SensorData, SensorReading } from '../types';
import DeviceCard from '../components/DeviceCard';
import SensorGauge from '../components/SensorGauge';
import SensorChart from '../components/SensorChart';
import AlertBanner from '../components/AlertBanner';

const Dashboard: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [liveData, setLiveData] = useState<SensorData | null>(null);
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  const loadDevices = useCallback(async () => {
    try {
      const data = await deviceApi.getAll();
      setDevices(data);
      if (!selectedDevice && data.length > 0) {
        setSelectedDevice(data[0].deviceId);
      }
    } catch (error) {
      console.error('Failed to load devices:', error);
    }
  }, [selectedDevice]);

  const loadReadings = useCallback(async (deviceId: string) => {
    try {
      const response = await deviceApi.getReadings(deviceId, 0, 50);
      setReadings(response.content.reverse());
    } catch (error) {
      console.error('Failed to load readings:', error);
    }
  }, []);

  useEffect(() => {
    loadDevices();
    wsService.connect();

    const statusUnsub = wsService.subscribeStatus(() => {
      loadDevices();
    });

    return () => {
      statusUnsub();
    };
  }, [loadDevices]);

  useEffect(() => {
    if (!selectedDevice) return;

    loadReadings(selectedDevice);

    const unsub = wsService.subscribeSensors(selectedDevice, (data) => {
      setLiveData(data);

      // Check for alerts
      if (data.sensors.obstacle === 0) {
        addAlert(`Obstacle detected on ${data.deviceId}`);
      }
      if (data.sensors.vibration === 0) {
        addAlert(`Vibration detected on ${data.deviceId}`);
      }

      // Add to readings chart
      setReadings((prev) => {
        const newReading: SensorReading = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          obstacle: data.sensors.obstacle,
          vibration: data.sensors.vibration,
          light: data.sensors.light,
          buzzer: data.outputs.buzzer,
          led: data.outputs.led,
        };
        const updated = [...prev, newReading];
        return updated.slice(-50);
      });
    });

    return () => unsub();
  }, [selectedDevice, loadReadings]);

  const addAlert = (message: string) => {
    setAlerts((prev) => {
      if (prev.includes(message)) return prev;
      return [...prev.slice(-4), message];
    });
    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a !== message));
    }, 5000);
  };

  const handleRename = async () => {
    if (!selectedDevice || !newName.trim()) return;
    try {
      await deviceApi.update(selectedDevice, newName.trim());
      loadDevices();
      setEditingName(false);
    } catch (error) {
      console.error('Failed to rename device:', error);
    }
  };

  const selectedDeviceInfo = devices.find((d) => d.deviceId === selectedDevice);
  const isAlertActive = liveData && (liveData.sensors.obstacle === 0 || liveData.sensors.vibration === 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">IoT Sensor Dashboard</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mb-6 space-y-2">
            {alerts.map((alert, idx) => (
              <AlertBanner
                key={idx}
                type="warning"
                message={alert}
                onDismiss={() => setAlerts((prev) => prev.filter((_, i) => i !== idx))}
              />
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Device List */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold mb-4">Devices ({devices.length})</h2>
            <div className="space-y-3">
              {devices.map((device) => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  isSelected={device.deviceId === selectedDevice}
                  onClick={() => setSelectedDevice(device.deviceId)}
                />
              ))}
              {devices.length === 0 && (
                <p className="text-gray-500 text-sm">No devices connected</p>
              )}
            </div>
          </div>

          {/* Device Details */}
          <div className="lg:col-span-3">
            {selectedDevice && selectedDeviceInfo ? (
              <>
                {/* Device Info */}
                <div className="bg-white p-4 rounded-lg border mb-6">
                  <div className="flex items-center justify-between">
                    {editingName ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="border rounded px-2 py-1"
                          placeholder="Device name"
                        />
                        <button
                          onClick={handleRename}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingName(false)}
                          className="text-gray-500 px-3 py-1 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div>
                        <h2 className="text-xl font-bold">{selectedDeviceInfo.name}</h2>
                        <p className="text-gray-500 text-sm">{selectedDeviceInfo.deviceId}</p>
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setEditingName(true);
                        setNewName(selectedDeviceInfo.name);
                      }}
                      className="text-blue-500 text-sm hover:underline"
                    >
                      Rename
                    </button>
                  </div>
                </div>

                {/* Live Sensors */}
                <h3 className="text-lg font-semibold mb-4">
                  Live Sensor Data
                  {isAlertActive && (
                    <span className="ml-2 text-red-500 animate-pulse">ALERT!</span>
                  )}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <SensorGauge
                    label="Obstacle"
                    value={liveData?.sensors.obstacle === 0 ? 'DETECTED' : 'Clear'}
                    alert={liveData?.sensors.obstacle === 0}
                  />
                  <SensorGauge
                    label="Vibration"
                    value={liveData?.sensors.vibration === 0 ? 'DETECTED' : 'Stable'}
                    alert={liveData?.sensors.vibration === 0}
                  />
                  <SensorGauge
                    label="Light Level"
                    value={liveData?.sensors.light ?? 0}
                    max={1024}
                  />
                  <SensorGauge
                    label="Buzzer"
                    value={liveData?.outputs.buzzer ? 'ON' : 'OFF'}
                    alert={liveData?.outputs.buzzer === 1}
                  />
                  <SensorGauge
                    label="LED"
                    value={liveData?.outputs.led ? 'ON' : 'OFF'}
                    alert={liveData?.outputs.led === 1}
                  />
                </div>

                {/* Charts */}
                <h3 className="text-lg font-semibold mb-4">Historical Data</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SensorChart
                    readings={readings}
                    dataKey="light"
                    title="Light Level"
                    color="#F59E0B"
                  />
                  <SensorChart
                    readings={readings}
                    dataKey="obstacle"
                    title="Obstacle Detection"
                    color="#EF4444"
                  />
                  <SensorChart
                    readings={readings}
                    dataKey="vibration"
                    title="Vibration Detection"
                    color="#8B5CF6"
                  />
                  <SensorChart
                    readings={readings}
                    dataKey="buzzer"
                    title="Buzzer State"
                    color="#10B981"
                  />
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500 py-20">
                <p>Select a device to view details</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
