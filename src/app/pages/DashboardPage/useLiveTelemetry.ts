import { useState, useEffect, useRef } from 'react';
import { getSocket } from '@/app/services/socket';
import type { PumpCommand } from '@/app/services/api';
import { SensorData, SensorConnectionMap, HistoricalData } from './types';
import { DEFAULT_SENSOR_DATA, ALL_OFFLINE, SENSOR_TIMEOUT_MS } from './constants';

interface LiveTelemetry {
  socketConnected: boolean;
  isLive:          boolean;
  sensorData:      SensorData;
  sensorConnected: SensorConnectionMap;
  valveStatus:     'OPEN' | 'CLOSED' | null;
  flowHistory:     Array<{ time: number; flow: number }>;
  historicalData:  HistoricalData[];
  pumpMode:        PumpCommand;
  setPumpMode:     (cmd: PumpCommand) => void;
}

export function useLiveTelemetry(): LiveTelemetry {
  const [socketConnected, setSocketConnected] = useState(false);
  const [isLive, setIsLive]                   = useState(false);
  const [sensorData, setSensorData]           = useState<SensorData>(DEFAULT_SENSOR_DATA);
  const [sensorConnected, setSensorConnected] = useState<SensorConnectionMap>(ALL_OFFLINE);
  const [valveStatus, setValveStatus]         = useState<'OPEN' | 'CLOSED' | null>(null);
  const [pumpMode, setPumpMode]               = useState<PumpCommand>('AUTO');
  const [flowHistory, setFlowHistory]         = useState<Array<{ time: number; flow: number }>>([]);
  const [historicalData, setHistoricalData]   = useState<HistoricalData[]>([]);

  const lastDataRef = useRef<number>(0);
  const flowTimeRef = useRef(0);

  useEffect(() => {
    const socket = getSocket();

    const onConnect    = () => setSocketConnected(true);
    const onDisconnect = () => {
      setSocketConnected(false);
      setIsLive(false);
      setSensorConnected(ALL_OFFLINE);
    };

    const onTelemetry = (data: Record<string, number | string>) => {
      lastDataRef.current = Date.now();
      setIsLive(true);

      // Merge incoming fields — absent sensors keep their last value
      setSensorData(prev => ({
        ...prev,
        ...(data.ph           != null && { ph:           data.ph           as number }),
        ...(data.flow_rate    != null && { flowRate:     data.flow_rate    as number }),
        ...(data.tds          != null && { tds:          data.tds          as number }),
        ...(data.salinity     != null && { salinity:     data.salinity     as number }),
        ...(data.conductivity != null && { conductivity: data.conductivity as number }),
        ...(data.temperature  != null && { temperature:  data.temperature  as number }),
        ...(data.voltage      != null && { voltage:      data.voltage      as number }),
        ...(data.current      != null && { current:      data.current      as number }),
      }));

      if (data.valve_status != null) {
        setValveStatus(data.valve_status as 'OPEN' | 'CLOSED');
      }

      setSensorConnected({
        ph:           data.ph           != null,
        flowRate:     data.flow_rate    != null,
        tds:          data.tds          != null,
        salinity:     data.salinity     != null,
        conductivity: data.conductivity != null,
        temperature:  data.temperature  != null,
        voltage:      data.voltage      != null,
        current:      data.current      != null,
      });

      if (data.flow_rate != null) {
        setFlowHistory(prev => {
          const t = flowTimeRef.current++;
          return [...prev.slice(-59), { time: t, flow: data.flow_rate as number }];
        });
      }

      const ts    = new Date(data.timestamp as string);
      const entry: HistoricalData = {
        timestamp:    data.timestamp    as string,
        time:         ts.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        ph:           data.ph           as number,
        flowRate:     data.flow_rate    as number,
        tds:          data.tds          as number,
        salinity:     data.salinity     as number,
        conductivity: data.conductivity as number,
        temperature:  data.temperature  as number,
        voltage:      data.voltage      as number,
        current:      data.current      as number,
      };
      setHistoricalData(prev => [...prev.slice(-99), entry]);
    };

    // Sync pump mode when another client sends a command
    const onPumpCommand = ({ command }: { command: PumpCommand }) => {
      setPumpMode(command);
    };

    socket.on('connect',        onConnect);
    socket.on('disconnect',     onDisconnect);
    socket.on('live_telemetry', onTelemetry);
    socket.on('pump_command',   onPumpCommand);

    // Drop isLive if no packet arrives within the timeout window
    const offlineTimer = setInterval(() => {
      if (lastDataRef.current > 0 && Date.now() - lastDataRef.current > SENSOR_TIMEOUT_MS) {
        setIsLive(false);
        setSensorConnected(ALL_OFFLINE);
      }
    }, 3000);

    return () => {
      socket.off('connect',        onConnect);
      socket.off('disconnect',     onDisconnect);
      socket.off('live_telemetry', onTelemetry);
      socket.off('pump_command',   onPumpCommand);
      clearInterval(offlineTimer);
    };
  }, []);

  return {
    socketConnected, isLive,
    sensorData, sensorConnected, valveStatus,
    flowHistory, historicalData,
    pumpMode, setPumpMode,
  };
}
