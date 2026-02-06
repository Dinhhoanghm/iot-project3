import React from 'react';

interface SensorGaugeProps {
  label: string;
  value: number | string;
  unit?: string;
  alert?: boolean;
  max?: number;
}

const SensorGauge: React.FC<SensorGaugeProps> = ({
  label,
  value,
  unit = '',
  alert = false,
  max = 100
}) => {
  const numValue = typeof value === 'number' ? value : 0;
  const percentage = Math.min((numValue / max) * 100, 100);

  return (
    <div className={`p-4 rounded-lg ${alert ? 'bg-red-100 border-red-300' : 'bg-gray-100'} border`}>
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${alert ? 'text-red-600' : 'text-gray-800'}`}>
        {value} {unit}
      </div>
      {max > 0 && typeof value === 'number' && (
        <div className="mt-2 h-2 bg-gray-300 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${alert ? 'bg-red-500' : 'bg-blue-500'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default SensorGauge;
