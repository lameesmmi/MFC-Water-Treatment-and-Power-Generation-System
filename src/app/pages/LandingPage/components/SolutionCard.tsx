import { ReactNode } from 'react';
import { GM }        from '../constants';
import { GlassCard } from './GlassCard';
import { Dot }       from './Dot';

interface Props {
  icon:        ReactNode;
  title:       string;
  subtitle:    string;
  description: string;
  features:    string[];
  accentColor: string;
  iconBg:      string;
}

export function SolutionCard({ icon, title, subtitle, description, features, accentColor, iconBg }: Props) {
  return (
    <GlassCard style={{ padding: '36px', display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
      <div style={{
        width:           44,
        height:          44,
        borderRadius:    '12px',
        background:      iconBg,
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        color:           accentColor,
      }}>
        {icon}
      </div>

      <div>
        <div style={{
          fontFamily:    GM.font,
          fontSize:      '11px',
          fontWeight:    600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color:         GM.textMuted,
          marginBottom:  '6px',
        }}>
          {subtitle}
        </div>

        <h3 style={{
          fontFamily:    GM.font,
          fontSize:      '22px',
          fontWeight:    700,
          letterSpacing: '-0.02em',
          color:         GM.text,
          margin:        0,
        }}>
          {title}
        </h3>

        <p style={{
          fontFamily: GM.font,
          fontSize:   '15px',
          color:      GM.textMuted,
          lineHeight: 1.65,
          margin:     '10px 0 0',
        }}>
          {description}
        </p>
      </div>

      <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', listStyle: 'none', padding: 0, margin: 'auto 0 0' }}>
        {features.map(f => (
          <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontFamily: GM.font, fontSize: '14px', color: GM.textMuted }}>
            <Dot color={accentColor} />
            {f}
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
