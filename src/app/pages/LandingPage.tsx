import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/app/contexts/AuthContext';
import {
  Zap, Droplets, Activity, Cpu, ArrowRight,
  FlaskConical, Wifi, CheckCircle,
} from 'lucide-react';

// ─── MFC Schematic Diagram ────────────────────────────────────────────────────

function MFCDiagram() {
  return (
    <div className="relative p-2">
      {/* Ambient glow behind the diagram */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.14) 0%, transparent 70%)' }}
      />
      <svg
        viewBox="0 0 400 248"
        className="relative w-full"
        role="img"
        aria-label="Microbial Fuel Cell operating principle schematic"
      >
        <defs>
          <marker id="arrI" markerWidth="7" markerHeight="7" refX="5.5" refY="3.5" orient="auto">
            <path d="M0 1 L6 3.5 L0 6z" fill="#818cf8" />
          </marker>
          <marker id="arrA" markerWidth="7" markerHeight="7" refX="5.5" refY="3.5" orient="auto">
            <path d="M0 1 L6 3.5 L0 6z" fill="#fbbf24" />
          </marker>
        </defs>

        {/* ── Anode chamber (left, blue) ── */}
        <rect x="5" y="55" width="181" height="162" rx="6"
          fill="rgba(59,130,246,0.06)" stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.5" />

        {/* ── PEM Membrane ── */}
        <rect x="188" y="55" width="24" height="162" rx="2"
          fill="rgba(251,191,36,0.08)" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,3.5" />

        {/* ── Cathode chamber (right, green) ── */}
        <rect x="214" y="55" width="181" height="162" rx="6"
          fill="rgba(34,197,94,0.06)" stroke="#22c55e" strokeWidth="1.5" strokeOpacity="0.5" />

        {/* ── External circuit wires ── */}
        <path d="M95 55 L95 22 L177 22" fill="none" stroke="#475569" strokeWidth="1.5" />
        <path d="M223 22 L305 22 L305 55" fill="none" stroke="#475569" strokeWidth="1.5" />

        {/* ── Load / Resistor box ── */}
        <rect x="177" y="12" width="46" height="20" rx="3"
          fill="#0f172a" stroke="#475569" strokeWidth="1" />
        <text x="200" y="25.5" textAnchor="middle" fontSize="8.5" fill="#94a3b8"
          fontFamily="ui-monospace,monospace" letterSpacing="0.5">LOAD</text>

        {/* ── Electron flow arrows ── */}
        <line x1="115" y1="22" x2="168" y2="22" stroke="#818cf8" strokeWidth="1.5" markerEnd="url(#arrI)" />
        <line x1="232" y1="22" x2="285" y2="22" stroke="#818cf8" strokeWidth="1.5" markerEnd="url(#arrI)" />
        <text x="140" y="16" textAnchor="middle" fontSize="9" fill="#818cf8">e⁻</text>
        <text x="257" y="16" textAnchor="middle" fontSize="9" fill="#818cf8">e⁻</text>

        {/* ── H+ proton flow through membrane ── */}
        <line x1="193" y1="145" x2="208" y2="145" stroke="#fbbf24" strokeWidth="1.5" markerEnd="url(#arrA)" />
        <text x="200" y="139" textAnchor="middle" fontSize="8" fill="#fbbf24">H⁺</text>

        {/* ── Bacteria in anode ── */}
        {([
          [42, 95], [85, 115], [55, 155], [122, 98], [42, 175], [112, 170], [155, 130],
        ] as [number, number][]).map(([cx, cy], i) => (
          <g key={i}>
            <ellipse cx={cx} cy={cy} rx="11" ry="7.5"
              fill="rgba(59,130,246,0.18)" stroke="#60a5fa" strokeWidth="0.8" />
            <circle cx={cx} cy={cy} r="2" fill="#93c5fd" opacity="0.8" />
          </g>
        ))}

        {/* ── O₂ / H₂O bubbles in cathode ── */}
        {([
          [252, 95], [297, 112], [338, 92], [263, 158], [322, 158], [352, 128],
        ] as [number, number][]).map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="7"
            fill="rgba(34,197,94,0.13)" stroke="#4ade80" strokeWidth="0.7" opacity="0.75" />
        ))}

        {/* ── Chamber labels ── */}
        <text x="95" y="71" textAnchor="middle" fontSize="9" fill="#60a5fa" fontWeight="700" letterSpacing="0.8">ANODE (−)</text>
        <text x="305" y="71" textAnchor="middle" fontSize="9" fill="#4ade80" fontWeight="700" letterSpacing="0.8">CATHODE (+)</text>
        <text x="200" y="50" textAnchor="middle" fontSize="8" fill="#fbbf24" fontWeight="600">PEM</text>

        {/* ── Inner content labels ── */}
        <text x="95" y="197" textAnchor="middle" fontSize="7.5" fill="#93c5fd" opacity="0.65">Organic Matter + Bacteria</text>
        <text x="305" y="128" textAnchor="middle" fontSize="7.5" fill="#86efac" opacity="0.65">O₂ + H₂O</text>

        {/* ── Bottom labels ── */}
        <text x="95" y="238" textAnchor="middle" fontSize="8" fill="#64748b">Wastewater IN</text>
        <text x="305" y="238" textAnchor="middle" fontSize="8" fill="#64748b">Clean Water OUT</text>
      </svg>
      <p className="text-center text-xs text-muted-foreground mt-1 opacity-60">
        Fig. 1 — MFC operating principle
      </p>
    </div>
  );
}

