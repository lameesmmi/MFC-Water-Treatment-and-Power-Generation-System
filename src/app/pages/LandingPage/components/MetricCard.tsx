import { GM }        from '../constants';
import { GlassCard } from './GlassCard';

interface Props {
  value:       string;
  prefix?:     string;
  label:       string;
  description: string;
  accent:      string;
}

export function MetricCard({ value, prefix = '', label, description, accent }: Props) {
  return (
    <GlassCard style={{ padding: '36px 32px', textAlign: 'center' }}>
      <div style={{
        fontFamily:    GM.font,
        fontSize:      'clamp(42px, 4.5vw, 62px)',
        fontWeight:    800,
        letterSpacing: '-0.05em',
        lineHeight:    1,
        color:         accent,
      }}>
        {prefix}{value}
      </div>

      <div style={{
        fontFamily:    GM.font,
        fontSize:      '14px',
        fontWeight:    600,
        color:         GM.text,
        marginTop:     '12px',
        letterSpacing: '-0.01em',
      }}>
        {label}
      </div>

      <div style={{
        fontFamily: GM.font,
        fontSize:   '13px',
        color:      GM.textMuted,
        marginTop:  '7px',
        lineHeight: 1.65,
      }}>
        {description}
      </div>
    </GlassCard>
  );
}
