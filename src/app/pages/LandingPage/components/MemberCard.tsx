import { motion }    from 'motion/react';
import { Linkedin }  from 'lucide-react';
import { GM, S }     from '../constants';
import { Member }    from '../types';
import { initials }  from '../data';
import { DeptBadge } from './DeptBadge';

interface Props {
  member: Member;
  delay:  number;
}

export function MemberCard({ member, delay }: Props) {
  return (
    <motion.div
      style={{
        ...S.glass,
        position:       'relative',
        padding:        '28px 24px',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        textAlign:      'center',
        gap:            '16px',
      }}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay, ease: [0.22, 0.61, 0.36, 1] }}
      whileHover={{ y: -5, borderColor: 'rgba(221,228,195,0.30)', transition: { duration: 0.2 } }}
    >
      {member.leader && (
        <span style={{
          position:      'absolute',
          top:           14,
          right:         14,
          borderRadius:  GM.radiusPill,
          background:    GM.greenDim,
          border:        `1px solid ${GM.greenBorder}`,
          padding:       '3px 11px',
          fontSize:      '10px',
          fontWeight:    600,
          color:         GM.greenText,
          letterSpacing: '0.06em',
          fontFamily:    GM.font,
        }}>
          Leader
        </span>
      )}

      <div style={{
        width:          64,
        height:         64,
        borderRadius:   '50%',
        background:     member.color,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        color:          '#fff',
        fontWeight:     700,
        fontSize:       '19px',
        flexShrink:     0,
        fontFamily:     GM.font,
        outline:        `2px solid ${GM.glassBorder}`,
        outlineOffset:  '3px',
      }}>
        {initials(member.name)}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
        <div style={{ fontFamily: GM.font, fontSize: '14px', fontWeight: 600, color: GM.text, letterSpacing: '-0.01em' }}>
          {member.name}
        </div>
        <DeptBadge dept={member.dept} />
      </div>

      <a
        href={member.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        style={{ ...S.btnOutline, padding: '8px 18px', fontSize: '12px', marginTop: 'auto' }}
      >
        <Linkedin style={{ width: 13, height: 13 }} />
        LinkedIn
      </a>
    </motion.div>
  );
}
