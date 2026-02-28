import { GM } from '../constants';

interface Props {
  color?: string;
}

export function Dot({ color = GM.greenDeep }: Props) {
  return (
    <span style={{
      width:           17,
      height:          17,
      borderRadius:    '50%',
      border:          `1.5px solid ${color}`,
      display:         'inline-flex',
      alignItems:      'center',
      justifyContent:  'center',
      flexShrink:      0,
      marginTop:       '2px',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: color }} />
    </span>
  );
}
