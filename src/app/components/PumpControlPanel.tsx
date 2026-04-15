import { Power, TrendingUp, Cpu, Hand, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { PumpCommand, Pump2Command, Pump3Command } from '@/app/services/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PumpControlPanelProps {
  pumpMode:       'AUTO' | 'MANUAL_ON' | 'MANUAL_OFF';
  flowRate:       number;
  flowHistory:    Array<{ time: number; flow: number }>;
  systemSafe:     boolean;
  isSending:      boolean;
  canControl:     boolean;
  onCommand:      (command: PumpCommand) => void;
  pump2Mode:      Pump2Command;
  isPump2Sending: boolean;
  onPump2Command: (command: Pump2Command) => void;
  pump3Mode:      Pump3Command;
  isPump3Sending: boolean;
  onPump3Command: (command: Pump3Command) => void;
}

// ─── Sub-component: Segmented Toggle ─────────────────────────────────────────

interface SegmentedToggleProps {
  leftLabel:        string;
  rightLabel:       string;
  leftActive:       boolean;
  disabled:         boolean;
  dimmed?:          boolean;
  onLeft:           () => void;
  onRight:          () => void;
  leftActiveClass:  string;
  rightActiveClass: string;
}

function SegmentedToggle({
  leftLabel, rightLabel, leftActive,
  disabled, dimmed,
  onLeft, onRight,
  leftActiveClass, rightActiveClass,
}: SegmentedToggleProps) {
  return (
    <div className={`flex rounded-lg overflow-hidden border border-border transition-opacity ${dimmed ? 'opacity-40' : ''}`}>
      <button
        onClick={onLeft}
        disabled={disabled || leftActive}
        className={`flex-1 py-1.5 text-[10px] font-semibold transition-colors ${
          leftActive
            ? `${leftActiveClass} text-white cursor-default`
            : 'bg-muted text-muted-foreground hover:bg-muted/70 disabled:opacity-50 disabled:cursor-not-allowed'
        }`}
      >
        {leftLabel}
      </button>
      <div className="w-px bg-border flex-shrink-0" />
      <button
        onClick={onRight}
        disabled={disabled || !leftActive}
        className={`flex-1 py-1.5 text-[10px] font-semibold transition-colors ${
          !leftActive
            ? `${rightActiveClass} text-white cursor-default`
            : 'bg-muted text-muted-foreground hover:bg-muted/70 disabled:opacity-50 disabled:cursor-not-allowed'
        }`}
      >
        {rightLabel}
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PumpControlPanel({
  pumpMode,
  flowRate,
  flowHistory,
  systemSafe,
  isSending,
  canControl,
  onCommand,
  pump2Mode,
  isPump2Sending,
  onPump2Command,
  pump3Mode,
  isPump3Sending,
  onPump3Command,
}: PumpControlPanelProps) {
  const isAuto   = pumpMode === 'AUTO';
  const isManual = !isAuto;

  const pump1On =
    pumpMode === 'MANUAL_ON' ||
    (pumpMode === 'AUTO' && systemSafe);

  const pump2On = pump2Mode === 'MANUAL_ON';
  const pump3On = pump3Mode === 'MANUAL_ON';

  const ctrl1Disabled = !canControl || isSending;
  const ctrl2Disabled = !canControl || isPump2Sending;
  const ctrl3Disabled = !canControl || isPump3Sending;

  return (
    <div className="bg-card rounded-lg p-2 border border-border h-full flex flex-col">

      <div className="mb-2 flex-shrink-0">
        <h2 className="text-sm font-semibold text-card-foreground">Pump Control</h2>
      </div>

      {/* ── Three equal pump cards ───────────────────────────────────────── */}
      <div className="flex gap-2 flex-shrink-0">

        {/* ── Water-in (Pump 1) ─────────────────────────────────────────── */}
        <div className="flex-1 rounded-lg border border-border bg-muted/30 p-2 flex flex-col gap-2">

          {/* Status row */}
          <div className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
              pump1On
                ? 'bg-green-500/10 border-2 border-green-500'
                : 'bg-red-500/10 border-2 border-red-500'
            }`}>
              <Power className={`w-4 h-4 ${
                pump1On
                  ? 'text-green-500 dark:text-green-400 animate-pulse'
                  : 'text-red-500 dark:text-red-400'
              }`} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] text-muted-foreground font-medium">Water-in</div>
              <div className={`text-xs font-bold ${pump1On ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                {pump1On ? 'ON' : 'OFF'}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <TrendingUp className="w-2.5 h-2.5 flex-shrink-0" />
                <span><span className="text-foreground font-semibold">{flowRate.toFixed(1)}</span> L/min</span>
              </div>
            </div>
            {isSending && <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin flex-shrink-0" />}
          </div>

          {/* Mode toggle */}
          <div>
            <div className="flex items-center gap-1 mb-1">
              {isManual
                ? <Hand className="w-3 h-3 text-orange-500" />
                : <Cpu  className="w-3 h-3 text-green-500"  />
              }
              <span className={`text-[10px] font-medium ${isManual ? 'text-orange-500' : 'text-green-500 dark:text-green-400'}`}>
                {isManual ? 'Manual' : 'Automatic'}
              </span>
            </div>
            <SegmentedToggle
              leftLabel="AUTO"
              rightLabel="MANUAL"
              leftActive={isAuto}
              disabled={ctrl1Disabled}
              onLeft={() => onCommand('AUTO')}
              onRight={() => onCommand('MANUAL_OFF')}
              leftActiveClass="bg-green-600"
              rightActiveClass="bg-orange-500"
            />
          </div>

          {/* Power toggle */}
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Power className={`w-3 h-3 ${isAuto ? 'text-muted-foreground' : pump1On ? 'text-green-500' : 'text-red-500'}`} />
              <span className={`text-[10px] font-medium ${isAuto ? 'text-muted-foreground' : 'text-foreground'}`}>Power</span>
            </div>
            <SegmentedToggle
              leftLabel="OFF"
              rightLabel="ON"
              leftActive={!pump1On}
              disabled={ctrl1Disabled || isAuto}
              dimmed={isAuto}
              onLeft={() => onCommand('MANUAL_OFF')}
              onRight={() => onCommand('MANUAL_ON')}
              leftActiveClass="bg-red-500"
              rightActiveClass="bg-blue-600"
            />
          </div>
        </div>

        {/* ── Water-out (Pump 2) ────────────────────────────────────────── */}
        <div className="flex-1 rounded-lg border border-border bg-muted/30 p-2 flex flex-col gap-2">

          {/* Status row */}
          <div className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
              pump2On
                ? 'bg-green-500/10 border-2 border-green-500'
                : 'bg-red-500/10 border-2 border-red-500'
            }`}>
              <Power className={`w-4 h-4 ${
                pump2On
                  ? 'text-green-500 dark:text-green-400 animate-pulse'
                  : 'text-red-500 dark:text-red-400'
              }`} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] text-muted-foreground font-medium">Water-out</div>
              <div className={`text-xs font-bold ${pump2On ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                {pump2On ? 'ON' : 'OFF'}
              </div>
            </div>
            {isPump2Sending && <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin flex-shrink-0" />}
          </div>

          {/* Mode label — manual only, no toggle (spacer matches pump 1 mode toggle height) */}
          <div>
            <div className="flex items-center gap-1 mb-1">
              <span className="text-[10px] font-medium text-orange-500">Manual Control Only</span>
            </div>
            {/* Spacer matching the SegmentedToggle height so power toggles align */}
            <div className="h-[26px]" />
          </div>

          {/* Power toggle */}
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Power className={`w-3 h-3 ${pump2On ? 'text-green-500' : 'text-red-500'}`} />
              <span className="text-[10px] font-medium text-foreground">Power</span>
            </div>
            <SegmentedToggle
              leftLabel="OFF"
              rightLabel="ON"
              leftActive={!pump2On}
              disabled={ctrl2Disabled}
              onLeft={() => onPump2Command('MANUAL_OFF')}
              onRight={() => onPump2Command('MANUAL_ON')}
              leftActiveClass="bg-red-500"
              rightActiveClass="bg-blue-600"
            />
          </div>
        </div>

        {/* ── Pump 3 ───────────────────────────────────────────────────── */}
        <div className="flex-1 rounded-lg border border-border bg-muted/30 p-2 flex flex-col gap-2">

          {/* Status row */}
          <div className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
              pump3On
                ? 'bg-green-500/10 border-2 border-green-500'
                : 'bg-red-500/10 border-2 border-red-500'
            }`}>
              <Power className={`w-4 h-4 ${
                pump3On
                  ? 'text-green-500 dark:text-green-400 animate-pulse'
                  : 'text-red-500 dark:text-red-400'
              }`} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] text-muted-foreground font-medium">Pump 3</div>
              <div className={`text-xs font-bold ${pump3On ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                {pump3On ? 'ON' : 'OFF'}
              </div>
            </div>
            {isPump3Sending && <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin flex-shrink-0" />}
          </div>

          {/* Mode label — manual only */}
          <div>
            <div className="flex items-center gap-1 mb-1">
              <span className="text-[10px] font-medium text-orange-500">Manual Control Only</span>
            </div>
            {/* Spacer matching the SegmentedToggle height so power toggles align */}
            <div className="h-[26px]" />
          </div>

          {/* Power toggle */}
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Power className={`w-3 h-3 ${pump3On ? 'text-green-500' : 'text-red-500'}`} />
              <span className="text-[10px] font-medium text-foreground">Power</span>
            </div>
            <SegmentedToggle
              leftLabel="OFF"
              rightLabel="ON"
              leftActive={!pump3On}
              disabled={ctrl3Disabled}
              onLeft={() => onPump3Command('MANUAL_OFF')}
              onRight={() => onPump3Command('MANUAL_ON')}
              leftActiveClass="bg-red-500"
              rightActiveClass="bg-blue-600"
            />
          </div>
        </div>
      </div>

      {!canControl && (
        <p className="text-[10px] text-muted-foreground mt-1 flex-shrink-0">Viewer role — read only</p>
      )}

      {/* ── Water-in System Status Badge ─────────────────────────────────── */}
      <div className={`mt-2 px-2 py-1 rounded flex-shrink-0 ${
        systemSafe
          ? 'bg-green-500/10 border border-green-600 dark:border-green-700'
          : 'bg-red-500/10 border border-red-600 dark:border-red-700'
      }`}>
        <div className="text-[10px] text-muted-foreground mb-0.5">Water-in status</div>
        <div className={`text-xs font-semibold ${
          systemSafe
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400'
        }`}>
          {systemSafe ? '✓ Water safe for MFC' : '⚠ Water is unsafe to enter MFC'}
        </div>
        {!systemSafe && pumpMode === 'AUTO' && (
          <div className="text-xs text-red-500 dark:text-red-300 mt-0.5">
            Autoshutdown active
          </div>
        )}
      </div>
    </div>
  );
}
