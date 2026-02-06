import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { SensorReading } from '../types';

interface SensorChartProps {
  readings: SensorReading[];
  dataKey: 'obstacle' | 'vibration' | 'light' | 'buzzer' | 'led';
  title: string;
  color?: string;
}

const SensorChart: React.FC<SensorChartProps> = ({
  readings,
  dataKey,
  title,
  color = '#3B82F6',
}) => {
  const data = readings.map((r) => ({
    time: new Date(r.timestamp).toLocaleTimeString(),
    [dataKey]: r[dataKey],
  }));

  return (
    <div className="bg-white p-4 rounded-lg border">
      <h4 className="font-semibold mb-4">{title}</h4>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tick={{ fontSize: 10 }} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SensorChart;
