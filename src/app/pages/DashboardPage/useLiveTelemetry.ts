import { useState, useEffect, useRef } from 'react';
import { getSocket } from '@/app/services/socket';
import type { PumpCommand, Pump2Command, Pump3Command } from '@/app/services/api';
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
  pump2Mode:       Pump2Command;
  setPump2Mode:    (cmd: Pump2Command) => void;
  pump3Mode:       Pump3Command;
  setPump3Mode:    (cmd: Pump3Command) => void;
}

export function useLiveTelemetry(): LiveTelemetry {
  const [socketConnected, setSocketConnected] = useState(false);
  const [isLive, setIsLive]                   = useState(false);
  const [sensorData, setSensorData]           = useState<SensorData>(DEFAULT_SENSOR_DATA);
  const [sensorConnected, setSensorConnected] = useState<SensorConnectionMap>(ALL_OFFLINE);
  const [valveStatus, setValveStatus]         = useState<'OPEN' | 'CLOSED' | null>(null);
  const [pumpMode, setPumpMode]               = useState<PumpCommand>('AUTO');
  const [pump2Mode, setPump2Mode]             = useState<Pump2Command>('MANUAL_OFF');
  const [pump3Mode, setPump3Mode]             = useState<Pump3Command>('MANUAL_OFF');
  const [flowHistory, setFlowHistory]         = useState<Array<{ time: number; flow: number }>>([]);
  const [historicalData, setHistoricalData]   = useState<HistoricalData[]>([]);

  const lastDataRef = useRef<number>(0);
  const flowTimeRef = useRef(0);
  // Per-sensor last-seen timestamps. A sensor is "connected" only while its
  // timestamp is within SENSOR_TIMEOUT_MS — not just because it appeared in
  // the latest message. This prevents sensors from flashing offline whenever
  // another ESP32 publishes a partial payload that omits them.
  const lastSeenRef = useRef<Record<keyof SensorConnectionMap, number>>({
    ph: 0, flowRate: 0, tds: 0, salinity: 0,
    conductivity: 0, temperature: 0, voltage: 0, current: 0,
  });
  // Mirrors sensorData synchronously so the debounced historical flush can
  // read fully-merged values without chasing async state.
  const latestSensorRef   = useRef<SensorData>({ ...DEFAULT_SENSOR_DATA });
  const latestTimestampRef = useRef<string>('');
  // Debounce handle: multiple ESP32s publishing in quick succession produce ONE
  // merged historical entry instead of several partial ones.
  const histDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const socket = getSocket();

    const buildConnectionMap = (): SensorConnectionMap => {
      const now = Date.now();
      const ls  = lastSeenRef.current;
      return {
        ph:           ls.ph           > 0 && now - ls.ph           < SENSOR_TIMEOUT_MS,
        flowRate:     ls.flowRate     > 0 && now - ls.flowRate     < SENSOR_TIMEOUT_MS,
        tds:          ls.tds          > 0 && now - ls.tds          < SENSOR_TIMEOUT_MS,
        salinity:     ls.salinity     > 0 && now - ls.salinity     < SENSOR_TIMEOUT_MS,
        conductivity: ls.conductivity > 0 && now - ls.conductivity < SENSOR_TIMEOUT_MS,
        temperature:  ls.temperature  > 0 && now - ls.temperature  < SENSOR_TIMEOUT_MS,
        voltage:      ls.voltage      > 0 && now - ls.voltage      < SENSOR_TIMEOUT_MS,
        current:      ls.current      > 0 && now - ls.current      < SENSOR_TIMEOUT_MS,
      };
    };

    const resetLastSeen = () => {
      lastSeenRef.current = {
        ph: 0, flowRate: 0, tds: 0, salinity: 0,
        conductivity: 0, temperature: 0, voltage: 0, current: 0,
      };
    };

    const onConnect    = () => setSocketConnected(true);
    const onDisconnect = () => {
      setSocketConnected(false);
      setIsLive(false);
      resetLastSeen();
      setSensorConnected(ALL_OFFLINE);
    };

    const onTelemetry = (data: Record<string, number | string>) => {
      const now = Date.now();
      lastDataRef.current = now;
      setIsLive(true);

      // Stamp each sensor that appears in this message
      const ls = lastSeenRef.current;
      if (data.ph           != null) ls.ph           = now;
      if (data.flow_rate    != null) ls.flowRate      = now;
      if (data.tds          != null) ls.tds           = now;
      if (data.salinity     != null) ls.salinity      = now;
      if (data.conductivity != null) ls.conductivity  = now;
      if (data.temperature  != null) ls.temperature   = now;
      if (data.voltage      != null) ls.voltage       = now;
      if (data.current      != null) ls.current       = now;

      // Merge incoming fields — absent sensors keep their last value.
      // Also mirror into latestSensorRef so the debounced flush sees merged values.
      const merged: SensorData = {
        ...latestSensorRef.current,
        ...(data.ph           != null && { ph:           data.ph           as number }),
        ...(data.flow_rate    != null && { flowRate:     data.flow_rate    as number }),
        ...(data.tds          != null && { tds:          data.tds          as number }),
        ...(data.salinity     != null && { salinity:     data.salinity     as number }),
        ...(data.conductivity != null && { conductivity: data.conductivity as number }),
        ...(data.temperature  != null && { temperature:  data.temperature  as number }),
        ...(data.voltage      != null && { voltage:      data.voltage      as number }),
        ...(data.current      != null && { current:      data.current      as number }),
      };
      latestSensorRef.current = merged;
      if (data.timestamp != null) latestTimestampRef.current = data.timestamp as string;
      setSensorData(merged);

      if (data.valve_status != null) {
        setValveStatus(data.valve_status as 'OPEN' | 'CLOSED');
      }

      // Rebuild connection map from per-sensor timestamps, not message presence.
      // This means a sensor stays "connected" across partial messages from other
      // ESP32 clients — it only goes offline after SENSOR_TIMEOUT_MS of silence.
      setSensorConnected(buildConnectionMap());

      if (data.flow_rate != null) {
        setFlowHistory(prev => {
          const t = flowTimeRef.current++;
          return [...prev.slice(-59), { time: t, flow: data.flow_rate as number }];
        });
      }

      // Debounce: wait 500 ms after the last ESP32 message so all devices in one
      // publish cycle contribute to a single merged entry rather than N partial ones.
      if (histDebounceRef.current) clearTimeout(histDebounceRef.current);
      histDebounceRef.current = setTimeout(() => {
        const rawTs = latestTimestampRef.current;
        const ts    = rawTs ? new Date(rawTs) : new Date();
        const snap  = latestSensorRef.current;
        const entry: HistoricalData = {
          timestamp:    rawTs || new Date().toISOString(),
          time:         ts.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          ph:           snap.ph,
          flowRate:     snap.flowRate,
          tds:          snap.tds,
          salinity:     snap.salinity,
          conductivity: snap.conductivity,
          temperature:  snap.temperature,
          voltage:      snap.voltage,
          current:      snap.current,
        };
        setHistoricalData(prev => [...prev.slice(-99), entry]);
      }, 500);
    };

    // Sync pump mode when another client sends a command
    const onPumpCommand  = ({ command }: { command: PumpCommand  }) => setPumpMode(command);
    const onPump2Command = ({ command }: { command: Pump2Command }) => setPump2Mode(command);
    const onPump3Command = ({ command }: { command: Pump3Command }) => setPump3Mode(command);

    // Sent by the server immediately on connect so every new tab/client sees
    // the current pump state without waiting for the next MQTT message.
    const onPumpStateSync = (state: { pump1: PumpCommand; pump2: Pump2Command; pump3: Pump3Command }) => {
      setPumpMode(state.pump1);
      setPump2Mode(state.pump2);
      setPump3Mode(state.pump3);
    };

    socket.on('connect',         onConnect);
    socket.on('disconnect',      onDisconnect);
    socket.on('live_telemetry',  onTelemetry);
    socket.on('pump_command',    onPumpCommand);
    socket.on('pump2_command',   onPump2Command);
    socket.on('pump3_command',   onPump3Command);
    socket.on('pump_state_sync', onPumpStateSync);

    // Every 3 s: mark fully offline if no data arrived in SENSOR_TIMEOUT_MS,
    // OR refresh the connection map so individually-silent sensors time out
    // even while other sensors continue publishing.
    const offlineTimer = setInterval(() => {
      if (lastDataRef.current > 0 && Date.now() - lastDataRef.current > SENSOR_TIMEOUT_MS) {
        setIsLive(false);
        resetLastSeen();
        setSensorConnected(ALL_OFFLINE);
      } else {
        setSensorConnected(buildConnectionMap());
      }
    }, 3000);

    return () => {
      socket.off('connect',         onConnect);
      socket.off('disconnect',      onDisconnect);
      socket.off('live_telemetry',  onTelemetry);
      socket.off('pump_command',    onPumpCommand);
      socket.off('pump2_command',   onPump2Command);
      socket.off('pump3_command',   onPump3Command);
      socket.off('pump_state_sync', onPumpStateSync);
      clearInterval(offlineTimer);
      if (histDebounceRef.current) clearTimeout(histDebounceRef.current);
    };
  }, []);

  return {
    socketConnected, isLive,
    sensorData, sensorConnected, valveStatus,
    flowHistory, historicalData,
    pumpMode, setPumpMode,
    pump2Mode, setPump2Mode,
    pump3Mode, setPump3Mode,
  };
}
