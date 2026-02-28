import { ReactNode } from 'react';
import { GM } from '../constants';

interface Props {
  children: ReactNode;
}

export function SectionBadge({ children }: Props) {
  return (
    <span style={{
      display:       'inline-flex',
      alignItems:    'center',
      gap:           '7px',
      borderRadius:  GM.radiusPill,
      border:        `1px solid ${GM.greenBorder}`,
      background:    GM.greenDim,
      padding:       '5px 16px',
      fontSize:      '11px',
      fontWeight:    600,
      letterSpacing: '0.09em',
      textTransform: 'uppercase',
      color:         GM.greenText,
      fontFamily:    GM.font,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: GM.greenText, flexShrink: 0 }} />
      {children}
    </span>
  );
}
