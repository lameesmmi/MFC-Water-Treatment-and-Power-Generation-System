import { motion }       from 'motion/react';
import { Droplets, Zap, Activity } from 'lucide-react';
import { GM }           from '../constants';
import { fadeUp }       from '../constants';
import { SectionBadge } from '../components/SectionBadge';
import { GlassCard }    from '../components/GlassCard';

const PROBLEMS = [
  {
    icon:      <Droplets style={{ width: 20, height: 20 }} />,
    iconColor: GM.greenText,
    iconBg:    GM.greenIconBg,
    offset:    0,
    delay:     0.1,
    title:     'Energy Discarded',
    body:      'Wastewater is treated as a pure liability — discarding immense latent chemical energy in every treatment cycle rather than capturing and reusing it.',
  },
  {
    icon:      <Zap style={{ width: 20, height: 20 }} />,
    iconColor: GM.yellowText,
    iconBg:    GM.yellowIconBg,
    offset:    -20,
    delay:     0.2,
    title:     'High Operational Cost',
    body:      'Treatment plants consume massive amounts of grid electricity to run filtration and pumping systems, with zero energy recapture in the process.',
  },
  {
    icon:      <Activity style={{ width: 20, height: 20 }} />,
    iconColor: GM.greenDeep,
    iconBg:    GM.greenDeepIconBg,
    offset:    0,
    delay:     0.3,
    title:     'No Real-Time Visibility',
    body:      'Without live monitoring, operators cannot respond quickly to critical threshold violations, risking system failures and compliance breaches.',
  },
] as const;

export function Problem() {
  return (
    <section id="problem" style={{ padding: '120px 32px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <SectionHeader />

        <div className="grid md:grid-cols-3 gap-5">
          {PROBLEMS.map(({ offset, delay, ...card }) => (
            <motion.div key={card.title} {...fadeUp(delay)} style={{ transform: `translateY(${offset}px)` }}>
              <ProblemCard {...card} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionHeader() {
  return (
    <motion.div style={{ maxWidth: '560px', margin: '0 auto 64px', textAlign: 'center' }} {...fadeUp()}>
      <SectionBadge>The Challenge</SectionBadge>
      <h2 style={{
        fontFamily:    GM.font,
        fontSize:      'clamp(30px, 3.5vw, 48px)',
        fontWeight:    700,
        letterSpacing: '-0.03em',
        color:         GM.text,
        margin:        '18px 0 16px',
        lineHeight:    1.1,
      }}>
        The Wasted Potential<br />of Wastewater
      </h2>
      <p style={{ fontFamily: GM.font, fontSize: '16px', color: GM.textMuted, lineHeight: 1.7, margin: 0 }}>
        Industrial wastewater is packed with latent energy, yet current treatment
        technologies treat it purely as a liability to be discarded.
      </p>
    </motion.div>
  );
}

interface ProblemCardProps {
  icon:      React.ReactNode;
  iconColor: string;
  iconBg:    string;
  title:     string;
  body:      string;
}

function ProblemCard({ icon, iconColor, iconBg, title, body }: ProblemCardProps) {
  return (
    <GlassCard style={{ padding: '32px', height: '100%', display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div style={{
        width:          40,
        height:         40,
        borderRadius:   '10px',
        background:     iconBg,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        color:          iconColor,
      }}>
        {icon}
      </div>

      <div>
        <h3 style={{
          fontFamily:    GM.font,
          fontSize:      '17px',
          fontWeight:    700,
          letterSpacing: '-0.02em',
          color:         GM.text,
          margin:        '0 0 10px',
        }}>
          {title}
        </h3>
        <p style={{ fontFamily: GM.font, fontSize: '14px', color: GM.textMuted, lineHeight: 1.7, margin: 0 }}>
          {body}
        </p>
      </div>
    </GlassCard>
  );
}
