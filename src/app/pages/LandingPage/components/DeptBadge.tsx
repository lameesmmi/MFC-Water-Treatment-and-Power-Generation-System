import { GM }       from '../constants';
import { DEPT_META } from '../data';
import { Dept }      from '../types';

interface Props {
  dept: Dept;
}

export function DeptBadge({ dept }: Props) {
  const d = DEPT_META[dept];
  return (
    <span style={{
      display:       'inline-block',
      borderRadius:  GM.radiusPill,
      border:        `1px solid ${d.border}`,
      background:    d.bg,
      padding:       '3px 12px',
      fontSize:      '11px',
      fontWeight:    500,
      color:         d.text,
      fontFamily:    GM.font,
      letterSpacing: '0.01em',
    }}>
      {dept} — {d.label}
    </span>
  );
}
