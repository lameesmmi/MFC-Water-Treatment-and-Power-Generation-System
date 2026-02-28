import { motion }          from 'motion/react';
import { FlaskConical, Cpu } from 'lucide-react';
import { GM }              from '../constants';
import { fadeUp }          from '../constants';
import { SectionBadge }    from '../components/SectionBadge';
import { SolutionCard }    from '../components/SolutionCard';

const SOLUTIONS = [
  {
    icon:        <FlaskConical style={{ width: 22, height: 22 }} />,
    title:       'The Hardware',
    subtitle:    'Bioreactor',
    accentColor: GM.greenText,
    iconBg:      GM.greenIconBg,
    description: 'The physical MFC unit actively filters wastewater, utilizing bacterial colonies to break down organic compounds and generate a baseline electrical current — transforming waste into a power source.',
    features:    ['Bacterial colony cultivation', 'Organic compound breakdown', 'Baseline electricity generation', 'Continuous water filtration'],
    delay:       0.1,
  },
  {
    icon:        <Cpu style={{ width: 22, height: 22 }} />,
    title:       'The Software',
    subtitle:    'The Gatekeeper',
    accentColor: GM.yellowText,
    iconBg:      GM.yellowIconBg,
    description: 'A safety-critical, real-time IoT monitoring system continuously ingests telemetry — pH, TDS, temperature, flow rate, and voltage — piped live to a React dashboard for instant analysis.',
    features:    ['Real-time sensor ingestion via MQTT', 'Threshold-based smart alert engine', 'Live React dashboard with analytics', 'Role-based access control (admin / operator / viewer)'],
    delay:       0.22,
  },
] as const;

export function Solution() {
  return (
    <section
      id="solution"
      style={{
        padding:    '120px 32px',
        background: `linear-gradient(180deg, transparent 0%, ${GM.greenDim} 50%, transparent 100%)`,
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <SectionHeader />

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {SOLUTIONS.map(({ delay, ...card }) => (
            <motion.div key={card.title} {...fadeUp(delay)}>
              <SolutionCard {...card} />
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
      <SectionBadge>Our Approach</SectionBadge>
      <h2 style={{
        fontFamily:    GM.font,
        fontSize:      'clamp(30px, 3.5vw, 48px)',
        fontWeight:    700,
        letterSpacing: '-0.03em',
        color:         GM.text,
        margin:        '18px 0 16px',
        lineHeight:    1.1,
      }}>
        The Solution
      </h2>
      <p style={{ fontFamily: GM.font, fontSize: '16px', color: GM.textMuted, lineHeight: 1.7, margin: 0 }}>
        A closed-loop MFC system that acts as a self-sustaining power plant and filtration
        unit, monitored by a real-time IoT architecture.
      </p>
    </motion.div>
  );
}
