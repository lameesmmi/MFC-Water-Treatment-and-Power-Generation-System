import { GM } from '../constants';

export function Divider() {
  return (
    <div style={{
      width:      '100%',
      height:     '1px',
      background: `linear-gradient(to right, transparent, ${GM.glassBorder}, transparent)`,
    }} />
  );
}
