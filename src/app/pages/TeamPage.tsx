import { Link } from 'react-router-dom';
import { useAuth } from '@/app/contexts/AuthContext';
import { Zap, ArrowRight, Linkedin } from 'lucide-react';

// ─── Data ─────────────────────────────────────────────────────────────────────

type Dept = 'CHE' | 'PETE' | 'SWE' | 'EE';

interface Member {
  name:       string;
  dept:       Dept;
  leader?:    boolean;
  color:      string;
  linkedin:   string;
}

const MEMBERS: Member[] = [
  { name: 'Sara Almugrin',     dept: 'CHE',  leader: true, color: '#e74c3c', linkedin: 'https://www.linkedin.com/in/' },
  { name: 'Ruba Alshahrani',   dept: 'PETE',              color: '#e67e22', linkedin: 'https://www.linkedin.com/in/' },
  { name: 'Lamees Alikhwan',   dept: 'SWE',               color: '#3498db', linkedin: 'https://www.linkedin.com/in/' },
  { name: 'Rema Almoamer',     dept: 'EE',                color: '#1abc9c', linkedin: 'https://www.linkedin.com/in/' },
  { name: 'Sarah Al Jumaiaah', dept: 'CHE',               color: '#9b59b6', linkedin: 'https://www.linkedin.com/in/' },
  { name: 'Wajan Alkharobi',   dept: 'PETE',              color: '#2ecc71', linkedin: 'https://www.linkedin.com/in/' },
];

const DEPT_STYLES: Record<Dept, { label: string; badge: string }> = {
  CHE:  { label: 'Chemical Engineering',   badge: 'bg-orange-500/15 text-orange-400 border-orange-500/20' },
  PETE: { label: 'Petroleum Engineering',  badge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' },
  SWE:  { label: 'Software Engineering',   badge: 'bg-blue-500/15 text-blue-400 border-blue-500/20'       },
  EE:   { label: 'Electrical Engineering', badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
}

// ─── Member Card ──────────────────────────────────────────────────────────────

function MemberCard({ member }: { member: Member }) {
  const dept = DEPT_STYLES[member.dept];

  return (
    <div className="relative flex flex-col items-center text-center rounded-2xl border border-border bg-card p-7 gap-4 hover:border-border/80 hover:shadow-lg transition-all duration-200">

      {/* Leader crown */}
      {member.leader && (
        <span className="absolute top-4 right-4 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
          Project Leader
        </span>
      )}

      {/* Avatar */}
      <div
        className="flex items-center justify-center rounded-full text-white font-bold text-xl select-none flex-shrink-0 ring-4 ring-border"
        style={{ width: 80, height: 80, backgroundColor: member.color }}
      >
        {initials(member.name)}
      </div>

      {/* Name */}
      <div>
        <h3 className="text-base font-semibold text-foreground leading-snug">{member.name}</h3>

        {/* Department badge */}
        <span className={`mt-2 inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${dept.badge}`}>
          {member.dept} — {dept.label}
        </span>
      </div>

      {/* LinkedIn */}
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
    </div>
  );
}

// ─── Team Page ────────────────────────────────────────────────────────────────

export default function TeamPage() {
  const { user } = useAuth();
  const appLink     = user ? '/dashboard' : '/login';
  const appLinkText = user ? 'Go to Dashboard' : 'Launch Dashboard';

  return (
    <div className="bg-background text-foreground min-h-screen">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto h-full px-4 md:px-8 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <span className="font-bold text-sm">MFC System</span>
            </Link>
            <span className="text-border">|</span>
            <span className="text-sm text-muted-foreground">Team</span>
          </div>

          <Link
            to={appLink}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {appLinkText}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </nav>

      {/* ── Header ── */}
      <div className="pt-14">
        <div
          className="relative border-b border-border py-20 text-center overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.08) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        >
          {/* Glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-48 pointer-events-none blur-3xl opacity-40"
            style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.25), transparent)' }}
          />

          <div className="relative max-w-2xl mx-auto px-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3.5 py-1 text-xs font-medium text-muted-foreground mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              KFUPM · 252 Senior Project · Team F22
            </span>

            <h1 className="text-4xl md:text-5xl font-bold">Meet the Team</h1>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Six engineers across Chemical, Petroleum, Electrical, and Software Engineering
              disciplines — united to build a smarter, greener future for water treatment.
            </p>
          </div>
        </div>
      </div>

      {/* ── Team Grid ── */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MEMBERS.map(m => (
            <MemberCard key={m.name} member={m} />
          ))}
        </div>

        {/* Advisor credit */}
        <div className="mt-14 flex flex-col items-center gap-2 text-center">
          <p className="text-xs text-muted-foreground">Project Coach</p>
          <p className="text-sm font-medium text-foreground">Dr.Khadijah AlSafwan</p>
          <p className="text-xs text-muted-foreground">King Fahd University of Petroleum &amp; Minerals</p>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
              <Zap className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-sm font-semibold">MFC System</span>
          </div>
          <p className="text-xs text-muted-foreground">KFUPM · 252 Senior Project · Team F22</p>
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            ← Back to Home
          </Link>
        </div>
      </footer>

    </div>
  );
}
