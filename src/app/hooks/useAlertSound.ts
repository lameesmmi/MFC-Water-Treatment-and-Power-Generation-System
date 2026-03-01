import { useState, useCallback } from 'react';

const STORAGE_KEY = 'mfc_alert_sound';

// Module-level singleton so every hook instance shares the same AudioContext.
// The toggle click (user gesture) unlocks it once for all callers.
let sharedCtx: AudioContext | null = null;
function getCtx(): AudioContext {
  sharedCtx ??= new AudioContext();
  return sharedCtx;
}

export function useAlertSound() {
  const [soundEnabled, setSoundEnabled] = useState(
    () => localStorage.getItem(STORAGE_KEY) === 'true'
  );

  /** Schedule two beeps once the AudioContext is running. */
  const scheduleBeeps = useCallback((ctx: AudioContext) => {
    const now = ctx.currentTime;
    const beep = (freq: number, start: number, dur: number) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.25, now + start);
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
      osc.start(now + start);
      osc.stop(now + start + dur + 0.01);
    };
    beep(880, 0,    0.12);
    beep(660, 0.18, 0.15);
  }, []);

  const playAlertSound = useCallback(() => {
    if (localStorage.getItem(STORAGE_KEY) !== 'true') return;
    try {
      const ctx = getCtx();
      if (ctx.state === 'suspended') {
        ctx.resume().then(() => scheduleBeeps(ctx)).catch(() => {});
      } else {
        scheduleBeeps(ctx);
      }
    } catch {
      // Silently ignore if AudioContext is unavailable
    }
  }, [scheduleBeeps]);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));

      if (next) {
        // Create/resume the shared AudioContext during this user gesture —
        // this permanently unlocks it for future socket-triggered calls.
        try {
          const ctx = getCtx();
          ctx.resume().then(() => scheduleBeeps(ctx)).catch(() => {});
        } catch {
          // ignore
        }
      }

      return next;
    });
  }, [scheduleBeeps]);

  return { soundEnabled, playAlertSound, toggleSound };
}
