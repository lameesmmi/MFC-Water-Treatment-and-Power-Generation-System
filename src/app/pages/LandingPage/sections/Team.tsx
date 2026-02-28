import { motion }       from 'motion/react';
import { GM }           from '../constants';
import { fadeUp, fadeIn } from '../constants';
import { MEMBERS }      from '../data';
import { SectionBadge } from '../components/SectionBadge';
import { MemberCard }   from '../components/MemberCard';

export function Team() {
  return (
    <section
      id="team"
      style={{
        padding:    '120px 32px',
        background: `linear-gradient(180deg, transparent 0%, ${GM.yellowDim} 50%, transparent 100%)`,
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <SectionHeader />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {MEMBERS.map((member, i) => (
            <MemberCard key={member.name} member={member} delay={i * 0.07} />
          ))}
        </div>

        <ProjectCoach />
      </div>
    </section>
  );
}

function SectionHeader() {
  return (
    <motion.div style={{ maxWidth: '560px', margin: '0 auto 64px', textAlign: 'center' }} {...fadeUp()}>
      <SectionBadge>The People</SectionBadge>
      <h2 style={{
        fontFamily:    GM.font,
        fontSize:      'clamp(30px, 3.5vw, 48px)',
        fontWeight:    700,
        letterSpacing: '-0.03em',
        color:         GM.text,
        margin:        '18px 0 16px',
        lineHeight:    1.1,
      }}>
        Meet the Team
      </h2>
      <p style={{ fontFamily: GM.font, fontSize: '16px', color: GM.textMuted, lineHeight: 1.7, margin: 0 }}>
        Six engineers across Chemical, Petroleum, Electrical, and Software Engineering
        disciplines — united to build a smarter, greener future for water treatment.
      </p>
    </motion.div>
  );
}

function ProjectCoach() {
  return (
    <motion.div style={{ marginTop: '52px', textAlign: 'center' }} {...fadeIn(0.2)}>
      <p style={{ fontFamily: GM.font, fontSize: '12px', color: GM.textMuted, margin: '0 0 4px', letterSpacing: '0.04em' }}>
        Project Coach
      </p>
      <p style={{ fontFamily: GM.font, fontSize: '15px', fontWeight: 600, color: GM.text, margin: '0 0 4px' }}>
        Dr. Khadijah AlSafwan
      </p>
      <p style={{ fontFamily: GM.font, fontSize: '12px', color: GM.textMuted, margin: 0 }}>
        King Fahd University of Petroleum &amp; Minerals
      </p>
    </motion.div>
  );
}
