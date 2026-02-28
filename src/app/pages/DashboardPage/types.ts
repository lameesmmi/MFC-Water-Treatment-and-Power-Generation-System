export type SensorName =
  | 'ph' | 'flowRate' | 'tds' | 'salinity'
  | 'conductivity' | 'temperature' | 'voltage' | 'current';

export type SensorConnectionMap = Record<SensorName, boolean>;

export interface SensorData {
  ph:           number;
  flowRate:     number;
  tds:          number;
  salinity:     number;
  conductivity: number;
  temperature:  number;
  voltage:      number;
  current:      number;
}

export interface HistoricalData {
  timestamp:    string;
  time:         string;
  ph:           number;
  flowRate:     number;
  tds:          number;
  salinity:     number;
  conductivity: number;
  temperature:  number;
  voltage:      number;
  current:      number;
}
