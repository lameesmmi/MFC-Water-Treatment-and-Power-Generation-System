import { Power, TrendingUp, Cpu, Hand, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { PumpCommand } from '@/app/services/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PumpControlPanelProps {
  /** Current pump operating mode, reflects what was last commanded. */
  pumpMode:   'AUTO' | 'MANUAL_ON' | 'MANUAL_OFF';
  flowRate:   number;
  flowHistory: Array<{ time: number; flow: number }>;
  /** Whether all water-quality sensors are within safe thresholds. */
  systemSafe: boolean;
  /** True while a command HTTP request is in flight — disables buttons. */
  isSending:  boolean;
  /** False for viewer-role users who may not send commands. */
  canControl: boolean;
  onCommand:  (command: PumpCommand) => void;
}

// ─── Sub-component: Mode Button ───────────────────────────────────────────────

interface ModeButtonProps {
  label:     string;
  active:    boolean;
  disabled:  boolean;
  onClick:   () => void;
  activeClassName: string;
}

function ModeButton({ label, active, disabled, onClick, activeClassName }: ModeButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || active}
      className={`flex-1 py-1 rounded text-[10px] font-semibold transition-all ${
        active
          ? `${activeClassName} text-white cursor-default`
          : 'bg-muted text-muted-foreground hover:bg-muted/70 disabled:opacity-40 disabled:cursor-not-allowed'
      }`}
    >
      {label}
    </button>
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
}: PumpControlPanelProps) {
  // Derive whether the pump is physically running from the current mode.
  // In AUTO mode the ESP32 decides based on sensor logic; we mirror that
  // via systemSafe. In manual modes the operator's intent is authoritative.
  const pumpOn =
    pumpMode === 'MANUAL_ON' ||
    (pumpMode === 'AUTO' && systemSafe);

  const isManual = pumpMode !== 'AUTO';

  return (
    <div className="bg-card rounded-lg p-2 border border-border h-full flex flex-col">
      <div className="mb-1">
        <h2 className="text-sm font-semibold text-card-foreground">Flow Pump Control Hub</h2>
      </div>

      <div className="flex-1 flex flex-col gap-2 min-h-0 overflow-hidden">

        {/* ── Pump Status ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
            pumpOn
              ? 'bg-green-500/10 border-2 border-green-500'
              : 'bg-red-500/10 border-2 border-red-500'
          }`}>
            <Power className={`w-5 h-5 ${
              pumpOn
                ? 'text-green-500 dark:text-green-400 animate-pulse'
                : 'text-red-500 dark:text-red-400'
            }`} />
          </div>

          <div className="min-w-0 flex-1">
            <div className={`text-sm font-bold ${
              pumpOn ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'
            }`}>
              {pumpOn ? 'PUMP ON' : 'PUMP OFF'}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 flex-shrink-0" />
              <span>
                <span className="text-foreground font-semibold">{flowRate.toFixed(1)}</span> L/min
              </span>
            </div>
          </div>

          {/* Spinner shown while a command is in-flight */}
          {isSending && (
            <Loader2 className="w-4 h-4 text-muted-foreground animate-spin flex-shrink-0" />
          )}
        </div>

        {/* ── Mode Selector ───────────────────────────────────────────── */}
        <div className="flex-shrink-0">
          <div className="flex items-center gap-1 mb-1">
            {isManual
              ? <Hand className="w-3 h-3 text-orange-500" />
              : <Cpu  className="w-3 h-3 text-green-500"  />
            }
            <span className={`text-[10px] font-medium ${
              isManual ? 'text-orange-500' : 'text-green-500 dark:text-green-400'
            }`}>
              {isManual ? 'Manual Override Active' : 'Automatic Control'}
            </span>
          </div>

          <div className="flex gap-1">
            <ModeButton
              label="AUTO"
              active={pumpMode === 'AUTO'}
              disabled={!canControl || isSending}
              onClick={() => onCommand('AUTO')}
              activeClassName="bg-green-600"
            />
            <ModeButton
              label="MAN ON"
              active={pumpMode === 'MANUAL_ON'}
              disabled={!canControl || isSending}
              onClick={() => onCommand('MANUAL_ON')}
              activeClassName="bg-blue-600"
            />
            <ModeButton
              label="MAN OFF"
              active={pumpMode === 'MANUAL_OFF'}
              disabled={!canControl || isSending}
              onClick={() => onCommand('MANUAL_OFF')}
              activeClassName="bg-orange-600"
            />
          </div>

          {!canControl && (
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Viewer role — read only
            </p>
          )}
        </div>

        {/* ── System Status Badge ──────────────────────────────────────── */}
        <div className={`px-2 py-1 rounded text-center flex-shrink-0 ${
          systemSafe
            ? 'bg-green-500/10 border border-green-600 dark:border-green-700'
            : 'bg-red-500/10 border border-red-600 dark:border-red-700'
        }`}>
          <div className={`text-xs font-semibold ${
            systemSafe
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}>
            {systemSafe ? '✓ System Safe' : '⚠ System Unsafe'}
          </div>
          {!systemSafe && pumpMode === 'AUTO' && (
            <div className="text-xs text-red-500 dark:text-red-300 mt-0.5">
              Auto shutdown active
            </div>
          )}
        </div>

        {/* ── Mini Flow Chart ──────────────────────────────────────────── */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="text-xs text-muted-foreground mb-0.5">Flow Rate History</div>
          <div className="h-[calc(100%-1rem)]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={flowHistory.slice(-30)}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="time" hide />
                <YAxis
                  className="stroke-muted-foreground"
                  tick={{ fontSize: 8 }}
                  width={25}
                  domain={[0, 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    fontSize: '9px',
                    color: 'var(--foreground)',
                  }}
                  labelStyle={{ color: 'var(--muted-foreground)' }}
                />
                <Line
                  type="monotone"
                  dataKey="flow"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
