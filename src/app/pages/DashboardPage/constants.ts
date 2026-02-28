import { SensorData, SensorConnectionMap } from './types';

export const SENSOR_TIMEOUT_MS = 15_000;

export const DEFAULT_SENSOR_DATA: SensorData = {
  ph: 0, flowRate: 0, tds: 0, salinity: 0,
  conductivity: 0, temperature: 0, voltage: 0, current: 0,
};

export const ALL_OFFLINE: SensorConnectionMap = {
  ph: false, flowRate: false, tds: false, salinity: false,
  conductivity: false, temperature: false, voltage: false, current: false,
};
