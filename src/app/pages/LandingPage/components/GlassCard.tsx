import { ReactNode, CSSProperties } from 'react';
import { motion }                   from 'motion/react';
import { S }                        from '../constants';

interface Props {
  children:   ReactNode;
  style?:     CSSProperties;
  hoverLift?: boolean;
  className?: string;
}

export function GlassCard({ children, style = {}, hoverLift = true, className = '' }: Props) {
  return (
    <motion.div
      className={className}
      style={{ ...S.glass, ...style }}
      whileHover={hoverLift ? {
        y:           -5,
        borderColor: 'rgba(221,228,195,0.30)',
        background:  'rgba(221,228,195,0.09)',
        transition:  { duration: 0.2 },
      } : {}}
    >
      {children}
    </motion.div>
  );
}
