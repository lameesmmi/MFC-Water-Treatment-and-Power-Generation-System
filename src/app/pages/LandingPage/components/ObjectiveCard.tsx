import { ReactNode } from 'react';
import { GM }        from '../constants';
import { GlassCard } from './GlassCard';

interface Props {
  icon:        ReactNode;
  accentColor: string;
  iconBg:      string;
  title:       string;
  description: string;
}

export function ObjectiveCard({ icon, accentColor, iconBg, title, description }: Props) {
  return (
    <GlassCard style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{
        width:          36,
        height:         36,
        borderRadius:   '10px',
        background:     iconBg,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        color:          accentColor,
      }}>
        {icon}
      </div>

      <div>
        <h4 style={{
          fontFamily:    GM.font,
          fontSize:      '15px',
          fontWeight:    600,
          letterSpacing: '-0.01em',
          color:         GM.text,
          margin:        '0 0 7px',
        }}>
          {title}
        </h4>

        <p style={{
          fontFamily: GM.font,
          fontSize:   '13px',
          color:      GM.textMuted,
          lineHeight: 1.65,
          margin:     0,
        }}>
          {description}
        </p>
      </div>
    </GlassCard>
  );
}
