import { motion }          from 'motion/react';
import { Droplets, Zap, Wifi } from 'lucide-react';
import { GM }              from '../constants';
import { fadeUp }          from '../constants';
import { SectionBadge }    from '../components/SectionBadge';
import { MetricCard }      from '../components/MetricCard';
import { ObjectiveCard }   from '../components/ObjectiveCard';

const METRICS = [
  {
    value:       '70%',
    label:       'COD Removal',
    description: 'Highly efficient reduction of Chemical Oxygen Demand, purifying the treated water.',
    accent:      GM.greenText,
    delay:       0.1,
  },
  {
    value:       '15%',
    label:       'Coulombic Efficiency',
    description: 'Successfully capturing electron transfer from bacterial metabolism to generate usable power.',
    accent:      GM.yellowText,
    delay:       0.2,
  },
  {
    value:       '43.1%',
    prefix:      '−',
    label:       'Permeability Reduction',
    description: 'Maintaining excellent flow dynamics and membrane integrity within the system.',
    accent:      GM.greenDeep,
    delay:       0.3,
  },
] as const;

const OBJECTIVES = [
  {
    icon:        <Droplets style={{ width: 18, height: 18 }} />,
    accentColor: GM.greenText,
    iconBg:      GM.greenIconBg,
    title:       'EOR Readiness',
    description: 'Filtering water to meet the strict chemical standards required for Enhanced Oil Recovery injection.',
    delay:       0.1,
  },
  {
    icon:        <Zap style={{ width: 18, height: 18 }} />,
    accentColor: GM.yellowText,
    iconBg:      GM.yellowIconBg,
    title:       'Self-Sustaining Sensor Networks',
    description: "Generating enough power from the wastewater itself to run the system's own monitoring sensors.",
    delay:       0.2,
  },
  {
    icon:        <Wifi style={{ width: 18, height: 18 }} />,
    accentColor: GM.greenDeep,
    iconBg:      GM.greenDeepIconBg,
    title:       'Live Digital Twinning',
    description: 'Providing continuous real-time digital monitoring and simulation of the physical hardware state.',
    delay:       0.3,
  },
] as const;

export function Results() {
  return (
    <section id="objectives" style={{ padding: '120px 32px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <MetricsBlock />
        <ObjectivesBlock />
      </div>
    </section>
  );
}

function MetricsBlock() {
  return (
    <>
      <motion.div style={{ maxWidth: '560px', margin: '0 auto 64px', textAlign: 'center' }} {...fadeUp()}>
        <SectionBadge>Prototype Performance</SectionBadge>
        <h2 style={{
          fontFamily:    GM.font,
          fontSize:      'clamp(30px, 3.5vw, 48px)',
          fontWeight:    700,
          letterSpacing: '-0.03em',
          color:         GM.text,
          margin:        '18px 0 16px',
          lineHeight:    1.1,
        }}>
          Validated Results
        </h2>
        <p style={{ fontFamily: GM.font, fontSize: '16px', color: GM.textMuted, lineHeight: 1.7, margin: 0 }}>
          Our final design analysis proves the viability of the system with these recorded metrics.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto" style={{ marginBottom: '96px' }}>
        {METRICS.map(({ delay, ...card }) => (
          <motion.div key={card.label} {...fadeUp(delay)}>
            <MetricCard {...card} />
          </motion.div>
        ))}
      </div>
    </>
  );
}

function ObjectivesBlock() {
  return (
    <>
      <motion.div style={{ maxWidth: '560px', margin: '0 auto 48px', textAlign: 'center' }} {...fadeUp()}>
        <SectionBadge>Goals</SectionBadge>
        <h2 style={{
          fontFamily:    GM.font,
          fontSize:      'clamp(24px, 3vw, 38px)',
          fontWeight:    700,
          letterSpacing: '-0.03em',
          color:         GM.text,
          margin:        '18px 0 14px',
          lineHeight:    1.12,
        }}>
          What We Set Out to Achieve
        </h2>
        <p style={{ fontFamily: GM.font, fontSize: '15px', color: GM.textMuted, lineHeight: 1.7, margin: 0 }}>
          Our prototype was built to prove that wastewater can become a valuable,
          monitorable resource.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
        {OBJECTIVES.map(({ delay, ...card }) => (
          <motion.div key={card.title} {...fadeUp(delay)}>
            <ObjectiveCard {...card} />
          </motion.div>
        ))}
      </div>
    </>
  );
}