// ─── Small helper components ─────────────────────────────────────────────────

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
    <div className={`rounded-xl border ${borderColor} bg-card p-6 flex flex-col gap-5 h-full`}>
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
    </div>
  );
}

function MetricCard({
  value, prefix = '', label, description, color, glowColor,
}: {
  value: string; prefix?: string; label: string;
  description: string; color: string; glowColor: string;
}) {
  return (
    <div
      className="rounded-xl border border-border bg-card p-7 text-center"
      style={{ boxShadow: `inset 0 0 50px ${glowColor}` }}
    >
      <div className={`text-5xl font-black tracking-tight ${color}`}>
        {prefix}{value}
      </div>
      <p className="mt-2.5 text-sm font-semibold text-foreground">{label}</p>
      <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function ObjectiveCard({
  icon, iconBg, title, description,
}: {
  icon: ReactNode; iconBg: string; title: string; description: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
      </div>
    </div>
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
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-border/50 bg-background/80 backdrop-blur-md">
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
            <Link to="/team"      className="hidden sm:block text-sm text-muted-foreground hover:text-foreground transition-colors">Team</Link>
            <Link
              to={appLink}
              className="flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {appLinkText}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

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
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none blur-3xl opacity-60"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.18), transparent)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none blur-3xl opacity-40"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.14), transparent)' }} />

        <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left — text */}
            <div>
              {/* Project badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3.5 py-1 text-xs text-muted-foreground mb-6">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                KFUPM · 252 Senior Project · Team F22
              </div>

              {/* Headline */}
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
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
              </h1>

              {/* Sub-headline */}
              <p className="mt-5 text-lg text-muted-foreground leading-relaxed max-w-md">
                An intelligent bio-electrochemical system that treats wastewater
                while generating its own sustainable electricity.
              </p>

              {/* MFC explainer */}
              <div className="mt-6 rounded-xl border border-border bg-card/50 p-5 max-w-md">
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
              </div>

              {/* CTAs */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
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
              </div>
            </div>

            {/* Right — MFC diagram */}
            <div>
              <MFCDiagram />
            </div>

          </div>
        </div>
      </section>

      {/* ── Problem ─────────────────────────────────────────────────────── */}
      <section id="problem" className="py-20 md:py-28 border-y border-border bg-card/20">
        <div className="max-w-6xl mx-auto px-4 md:px-8">

          <div className="max-w-3xl mx-auto text-center mb-14">
            <SectionBadge>The Challenge</SectionBadge>
            <h2 className="text-3xl md:text-4xl font-bold mt-4">
              The Wasted Potential of Wastewater
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
            <div className="space-y-5">
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
            </div>

            <div className="space-y-5">
              <ProblemPoint
                icon={<Droplets className="h-5 w-5 text-blue-400" />}
                text="Wastewater is treated as a liability, not a resource — discarding immense latent chemical energy in every treatment cycle."
              />
              <ProblemPoint
                icon={<Zap className="h-5 w-5 text-yellow-400" />}
                text="Treatment plants consume massive amounts of grid electricity to run filtration and pumping systems, with no energy recapture."
              />
              <ProblemPoint
                icon={<Activity className="h-5 w-5 text-red-400" />}
                text="No real-time visibility into system performance leaves operators unable to respond quickly to critical threshold violations."
              />
            </div>
          </div>

        </div>
      </section>

      {/* ── Solution ────────────────────────────────────────────────────── */}
      <section id="solution" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 md:px-8">

          <div className="max-w-3xl mx-auto text-center mb-14">
            <SectionBadge>Our Approach</SectionBadge>
            <h2 className="text-3xl md:text-4xl font-bold mt-4">The Solution</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              We engineered a closed-loop MFC system that acts as a self-sustaining miniature
              power plant and water filtration unit, monitored by a custom-built, real-time
              IoT architecture.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">

            <SolutionCard
              icon={<FlaskConical className="h-6 w-6" />}
              iconBg="bg-blue-500/10 text-blue-400"
              title="The Hardware"
              subtitle="Bioreactor"
              description="The physical MFC unit actively filters the wastewater, utilizing bacterial colonies to break down organic compounds and generate a baseline electrical current — transforming waste into a power source."
              features={[
                'Bacterial colony cultivation',
                'Organic compound breakdown',
                'Baseline electricity generation',
                'Continuous water filtration',
              ]}
              borderColor="border-blue-500/20"
            />

            <SolutionCard
              icon={<Cpu className="h-6 w-6" />}
              iconBg="bg-indigo-500/10 text-indigo-400"
              title="The Software"
              subtitle="The Gatekeeper"
              description="A safety-critical, real-time IoT monitoring system continuously ingests telemetry — pH, TDS, temperature, flow rate, and voltage. The Node.js backend validates physical data in real-time and pipes it to a live React dashboard for instant analysis."
              features={[
                'Real-time sensor ingestion via MQTT',
                'Threshold-based smart alert engine',
                'Live React dashboard with analytics',
                'Role-based access control (admin / operator / viewer)',
              ]}
              borderColor="border-indigo-500/20"
            />

          </div>
        </div>
      </section>

      {/* ── Metrics & Objectives ────────────────────────────────────────── */}
      <section id="objectives" className="py-20 md:py-28 border-y border-border bg-card/20">
        <div className="max-w-6xl mx-auto px-4 md:px-8">

          {/* Metrics */}
          <div className="max-w-3xl mx-auto text-center mb-14">
            <SectionBadge>Prototype Performance</SectionBadge>
            <h2 className="text-3xl md:text-4xl font-bold mt-4">Validated Results</h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Our final design analysis proves the viability of the system with the following
              recorded metrics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto mb-20">
            <MetricCard
              value="70%"
              label="COD Removal"
              description="Highly efficient reduction of Chemical Oxygen Demand, purifying the treated water."
              color="text-green-400"
              glowColor="rgba(34,197,94,0.08)"
            />
            <MetricCard
              value="15%"
              label="Coulombic Efficiency"
              description="Successfully capturing electron transfer from bacterial metabolism to generate usable power."
              color="text-indigo-400"
              glowColor="rgba(99,102,241,0.08)"
            />
            <MetricCard
              value="43.1%"
              prefix="−"
              label="Permeability Reduction"
              description="Maintaining excellent flow dynamics and membrane integrity within the system."
              color="text-blue-400"
              glowColor="rgba(59,130,246,0.08)"
            />
          </div>

          {/* Objectives */}
          <div className="max-w-3xl mx-auto text-center mb-10">
            <SectionBadge>Goals</SectionBadge>
            <h2 className="text-2xl md:text-3xl font-bold mt-4">What We Set Out to Achieve</h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto">
              Our prototype was built to prove that wastewater can be transformed into a
              valuable, monitorable resource.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            <ObjectiveCard
              icon={<Droplets className="h-5 w-5 text-blue-400" />}
              iconBg="bg-blue-500/10"
              title="EOR Readiness"
              description="Filtering water to meet the strict chemical standards required for Enhanced Oil Recovery injection."
            />
            <ObjectiveCard
              icon={<Zap className="h-5 w-5 text-yellow-400" />}
              iconBg="bg-yellow-500/10"
              title="Self-Sustaining Sensor Networks"
              description="Generating enough sustainable power from the wastewater itself to run the system's own monitoring sensors."
            />
            <ObjectiveCard
              icon={<Wifi className="h-5 w-5 text-indigo-400" />}
              iconBg="bg-indigo-500/10"
              title="Live Digital Twinning"
              description="Providing continuous real-time digital monitoring and simulation of the physical hardware state."
            />
          </div>

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
