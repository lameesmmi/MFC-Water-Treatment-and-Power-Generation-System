import { useEffect } from 'react';
import { getSocket } from '@/app/services/socket';
import { useAlertSound } from '@/app/hooks/useAlertSound';
import type { Alert } from '@/app/services/api';

/**
 * Mounts invisibly in AppLayout and plays an audio cue whenever a critical
 * system_alert arrives — only if the user has opted in via the sound toggle.
 */
export function AlertSoundListener() {
  const { playAlertSound } = useAlertSound();

  useEffect(() => {
    const socket = getSocket();
    const onAlert = (alert: Alert) => {
      if (alert.severity === 'critical' || alert.severity === 'warning') {
        playAlertSound();
      }
    };
    socket.on('system_alert', onAlert);
    return () => { socket.off('system_alert', onAlert); };
  }, [playAlertSound]);

  return null;
}
