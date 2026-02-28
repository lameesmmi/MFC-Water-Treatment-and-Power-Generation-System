import { CheckCircle2 }  from 'lucide-react';
import { format }         from 'date-fns';
import type { SystemSettings } from '@/app/services/api';
import { SENSOR_META }    from '../constants';

interface Props {
  settings: SystemSettings;
}

export function SystemInfo({ settings }: Props) {
  const rows = [
    { label: 'System Name',          value: 'MFC Water Treatment System'                                                    },
    { label: 'Device ID',            value: 'MFC_01'                                                                        },
    { label: 'Location',             value: 'Dammam Lab'                                                                    },
    { label: 'Backend URL',          value: import.meta.env.VITE_BACKEND_URL                                                },
    { label: 'Sensors Monitored',    value: `${Object.keys(SENSOR_META).length}`                                            },
    { label: 'Alert Notifications',  value: settings.alertsEnabled ? 'Enabled' : 'Disabled'                                 },
    { label: 'Last Settings Update', value: settings.updatedAt ? format(new Date(settings.updatedAt), 'PPp') : '—'          },
  ];

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">System Information</h2>
      </div>

      <div className="bg-card rounded-lg border border-border divide-y divide-border">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between px-4 py-2.5">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-xs font-medium">{value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
