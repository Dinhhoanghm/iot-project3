import React from 'react';
import { Device } from '../types';

interface DeviceCardProps {
  device: Device;
  onClick: () => void;
  isSelected?: boolean;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onClick, isSelected }) => {
  const statusColor = device.status === 'ONLINE' ? 'bg-green-500' : 'bg-red-500';
  const lastSeen = new Date(device.lastSeen).toLocaleString();

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-lg truncate">{device.name}</h3>
        <span className={`w-3 h-3 rounded-full ${statusColor}`} title={device.status} />
      </div>
      <p className="text-sm text-gray-500 truncate">{device.deviceId}</p>
      <div className="mt-2 text-xs text-gray-400">
        <p>IP: {device.ipAddress || 'N/A'}</p>
        <p>RSSI: {device.rssi !== null ? `${device.rssi} dBm` : 'N/A'}</p>
        <p>Last seen: {lastSeen}</p>
      </div>
    </div>
  );
};

export default DeviceCard;
