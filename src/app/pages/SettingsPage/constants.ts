import type { SystemSettings } from '@/app/services/api';

export interface SensorMeta {
  label:  string;
  unit:   string;
  absMin: number;
  absMax: number;
  step:   number;
}

export type SensorKey = keyof SystemSettings['thresholds'];

export const SENSOR_META: Record<SensorKey, SensorMeta> = {
  ph:          { label: 'pH Level',    unit: 'pH',    absMin: 0, absMax: 14,    step: 0.1 },
  tds:         { label: 'TDS',         unit: 'ppm',   absMin: 0, absMax: 10000, step: 10  },
  temperature: { label: 'Temperature', unit: '°C',    absMin: 0, absMax: 60,    step: 0.5 },
  flow_rate:   { label: 'Flow Rate',   unit: 'L/min', absMin: 0, absMax: 20,    step: 0.1 },
  voltage:     { label: 'Voltage',     unit: 'V',     absMin: 0, absMax: 50,    step: 0.1 },
  current:     { label: 'Current',     unit: 'A',     absMin: 0, absMax: 10,    step: 0.1 },
};
