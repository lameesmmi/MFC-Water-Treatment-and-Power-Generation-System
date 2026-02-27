import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '@/app/contexts/AuthContext';
import { MFC3DScene } from '@/app/components/MFC3DScene';
import {
  Zap, Droplets, Activity, Cpu, ArrowRight,
  FlaskConical, Wifi, CheckCircle, Linkedin,
} from 'lucide-react';

// ─── Animation helpers ────────────────────────────────────────────────────────

/** Reusable scroll-triggered fade-up props */
const fadeUp = (delay = 0) => ({
  initial:     { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0  },
  viewport:    { once: true, margin: '-60px' },
  transition:  { duration: 0.55, delay, ease: [0.22, 0.61, 0.36, 1] as const },
});

/** Reusable scroll-triggered fade-in (no vertical shift) */
const fadeIn = (delay = 0) => ({
  initial:     { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport:    { once: true, margin: '-60px' },
  transition:  { duration: 0.5, delay },
});

// ─── Team data ────────────────────────────────────────────────────────────────

type Dept = 'CHE' | 'PETE' | 'SWE' | 'EE';

interface Member {
  name:     string;
  dept:     Dept;
  leader?:  boolean;
  color:    string;
  linkedin: string;
}

const MEMBERS: Member[] = [
  { name: 'Sara Almugrin',     dept: 'CHE',  leader: true, color: '#e74c3c', linkedin: 'https://www.linkedin.com/in/sara-almugrin-198819279/' },
  { name: 'Ruba Alshahrani',   dept: 'PETE',              color: '#e67e22', linkedin: 'https://www.linkedin.com/in/' },
  { name: 'Lamees Alikhwan',   dept: 'SWE',               color: '#3498db', linkedin: 'https://www.linkedin.com/in/lamees-al-ikhwan-48a492231' },
  { name: 'Rema Almoamer',     dept: 'EE',                color: '#1abc9c', linkedin: 'https://www.linkedin.com/in/reema-almoammar-610757263/' },
  { name: 'Sarah Al Jumaiaah', dept: 'CHE',               color: '#9b59b6', linkedin: 'https://www.linkedin.com/in/' },
  { name: 'Wajan Alkharobi',   dept: 'PETE',              color: '#2ecc71', linkedin: 'https://www.linkedin.com/in/' },
];

const DEPT_STYLES: Record<Dept, { label: string; badge: string }> = {
  CHE:  { label: 'Chemical Engineering',   badge: 'bg-orange-500/15 text-orange-400 border-orange-500/20'    },
  PETE: { label: 'Petroleum Engineering',  badge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20'   },
  SWE:  { label: 'Software Engineering',   badge: 'bg-blue-500/15 text-blue-400 border-blue-500/20'         },
  EE:   { label: 'Electrical Engineering', badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
};

function memberInitials(name: string) {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
}


// ─── Helper components ────────────────────────────────────────────────────────

function SectionBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1 text-xs font-medium text-muted-foreground">
      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
      {children}
    </span>
  );
}

function ProblemPoint({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex-shrink-0">{icon}</div>
      <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
    </div>
  );
}

function SolutionCard({
  icon, iconBg, title, subtitle, description, features, borderColor,
}: {
  icon: ReactNode; iconBg: string; title: string; subtitle: string;
  description: string; features: string[]; borderColor: string;
}) {
  return (
    <motion.div
      className={`rounded-xl border ${borderColor} bg-card p-6 flex flex-col gap-5 h-full`}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{subtitle}</p>
        <h3 className="text-xl font-bold mt-1">{title}</h3>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{description}</p>
      </div>
      <ul className="space-y-2 mt-auto">
        {features.map(f => (
          <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-3.5 w-3.5 text-primary flex-shrink-0" />
            {f}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function MetricCard({
  value, prefix = '', label, description, color, glowColor,
}: {
  value: string; prefix?: string; label: string;
  description: string; color: string; glowColor: string;
}) {
  return (
    <motion.div
      className="rounded-xl border border-border bg-card p-7 text-center"
      style={{ boxShadow: `inset 0 0 50px ${glowColor}` }}
      whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
    >
      <div className={`text-5xl font-black tracking-tight ${color}`}>
        {prefix}{value}
      </div>
      <p className="mt-2.5 text-sm font-semibold text-foreground">{label}</p>
      <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
}

function ObjectiveCard({
  icon, iconBg, title, description,
}: {
  icon: ReactNode; iconBg: string; title: string; description: string;
}) {
  return (
    <motion.div
      className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3"
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

function MemberCard({ member, delay }: { member: Member; delay: number }) {
  const dept = DEPT_STYLES[member.dept];
  return (
    <motion.div
      className="relative flex flex-col items-center text-center rounded-2xl border border-border bg-card p-6 gap-4"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay, ease: [0.22, 0.61, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      {member.leader && (
        <span className="absolute top-4 right-4 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
          Project Leader
        </span>
      )}
      <div
        className="flex items-center justify-center rounded-full text-white font-bold text-xl select-none ring-4 ring-border"
        style={{ width: 72, height: 72, backgroundColor: member.color }}
      >
        {memberInitials(member.name)}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground leading-snug">{member.name}</h3>
        <span className={`mt-2 inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${dept.badge}`}>
          {member.dept} — {dept.label}
        </span>
      </div>
      <a
        href={member.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto flex items-center gap-1.5 rounded-lg border border-border px-4 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        aria-label={`${member.name} on LinkedIn`}
      >
        <Linkedin className="h-3.5 w-3.5" />
        LinkedIn
      </a>
    </motion.div>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { user } = useAuth();
  const appLink     = user ? '/dashboard' : '/login';
  const appLinkText = user ? 'Go to Dashboard' : 'Launch Dashboard';

  return (
    <div className="bg-background text-foreground min-h-screen overflow-x-hidden">

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-border/50 bg-background/80 backdrop-blur-md"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="max-w-6xl mx-auto h-full px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <span className="font-bold text-sm">MFC System</span>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <a href="#problem"    className="hidden sm:block text-sm text-muted-foreground hover:text-foreground transition-colors">Problem</a>
            <a href="#solution"   className="hidden sm:block text-sm text-muted-foreground hover:text-foreground transition-colors">Solution</a>
            <a href="#objectives" className="hidden sm:block text-sm text-muted-foreground hover:text-foreground transition-colors">Results</a>
            <a href="#team"       className="hidden sm:block text-sm text-muted-foreground hover:text-foreground transition-colors">Team</a>
            <Link
              to={appLink}
              className="flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {appLinkText}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-14">

        {/* Dot-grid background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.09) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Animated glow orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.18), transparent)' }}
          animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.08, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.14), transparent)' }}
          animate={{ opacity: [0.3, 0.55, 0.3], scale: [1, 1.1, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />

        <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left — staggered text entrance */}
            <div>
              <motion.div
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3.5 py-1 text-xs text-muted-foreground mb-6"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                KFUPM · 252 Senior Project · Team F22
              </motion.div>

              <motion.h1
                className="text-4xl md:text-5xl font-bold leading-tight"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
              >
                Powering the Future,
                <br />
                <span
                  style={{
                    background: 'linear-gradient(135deg, #c7d2fe 0%, #818cf8 55%, #6366f1 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  One Drop at a Time.
                </span>
              </motion.h1>

              <motion.p
                className="mt-5 text-lg text-muted-foreground leading-relaxed max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.35 }}
              >
                An intelligent bio-electrochemical system that treats wastewater
                while generating its own sustainable electricity.
              </motion.p>

              <motion.div
                className="mt-6 rounded-xl border border-border bg-card/50 p-5 max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.48 }}
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                  What is a Microbial Fuel Cell?
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  At its core, an MFC is a <span className="text-foreground font-medium">living battery</span>.
                  It harnesses the natural metabolism of bacteria to break down organic matter
                  found in wastewater. As the bacteria consume the waste, they release electrons —
                  captured by our system to generate a usable electrical current,
                  simultaneously <span className="text-foreground font-medium">cleaning the water</span> and
                  producing <span className="text-foreground font-medium">green energy</span>.
                </p>
              </motion.div>

              <motion.div
                className="mt-8 flex flex-wrap items-center gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Link
                  to={appLink}
                  className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  {appLinkText}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#problem"
                  className="flex items-center gap-2 rounded-lg border border-border bg-card/60 px-5 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
                >
                  Learn More ↓
                </a>
              </motion.div>
            </div>

            {/* Right — interactive 3D MFC model */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
            >
              {/* Glow backdrop behind the canvas */}
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.12) 0%, transparent 70%)',
                }}
              />

              {/* 3D Canvas */}
              <div className="relative h-[460px] lg:h-[520px] w-full">
                <MFC3DScene />
              </div>

              {/* Hint caption */}
              <p className="text-center text-xs text-muted-foreground mt-1 opacity-55 select-none">
                Fig. 1 — Interactive 3D MFC model · Drag to rotate
              </p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── Problem ─────────────────────────────────────────────────────── */}
      <section id="problem" className="py-20 md:py-28 border-y border-border bg-card/20">
        <div className="max-w-6xl mx-auto px-4 md:px-8">

          <motion.div className="max-w-3xl mx-auto text-center mb-14" {...fadeUp()}>
            <SectionBadge>The Challenge</SectionBadge>
            <h2 className="text-3xl md:text-4xl font-bold mt-4">
              The Wasted Potential of Wastewater
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
            <motion.div className="space-y-5" {...fadeUp(0.1)}>
              <p className="text-muted-foreground leading-relaxed">
                Industrial and municipal wastewater is packed with latent energy, yet current
                treatment technologies treat it purely as a waste product to be disposed of.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The core problem is twofold: existing systems fail to efficiently extract and
                reuse this high-energy wastewater, and they consume massive amounts of grid
                power to run their filtration processes.
              </p>
              <p className="text-sm text-muted-foreground italic border-l-2 border-border pl-4">
                "We are throwing away potential energy while paying heavily to do so."
              </p>
            </motion.div>

            <div className="space-y-5">
              {[
                { icon: <Droplets className="h-5 w-5 text-blue-400"   />, text: 'Wastewater is treated as a liability, not a resource — discarding immense latent chemical energy in every treatment cycle.',           delay: 0.15 },
                { icon: <Zap      className="h-5 w-5 text-yellow-400" />, text: 'Treatment plants consume massive amounts of grid electricity to run filtration and pumping systems, with no energy recapture.',       delay: 0.25 },
                { icon: <Activity className="h-5 w-5 text-red-400"    />, text: 'No real-time visibility into system performance leaves operators unable to respond quickly to critical threshold violations.', delay: 0.35 },
              ].map(({ icon, text, delay }) => (
                <motion.div key={text} {...fadeUp(delay)}>
                  <ProblemPoint icon={icon} text={text} />
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── Solution ────────────────────────────────────────────────────── */}
      <section id="solution" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 md:px-8">

          <motion.div className="max-w-3xl mx-auto text-center mb-14" {...fadeUp()}>
            <SectionBadge>Our Approach</SectionBadge>
            <h2 className="text-3xl md:text-4xl font-bold mt-4">The Solution</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              We engineered a closed-loop MFC system that acts as a self-sustaining miniature
              power plant and water filtration unit, monitored by a custom-built, real-time
              IoT architecture.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: <FlaskConical className="h-6 w-6" />, iconBg: 'bg-blue-500/10 text-blue-400',
                title: 'The Hardware', subtitle: 'Bioreactor', borderColor: 'border-blue-500/20',
                description: 'The physical MFC unit actively filters the wastewater, utilizing bacterial colonies to break down organic compounds and generate a baseline electrical current — transforming waste into a power source.',
                features: ['Bacterial colony cultivation', 'Organic compound breakdown', 'Baseline electricity generation', 'Continuous water filtration'],
                delay: 0.1,
              },
              {
                icon: <Cpu className="h-6 w-6" />, iconBg: 'bg-indigo-500/10 text-indigo-400',
                title: 'The Software', subtitle: 'The Gatekeeper', borderColor: 'border-indigo-500/20',
                description: 'A safety-critical, real-time IoT monitoring system continuously ingests telemetry — pH, TDS, temperature, flow rate, and voltage. The Node.js backend validates physical data in real-time and pipes it to a live React dashboard for instant analysis.',
                features: ['Real-time sensor ingestion via MQTT', 'Threshold-based smart alert engine', 'Live React dashboard with analytics', 'Role-based access control (admin / operator / viewer)'],
                delay: 0.22,
              },
            ].map(({ delay, ...card }) => (
              <motion.div key={card.title} {...fadeUp(delay)}>
                <SolutionCard {...card} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Metrics & Objectives ────────────────────────────────────────── */}
      <section id="objectives" className="py-20 md:py-28 border-y border-border bg-card/20">
        <div className="max-w-6xl mx-auto px-4 md:px-8">

          <motion.div className="max-w-3xl mx-auto text-center mb-14" {...fadeUp()}>
            <SectionBadge>Prototype Performance</SectionBadge>
            <h2 className="text-3xl md:text-4xl font-bold mt-4">Validated Results</h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Our final design analysis proves the viability of the system with the following recorded metrics.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto mb-20">
            {[
              { value: '70%',   label: 'COD Removal',            description: 'Highly efficient reduction of Chemical Oxygen Demand, purifying the treated water.',                           color: 'text-green-400',  glowColor: 'rgba(34,197,94,0.08)',   delay: 0.1  },
              { value: '15%',   label: 'Coulombic Efficiency',   description: 'Successfully capturing electron transfer from bacterial metabolism to generate usable power.',               color: 'text-indigo-400', glowColor: 'rgba(99,102,241,0.08)',  delay: 0.2  },
              { value: '43.1%', prefix: '−', label: 'Permeability Reduction', description: 'Maintaining excellent flow dynamics and membrane integrity within the system.', color: 'text-blue-400',  glowColor: 'rgba(59,130,246,0.08)',  delay: 0.3  },
            ].map(({ delay, ...card }) => (
              <motion.div key={card.label} {...fadeUp(delay)}>
                <MetricCard {...card} />
              </motion.div>
            ))}
          </div>

          <motion.div className="max-w-3xl mx-auto text-center mb-10" {...fadeUp()}>
            <SectionBadge>Goals</SectionBadge>
            <h2 className="text-2xl md:text-3xl font-bold mt-4">What We Set Out to Achieve</h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto">
              Our prototype was built to prove that wastewater can be transformed into a valuable, monitorable resource.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {[
              { icon: <Droplets className="h-5 w-5 text-blue-400"   />, iconBg: 'bg-blue-500/10',   title: 'EOR Readiness',                 description: 'Filtering water to meet the strict chemical standards required for Enhanced Oil Recovery injection.',                              delay: 0.1  },
              { icon: <Zap      className="h-5 w-5 text-yellow-400" />, iconBg: 'bg-yellow-500/10', title: 'Self-Sustaining Sensor Networks', description: 'Generating enough sustainable power from the wastewater itself to run the system\'s own monitoring sensors.',                  delay: 0.2  },
              { icon: <Wifi     className="h-5 w-5 text-indigo-400" />, iconBg: 'bg-indigo-500/10', title: 'Live Digital Twinning',          description: 'Providing continuous real-time digital monitoring and simulation of the physical hardware state.',                           delay: 0.3  },
            ].map(({ delay, ...card }) => (
              <motion.div key={card.title} {...fadeUp(delay)}>
                <ObjectiveCard {...card} />
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Team ────────────────────────────────────────────────────────── */}
      <section id="team" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 md:px-8">

          <motion.div className="max-w-3xl mx-auto text-center mb-14" {...fadeUp()}>
            <SectionBadge>The People</SectionBadge>
            <h2 className="text-3xl md:text-4xl font-bold mt-4">Meet the Team</h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Six engineers across Chemical, Petroleum, Electrical, and Software Engineering
              disciplines — united to build a smarter, greener future for water treatment.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {MEMBERS.map((m, i) => (
              <MemberCard key={m.name} member={m} delay={i * 0.08} />
            ))}
          </div>

          <motion.div
            className="mt-12 flex flex-col items-center gap-1 text-center"
            {...fadeIn(0.2)}
          >
            <p className="text-xs text-muted-foreground">Project Coach</p>
            <p className="text-sm font-medium text-foreground">Dr. Khadijah AlSafwan</p>
            <p className="text-xs text-muted-foreground">King Fahd University of Petroleum &amp; Minerals</p>
          </motion.div>

        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="py-10 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
                <Zap className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-sm font-semibold">MFC System</span>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              KFUPM · 252 Senior Project · Team F22
            </p>
            <Link
              to={appLink}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {appLinkText} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
