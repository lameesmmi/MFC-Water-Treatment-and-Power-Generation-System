import { ReactNode, CSSProperties } from 'react';

import { Link } from 'react-router-dom';

import { motion } from 'motion/react';

import { useAuth } from '@/app/contexts/AuthContext';

import { MFC3DScene } from '@/app/components/MFC3DScene';

import { ThemeToggle } from '@/app/components/ThemeToggle';

import {

  Zap, Droplets, Activity, Cpu, ArrowRight,

  FlaskConical, Wifi, Linkedin,

} from 'lucide-react';



// ─────────────────────────────────────────────────────────────────────────────

// ── DESIGN TOKENS — edit values in styles/theme.css (--lp-* variables) ───────

// ─────────────────────────────────────────────────────────────────────────────



const GM = {

  // Typography

  font: "'Helvetica Neue', Helvetica, Arial, sans-serif",

  // Core surfaces — resolved from theme.css CSS variables

  bg:              'var(--lp-bg)',

  text:            'var(--lp-text)',

  textMuted:       'var(--lp-text-muted)',

  // Green accent — fill (always pastel) vs text (deep in light, pastel in dark)

  green:           '#DDE4C3',              // background fills only

  greenText:       'var(--lp-green-text)', // text & icon color

  greenDim:        'var(--lp-green-dim)',

  greenBorder:     'var(--lp-green-border)',

  greenDeep:       '#8EA468',              // always visible in both themes

  greenIconBg:     'var(--lp-green-icon-bg)',

  // Yellow accent — fill vs text

  yellow:          '#F6F4D4',              // background fills only

  yellowText:      'var(--lp-yellow-text)',// text & icon color

  yellowDim:       'var(--lp-yellow-dim)',

  yellowBorder:    'var(--lp-yellow-border)',

  yellowIconBg:    'var(--lp-yellow-icon-bg)',

  // Green-deep icon background

  greenDeepIconBg: 'var(--lp-green-deep-icon-bg)',

  // Glassmorphism recipe

  glassA:          'var(--lp-glass-bg)',

  glassBorder:     'var(--lp-glass-border)',

  glassBlur:       '20px',

  // Navigation

  navBg:           'var(--lp-nav-bg)',

  // Hero gradient text (readable in both themes)

  gradientStart:   'var(--lp-gradient-start)',

  gradientEnd:     'var(--lp-gradient-end)',

  // Shape

  radiusCard:  '24px',

  radiusPill:  '100px',

  // Motion easing

  ease: 'cubic-bezier(0.4, 0, 0.2, 1)',

} as const;



// ─────────────────────────────────────────────────────────────────────────────

// ── STYLE PRESETS  (shared across components — edit once, used everywhere) ───

// ─────────────────────────────────────────────────────────────────────────────



const S: Record<string, CSSProperties> = {

  /** Glassmorphism card base */

  glass: {

    background:           GM.glassA,

    backdropFilter:       `blur(${GM.glassBlur})`,

    WebkitBackdropFilter: `blur(${GM.glassBlur})`,

    borderWidth:          '1px',

    borderStyle:          'solid',

    borderColor:          GM.glassBorder,

    borderRadius:         GM.radiusCard,

  },



  /** Solid pill — green bg, dark text */

  btnSolid: {

    display:       'inline-flex',

    alignItems:    'center',

    gap:           '8px',

    borderRadius:  GM.radiusPill,

    background:    GM.green,

    color:         '#0C0F09',

    border:        'none',

    fontFamily:    GM.font,

    fontWeight:    600,

    fontSize:      '14px',

    letterSpacing: '-0.01em',

    cursor:        'pointer',

    padding:       '12px 24px',

    textDecoration:'none',

    transition:    `all 0.22s ${GM.ease}`,

    whiteSpace:    'nowrap',

  },



  /** Outline pill — transparent bg, green text/border */

  btnOutline: {

    display:       'inline-flex',

    alignItems:    'center',

    gap:           '8px',

    borderRadius:  GM.radiusPill,

    background:    'transparent',

    color:         GM.greenText,

    border:        `1px solid ${GM.glassBorder}`,

    fontFamily:    GM.font,

    fontWeight:    500,

    fontSize:      '14px',

    letterSpacing: '-0.01em',

    cursor:        'pointer',

    padding:       '12px 24px',

    textDecoration:'none',

    transition:    `all 0.22s ${GM.ease}`,

    whiteSpace:    'nowrap',

  },

};



// ─────────────────────────────────────────────────────────────────────────────

// ── ANIMATION HELPERS ────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────



const fadeUp = (delay = 0) => ({

  initial:     { opacity: 0, y: 32 },

  whileInView: { opacity: 1, y: 0  },

  viewport:    { once: true, margin: '-60px' },

  transition:  { duration: 0.6, delay, ease: [0.22, 0.61, 0.36, 1] as const },

});



const fadeIn = (delay = 0) => ({

  initial:     { opacity: 0 },

  whileInView: { opacity: 1 },

  viewport:    { once: true, margin: '-60px' },

  transition:  { duration: 0.55, delay },

});



// ─────────────────────────────────────────────────────────────────────────────

// ── TEAM DATA ────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────



type Dept = 'CHE' | 'PETE' | 'SWE' | 'EE';



interface Member {

  name: string; dept: Dept; leader?: boolean; color: string; linkedin: string;

}



const MEMBERS: Member[] = [

  { name: 'Sara Almugrin',     dept: 'CHE',  leader: true, color: '#b07055', linkedin: 'https://www.linkedin.com/in/sara-almugrin-198819279/' },

  { name: 'Ruba Alshahrani',   dept: 'PETE',              color: '#8EA468', linkedin: 'https://www.linkedin.com/in/' },

  { name: 'Lamees Alikhwan',   dept: 'SWE',               color: '#5888b0', linkedin: 'https://www.linkedin.com/in/lamees-al-ikhwan-48a492231' },

  { name: 'Rema Almoamer',     dept: 'EE',                color: '#5a9c84', linkedin: 'https://www.linkedin.com/in/reema-almoammar-610757263/' },

  { name: 'Sarah Al Jumaiaah', dept: 'CHE',               color: '#8870a8', linkedin: 'https://www.linkedin.com/in/' },

  { name: 'Wajan Alkharobi',   dept: 'PETE',              color: '#4e9660', linkedin: 'https://www.linkedin.com/in/' },

];



const DEPT_META: Record<Dept, { label: string; bg: string; text: string; border: string }> = {

  CHE:  { label: 'Chemical Engineering',   bg: GM.yellowDim, text: GM.yellowText, border: GM.yellowBorder },

  PETE: { label: 'Petroleum Engineering',  bg: GM.greenDim,  text: GM.greenText,  border: GM.greenBorder  },

  SWE:  { label: 'Software Engineering',   bg: GM.greenDim,  text: GM.greenText,  border: GM.greenBorder  },

  EE:   { label: 'Electrical Engineering', bg: GM.yellowDim, text: GM.yellowText, border: GM.yellowBorder },

};



function initials(name: string) {

  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);

}



// ─────────────────────────────────────────────────────────────────────────────

// ── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────



/** Pill-shaped section category label */

function SectionBadge({ children }: { children: ReactNode }) {

  return (

    <span style={{

      display:       'inline-flex', alignItems: 'center', gap: '7px',

      borderRadius:  GM.radiusPill,

      border:        `1px solid ${GM.greenBorder}`,

      background:    GM.greenDim,

      padding:       '5px 16px',

      fontSize:      '11px', fontWeight: 600, letterSpacing: '0.09em',

      textTransform: 'uppercase', color: GM.greenText, fontFamily: GM.font,

    }}>

      <span style={{ width: 5, height: 5, borderRadius: '50%', background: GM.greenText, flexShrink: 0 }} />

      {children}

    </span>

  );

}



/** Glassmorphism card with optional hover lift */

function GlassCard({

  children, style = {}, hoverLift = true, className = '',

}: {

  children: ReactNode; style?: CSSProperties; hoverLift?: boolean; className?: string;

}) {

  return (

    <motion.div

      className={className}

      style={{ ...S.glass, ...style }}

      whileHover={hoverLift ? {

        y: -5,

        borderColor: 'rgba(221,228,195,0.30)',

        background:  'rgba(221,228,195,0.09)',

        transition:  { duration: 0.2 },

      } : {}}

    >

      {children}

    </motion.div>

  );

}



/** Circle-dot bullet icon (minimalist geometric) */

function Dot({ color = GM.greenDeep }: { color?: string }) {

  return (

    <span style={{

      width: 17, height: 17, borderRadius: '50%',

      border: `1.5px solid ${color}`,

      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',

      flexShrink: 0, marginTop: '2px',

    }}>

      <span style={{ width: 5, height: 5, borderRadius: '50%', background: color }} />

    </span>

  );

}



/** Department badge pill */

function DeptBadge({ dept }: { dept: Dept }) {

  const d = DEPT_META[dept];

  return (

    <span style={{

      display: 'inline-block', borderRadius: GM.radiusPill,

      border: `1px solid ${d.border}`, background: d.bg,

      padding: '3px 12px', fontSize: '11px', fontWeight: 500,

      color: d.text, fontFamily: GM.font, letterSpacing: '0.01em',

    }}>

      {dept} — {d.label}

    </span>

  );

}



/** Full-width subtle section divider */

function Divider() {

  return (

    <div style={{

      width: '100%', height: '1px',

      background: `linear-gradient(to right, transparent, ${GM.glassBorder}, transparent)`,

    }} />

  );

}



// ─────────────────────────────────────────────────────────────────────────────

// ── SECTION CARD COMPONENTS ───────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────



function MetricCard({

  value, prefix = '', label, description, accent,

}: {

  value: string; prefix?: string; label: string; description: string; accent: string;

}) {

  return (

    <GlassCard style={{ padding: '36px 32px', textAlign: 'center' }}>

      <div style={{

        fontFamily: GM.font, fontSize: 'clamp(42px, 4.5vw, 62px)',

        fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1, color: accent,

      }}>

        {prefix}{value}

      </div>

      <div style={{

        fontFamily: GM.font, fontSize: '14px', fontWeight: 600,

        color: GM.text, marginTop: '12px', letterSpacing: '-0.01em',

      }}>

        {label}

      </div>

      <div style={{

        fontFamily: GM.font, fontSize: '13px', color: GM.textMuted,

        marginTop: '7px', lineHeight: 1.65,

      }}>

        {description}

      </div>

    </GlassCard>

  );

}



function SolutionCard({

  icon, title, subtitle, description, features, accentColor, iconBg,

}: {

  icon: ReactNode; title: string; subtitle: string;

  description: string; features: string[]; accentColor: string; iconBg: string;

}) {

  return (

    <GlassCard style={{ padding: '36px', display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>

      <div style={{

        width: 44, height: 44, borderRadius: '12px',

        background: iconBg,

        display: 'flex', alignItems: 'center', justifyContent: 'center',

        color: accentColor,

      }}>

        {icon}

      </div>

      <div>

        <div style={{

          fontFamily: GM.font, fontSize: '11px', fontWeight: 600,

          letterSpacing: '0.1em', textTransform: 'uppercase',

          color: GM.textMuted, marginBottom: '6px',

        }}>

          {subtitle}

        </div>

        <h3 style={{

          fontFamily: GM.font, fontSize: '22px', fontWeight: 700,

          letterSpacing: '-0.02em', color: GM.text, margin: 0,

        }}>

          {title}

        </h3>

        <p style={{

          fontFamily: GM.font, fontSize: '15px', color: GM.textMuted,

          lineHeight: 1.65, margin: '10px 0 0',

        }}>

          {description}

        </p>

      </div>

      <ul style={{

        display: 'flex', flexDirection: 'column', gap: '10px',

        listStyle: 'none', padding: 0, margin: 'auto 0 0',

      }}>

        {features.map(f => (

          <li key={f} style={{

            display: 'flex', alignItems: 'flex-start', gap: '10px',

            fontFamily: GM.font, fontSize: '14px', color: GM.textMuted,

          }}>

            <Dot color={accentColor} />

            {f}

          </li>

        ))}

      </ul>

    </GlassCard>

  );

}



function ObjectiveCard({

  icon, accentColor, iconBg, title, description,

}: {

  icon: ReactNode; accentColor: string; iconBg: string; title: string; description: string;

}) {

  return (

    <GlassCard style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <div style={{

        width: 36, height: 36, borderRadius: '10px',

        background: iconBg,

        display: 'flex', alignItems: 'center', justifyContent: 'center',

        color: accentColor,

      }}>

        {icon}

      </div>

      <div>

        <h4 style={{

          fontFamily: GM.font, fontSize: '15px', fontWeight: 600,

          letterSpacing: '-0.01em', color: GM.text, margin: '0 0 7px',

        }}>

          {title}

        </h4>

        <p style={{

          fontFamily: GM.font, fontSize: '13px', color: GM.textMuted,

          lineHeight: 1.65, margin: 0,

        }}>

          {description}

        </p>

      </div>

    </GlassCard>

  );

}



function MemberCard({ member, delay }: { member: Member; delay: number }) {

  return (

    <motion.div

      style={{

        ...S.glass, position: 'relative',

        padding: '28px 24px', display: 'flex', flexDirection: 'column',

        alignItems: 'center', textAlign: 'center', gap: '16px',

      }}

      initial={{ opacity: 0, y: 28 }}

      whileInView={{ opacity: 1, y: 0 }}

      viewport={{ once: true, margin: '-50px' }}

      transition={{ duration: 0.5, delay, ease: [0.22, 0.61, 0.36, 1] }}

      whileHover={{ y: -5, borderColor: 'rgba(221,228,195,0.30)', transition: { duration: 0.2 } }}

    >

      {member.leader && (

        <span style={{

          position: 'absolute', top: 14, right: 14,

          borderRadius: GM.radiusPill, background: GM.greenDim,

          border: `1px solid ${GM.greenBorder}`,

          padding: '3px 11px', fontSize: '10px', fontWeight: 600,

          color: GM.greenText, letterSpacing: '0.06em', fontFamily: GM.font,

        }}>

          Leader

        </span>

      )}

      <div style={{

        width: 64, height: 64, borderRadius: '50%', background: member.color,

        display: 'flex', alignItems: 'center', justifyContent: 'center',

        color: '#fff', fontWeight: 700, fontSize: '19px',

        flexShrink: 0, fontFamily: GM.font,

        outline: `2px solid ${GM.glassBorder}`, outlineOffset: '3px',

      }}>

        {initials(member.name)}

      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>

        <div style={{

          fontFamily: GM.font, fontSize: '14px', fontWeight: 600,

          color: GM.text, letterSpacing: '-0.01em',

        }}>

          {member.name}

        </div>

        <DeptBadge dept={member.dept} />

      </div>

      <a

        href={member.linkedin} target="_blank" rel="noopener noreferrer"

        style={{ ...S.btnOutline, padding: '8px 18px', fontSize: '12px', marginTop: 'auto' }}

      >

        <Linkedin style={{ width: 13, height: 13 }} />

        LinkedIn

      </a>

    </motion.div>

  );

}



// ─────────────────────────────────────────────────────────────────────────────

// ── LANDING PAGE ──────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────



export default function LandingPage() {

  const { user }    = useAuth();

  const appLink     = user ? '/dashboard' : '/login';

  const appLinkText = user ? 'Go to Dashboard' : 'Launch Dashboard';



  return (

    <div style={{

      fontFamily: GM.font, background: GM.bg, color: GM.text,

      minHeight: '100vh', overflowX: 'hidden',

    }}>



      {/* ── Navbar ──────────────────────────────────────────────────────── */}

      <motion.nav

        style={{

          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, height: '60px',

          background: GM.navBg,

          backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)',

          borderBottom: `1px solid ${GM.glassBorder}`,

          display: 'flex', alignItems: 'center',

        }}

        initial={{ opacity: 0, y: -10 }}

        animate={{ opacity: 1, y: 0 }}

        transition={{ duration: 0.4, ease: 'easeOut' }}

      >

        <div style={{

          maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '0 32px',

          display: 'flex', alignItems: 'center', justifyContent: 'space-between',

        }}>

          {/* Logo */}

          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>

            <div style={{

              width: 30, height: 30, borderRadius: '8px',

              background: GM.greenDim, border: `1px solid ${GM.greenBorder}`,

              display: 'flex', alignItems: 'center', justifyContent: 'center',

            }}>

              <Zap style={{ width: 14, height: 14, color: GM.greenText }} />

            </div>

            <span style={{ fontWeight: 700, fontSize: '15px', letterSpacing: '-0.02em', color: GM.text }}>

              MFC System

            </span>

          </div>



          {/* Nav + CTA */}

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>

            {[

              { href: '#problem',    label: 'Problem'  },

              { href: '#solution',   label: 'Solution' },

              { href: '#objectives', label: 'Results'  },

              { href: '#team',       label: 'Team'     },

            ].map(({ href, label }) => (

              <a

                key={href} href={href}

                className="hidden sm:inline-flex"

                style={{

                  borderRadius: GM.radiusPill, padding: '7px 14px',

                  fontSize: '13px', fontWeight: 500,

                  color: GM.textMuted, textDecoration: 'none',

                  transition: `color 0.2s ${GM.ease}`, fontFamily: GM.font,

                }}

                onMouseEnter={e => (e.currentTarget.style.color = GM.greenText)}

                onMouseLeave={e => (e.currentTarget.style.color = GM.textMuted)}

              >

                {label}

              </a>

            ))}

            <div style={{ marginLeft: '6px' }}>

              <ThemeToggle />

            </div>

            <Link

              to={appLink}

              style={{ ...S.btnSolid, padding: '9px 20px', fontSize: '13px', marginLeft: '6px' }}

            >

              {appLinkText}

              <ArrowRight style={{ width: 14, height: 14 }} />

            </Link>

          </div>

        </div>

      </motion.nav>



      {/* ── Hero ────────────────────────────────────────────────────────── */}

      <section style={{

        position: 'relative', minHeight: '100vh', paddingTop: '60px',

        display: 'flex', alignItems: 'center', overflow: 'hidden',

      }}>

        {/* Dot-grid pattern */}

        <div style={{

          position: 'absolute', inset: 0, pointerEvents: 'none',

          backgroundImage: `radial-gradient(circle, ${GM.greenBorder} 1px, transparent 1px)`,

          backgroundSize: '30px 30px',

        }} />



        {/* Animated glow orbs */}

        <motion.div

          style={{

            position: 'absolute', top: '18%', left: '8%',

            width: 440, height: 440, borderRadius: '50%',

            background: 'radial-gradient(circle, rgba(142,164,104,0.14), transparent 70%)',

            pointerEvents: 'none', filter: 'blur(10px)',

          }}

          animate={{ opacity: [0.45, 0.75, 0.45], scale: [1, 1.1, 1] }}

          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}

        />

        <motion.div

          style={{

            position: 'absolute', bottom: '12%', right: '4%',

            width: 360, height: 360, borderRadius: '50%',

            background: 'radial-gradient(circle, rgba(246,244,212,0.09), transparent 70%)',

            pointerEvents: 'none', filter: 'blur(10px)',

          }}

          animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.12, 1] }}

          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}

        />



        {/* Hero grid */}

        <div

          className="relative w-full max-w-[1280px] mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-[45fr_55fr] gap-12 items-center"

        >



          {/* ── Left: Text ─────────────────────────────────────── */}

          <div>

            <motion.div

              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}

              transition={{ duration: 0.4, delay: 0.1 }}

              style={{ marginBottom: '28px' }}

            >

              <SectionBadge>KFUPM · 252 Senior Project · Team F22</SectionBadge>

            </motion.div>



            <motion.h1

              style={{

                fontFamily: GM.font, fontSize: 'clamp(44px, 5.5vw, 72px)',

                fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.06,

                color: GM.text, margin: 0,

              }}

              initial={{ opacity: 0, y: 28 }}

              animate={{ opacity: 1, y: 0 }}

              transition={{ duration: 0.65, delay: 0.18, ease: [0.22, 0.61, 0.36, 1] }}

            >

              Powering the Future,

              <br />

              <span style={{

                background: `linear-gradient(135deg, ${GM.gradientStart} 0%, ${GM.gradientEnd} 100%)`,

                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',

                backgroundClip: 'text',

              }}>

                One Drop at a Time.

              </span>

            </motion.h1>



            <motion.p

              style={{

                fontFamily: GM.font, fontSize: '17px', color: GM.textMuted,

                lineHeight: 1.65, maxWidth: '420px', margin: '22px 0 0',

              }}

              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}

              transition={{ duration: 0.55, delay: 0.32 }}

            >

              An intelligent bio-electrochemical system that treats wastewater

              while generating its own sustainable electricity.

            </motion.p>



            {/* Info glass card */}

            <motion.div

              style={{ ...S.glass, marginTop: '28px', padding: '22px 24px', maxWidth: '440px' }}

              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}

              transition={{ duration: 0.55, delay: 0.46 }}

            >

              <p style={{

                fontFamily: GM.font, fontSize: '11px', fontWeight: 600,

                letterSpacing: '0.1em', textTransform: 'uppercase',

                color: GM.textMuted, margin: '0 0 10px',

              }}>

                What is a Microbial Fuel Cell?

              </p>

              <p style={{

                fontFamily: GM.font, fontSize: '14px', color: GM.textMuted,

                lineHeight: 1.7, margin: 0,

              }}>

                At its core, an MFC is a{' '}

                <span style={{ color: GM.text, fontWeight: 500 }}>living battery</span>.

                It harnesses bacterial metabolism to break down organic matter in wastewater,

                releasing electrons captured as an electrical current — simultaneously{' '}

                <span style={{ color: GM.text, fontWeight: 500 }}>cleaning the water</span>{' '}

                and producing{' '}

                <span style={{ color: GM.greenText, fontWeight: 500 }}>green energy</span>.

              </p>

            </motion.div>



            {/* CTA buttons */}

            <motion.div

              style={{ marginTop: '32px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}

              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}

              transition={{ duration: 0.5, delay: 0.58 }}

            >

              <Link to={appLink} style={S.btnSolid}>

                {appLinkText}

                <ArrowRight style={{ width: 15, height: 15 }} />

              </Link>

              <a href="#problem" style={S.btnOutline}>

                Learn More ↓

              </a>

            </motion.div>

          </div>



          {/* ── Right: 3D Model ────────────────────────────────── */}

          <motion.div

            style={{ position: 'relative' }}

            initial={{ opacity: 0, x: 36 }} animate={{ opacity: 1, x: 0 }}

            transition={{ duration: 0.75, delay: 0.28, ease: [0.22, 0.61, 0.36, 1] }}

          >

            {/* Glow halo */}

            <div style={{

              position: 'absolute', inset: '-32px', borderRadius: '40px',

              pointerEvents: 'none',

              background: 'radial-gradient(ellipse at center, rgba(142,164,104,0.10) 0%, transparent 65%)',

            }} />



            {/* Canvas */}

            <div style={{

              position: 'relative',

              height: 'clamp(400px, calc(100vh - 100px), 680px)',

              borderRadius: GM.radiusCard, overflow: 'hidden',

            }}>

              <MFC3DScene />

            </div>



            <p style={{

              textAlign: 'center', fontSize: '11px', color: GM.textMuted,

              marginTop: '10px', letterSpacing: '0.02em', userSelect: 'none',

            }}>

              Fig. 1 — Interactive 3D MFC model · Drag to rotate

            </p>

          </motion.div>



        </div>

      </section>



      <Divider />



      {/* ── Problem ─────────────────────────────────────────────────────── */}

      <section id="problem" style={{ padding: '120px 32px' }}>

        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>



          <motion.div style={{ maxWidth: '560px', margin: '0 auto 64px', textAlign: 'center' }} {...fadeUp()}>

            <SectionBadge>The Challenge</SectionBadge>

            <h2 style={{

              fontFamily: GM.font, fontSize: 'clamp(30px, 3.5vw, 48px)',

              fontWeight: 700, letterSpacing: '-0.03em',

              color: GM.text, margin: '18px 0 16px', lineHeight: 1.1,

            }}>

              The Wasted Potential<br />of Wastewater

            </h2>

            <p style={{ fontFamily: GM.font, fontSize: '16px', color: GM.textMuted, lineHeight: 1.7, margin: 0 }}>

              Industrial wastewater is packed with latent energy, yet current treatment

              technologies treat it purely as a liability to be discarded.

            </p>

          </motion.div>



          {/* Cards — middle one is elevated for depth */}

          <div className="grid md:grid-cols-3 gap-5">

            {[

              {

                icon: <Droplets style={{ width: 20, height: 20 }} />,

                iconColor: GM.greenText, iconBg: GM.greenIconBg, offset: 0, delay: 0.1,

                title: 'Energy Discarded',

                body:  'Wastewater is treated as a pure liability — discarding immense latent chemical energy in every treatment cycle rather than capturing and reusing it.',

              },

              {

                icon: <Zap style={{ width: 20, height: 20 }} />,

                iconColor: GM.yellowText, iconBg: GM.yellowIconBg, offset: -20, delay: 0.2,

                title: 'High Operational Cost',

                body:  'Treatment plants consume massive amounts of grid electricity to run filtration and pumping systems, with zero energy recapture in the process.',

              },

              {

                icon: <Activity style={{ width: 20, height: 20 }} />,

                iconColor: GM.greenDeep, iconBg: GM.greenDeepIconBg, offset: 0, delay: 0.3,

                title: 'No Real-Time Visibility',

                body:  'Without live monitoring, operators cannot respond quickly to critical threshold violations, risking system failures and compliance breaches.',

              },

            ].map(({ icon, iconColor, iconBg, offset, delay, title, body }) => (

              <motion.div key={title} {...fadeUp(delay)} style={{ transform: `translateY(${offset}px)` }}>

                <GlassCard style={{ padding: '32px', height: '100%', display: 'flex', flexDirection: 'column', gap: '18px' }}>

                  <div style={{

                    width: 40, height: 40, borderRadius: '10px',

                    background: iconBg,

                    display: 'flex', alignItems: 'center', justifyContent: 'center',

                    color: iconColor,

                  }}>

                    {icon}

                  </div>

                  <div>

                    <h3 style={{

                      fontFamily: GM.font, fontSize: '17px', fontWeight: 700,

                      letterSpacing: '-0.02em', color: GM.text, margin: '0 0 10px',

                    }}>

                      {title}

                    </h3>

                    <p style={{ fontFamily: GM.font, fontSize: '14px', color: GM.textMuted, lineHeight: 1.7, margin: 0 }}>

                      {body}

                    </p>

                  </div>

                </GlassCard>

              </motion.div>

            ))}

          </div>



        </div>

      </section>



      <Divider />



      {/* ── Solution ────────────────────────────────────────────────────── */}

      <section

        id="solution"

        style={{

          padding: '120px 32px',

          background: `linear-gradient(180deg, transparent 0%, ${GM.greenDim} 50%, transparent 100%)`,

        }}

      >

        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>



          <motion.div style={{ maxWidth: '560px', margin: '0 auto 64px', textAlign: 'center' }} {...fadeUp()}>

            <SectionBadge>Our Approach</SectionBadge>

            <h2 style={{

              fontFamily: GM.font, fontSize: 'clamp(30px, 3.5vw, 48px)',

              fontWeight: 700, letterSpacing: '-0.03em',

              color: GM.text, margin: '18px 0 16px', lineHeight: 1.1,

            }}>

              The Solution

            </h2>

            <p style={{ fontFamily: GM.font, fontSize: '16px', color: GM.textMuted, lineHeight: 1.7, margin: 0 }}>

              A closed-loop MFC system that acts as a self-sustaining power plant and filtration

              unit, monitored by a real-time IoT architecture.

            </p>

          </motion.div>



          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">

            {[

              {

                icon:        <FlaskConical style={{ width: 22, height: 22 }} />,

                title:       'The Hardware',       subtitle:    'Bioreactor',

                accentColor: GM.greenText, iconBg: GM.greenIconBg,

                description: 'The physical MFC unit actively filters wastewater, utilizing bacterial colonies to break down organic compounds and generate a baseline electrical current — transforming waste into a power source.',

                features:    ['Bacterial colony cultivation', 'Organic compound breakdown', 'Baseline electricity generation', 'Continuous water filtration'],

                delay: 0.1,

              },

              {

                icon:        <Cpu style={{ width: 22, height: 22 }} />,

                title:       'The Software',       subtitle:    'The Gatekeeper',

                accentColor: GM.yellowText, iconBg: GM.yellowIconBg,

                description: 'A safety-critical, real-time IoT monitoring system continuously ingests telemetry — pH, TDS, temperature, flow rate, and voltage — piped live to a React dashboard for instant analysis.',

                features:    ['Real-time sensor ingestion via MQTT', 'Threshold-based smart alert engine', 'Live React dashboard with analytics', 'Role-based access control (admin / operator / viewer)'],

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



      <Divider />



      {/* ── Metrics + Objectives ────────────────────────────────────────── */}

      <section id="objectives" style={{ padding: '120px 32px' }}>

        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>



          {/* Metrics */}

          <motion.div style={{ maxWidth: '560px', margin: '0 auto 64px', textAlign: 'center' }} {...fadeUp()}>

            <SectionBadge>Prototype Performance</SectionBadge>

            <h2 style={{

              fontFamily: GM.font, fontSize: 'clamp(30px, 3.5vw, 48px)',

              fontWeight: 700, letterSpacing: '-0.03em',

              color: GM.text, margin: '18px 0 16px', lineHeight: 1.1,

            }}>

              Validated Results

            </h2>

            <p style={{ fontFamily: GM.font, fontSize: '16px', color: GM.textMuted, lineHeight: 1.7, margin: 0 }}>

              Our final design analysis proves the viability of the system with these recorded metrics.

            </p>

          </motion.div>



          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto" style={{ marginBottom: '96px' }}>

            {[

              { value: '70%',   prefix: '',   label: 'COD Removal',            description: 'Highly efficient reduction of Chemical Oxygen Demand, purifying the treated water.',           accent: GM.greenText,  delay: 0.1 },

              { value: '15%',   prefix: '',   label: 'Coulombic Efficiency',   description: 'Successfully capturing electron transfer from bacterial metabolism to generate usable power.', accent: GM.yellowText, delay: 0.2 },

              { value: '43.1%', prefix: '−',  label: 'Permeability Reduction', description: 'Maintaining excellent flow dynamics and membrane integrity within the system.',                accent: GM.greenDeep,  delay: 0.3 },

            ].map(({ delay, ...card }) => (

              <motion.div key={card.label} {...fadeUp(delay)}>

                <MetricCard {...card} />

              </motion.div>

            ))}

          </div>



          {/* Objectives */}

          <motion.div style={{ maxWidth: '560px', margin: '0 auto 48px', textAlign: 'center' }} {...fadeUp()}>

            <SectionBadge>Goals</SectionBadge>

            <h2 style={{

              fontFamily: GM.font, fontSize: 'clamp(24px, 3vw, 38px)',

              fontWeight: 700, letterSpacing: '-0.03em',

              color: GM.text, margin: '18px 0 14px', lineHeight: 1.12,

            }}>

              What We Set Out to Achieve

            </h2>

            <p style={{ fontFamily: GM.font, fontSize: '15px', color: GM.textMuted, lineHeight: 1.7, margin: 0 }}>

              Our prototype was built to prove that wastewater can become a valuable,

              monitorable resource.

            </p>

          </motion.div>



          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">

            {[

              { icon: <Droplets style={{ width: 18, height: 18 }} />, accentColor: GM.greenText,  iconBg: GM.greenIconBg,     title: 'EOR Readiness',                  description: 'Filtering water to meet the strict chemical standards required for Enhanced Oil Recovery injection.',              delay: 0.1 },

              { icon: <Zap      style={{ width: 18, height: 18 }} />, accentColor: GM.yellowText, iconBg: GM.yellowIconBg,    title: 'Self-Sustaining Sensor Networks', description: "Generating enough power from the wastewater itself to run the system's own monitoring sensors.",              delay: 0.2 },

              { icon: <Wifi     style={{ width: 18, height: 18 }} />, accentColor: GM.greenDeep,  iconBg: GM.greenDeepIconBg, title: 'Live Digital Twinning',           description: 'Providing continuous real-time digital monitoring and simulation of the physical hardware state.',             delay: 0.3 },

            ].map(({ delay, ...card }) => (

              <motion.div key={card.title} {...fadeUp(delay)}>

                <ObjectiveCard {...card} />

              </motion.div>

            ))}

          </div>



        </div>

      </section>



      <Divider />



      {/* ── Team ────────────────────────────────────────────────────────── */}

      <section

        id="team"

        style={{

          padding: '120px 32px',

          background: `linear-gradient(180deg, transparent 0%, ${GM.yellowDim} 50%, transparent 100%)`,

        }}

      >

        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>



          <motion.div style={{ maxWidth: '560px', margin: '0 auto 64px', textAlign: 'center' }} {...fadeUp()}>

            <SectionBadge>The People</SectionBadge>

            <h2 style={{

              fontFamily: GM.font, fontSize: 'clamp(30px, 3.5vw, 48px)',

              fontWeight: 700, letterSpacing: '-0.03em',

              color: GM.text, margin: '18px 0 16px', lineHeight: 1.1,

            }}>

              Meet the Team

            </h2>

            <p style={{ fontFamily: GM.font, fontSize: '16px', color: GM.textMuted, lineHeight: 1.7, margin: 0 }}>

              Six engineers across Chemical, Petroleum, Electrical, and Software Engineering

              disciplines — united to build a smarter, greener future for water treatment.

            </p>

          </motion.div>



          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">

            {MEMBERS.map((m, i) => <MemberCard key={m.name} member={m} delay={i * 0.07} />)}

          </div>



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



        </div>

      </section>



      <Divider />



      {/* ── Footer ──────────────────────────────────────────────────────── */}

      <footer style={{ padding: '40px 32px' }}>

        <div style={{

          maxWidth: '1280px', margin: '0 auto',

          display: 'flex', flexWrap: 'wrap',

          alignItems: 'center', justifyContent: 'space-between', gap: '16px',

        }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>

            <div style={{

              width: 26, height: 26, borderRadius: '7px',

              background: GM.greenDim, border: `1px solid ${GM.greenBorder}`,

              display: 'flex', alignItems: 'center', justifyContent: 'center',

            }}>

              <Zap style={{ width: 12, height: 12, color: GM.greenText }} />

            </div>

            <span style={{ fontFamily: GM.font, fontWeight: 700, fontSize: '14px', color: GM.text }}>

              MFC System

            </span>

          </div>

          <p style={{ fontFamily: GM.font, fontSize: '12px', color: GM.textMuted, textAlign: 'center', margin: 0 }}>

            KFUPM · 252 Senior Project · Team F22

          </p>

          <Link to={appLink} style={{ ...S.btnOutline, padding: '9px 20px', fontSize: '13px' }}>

            {appLinkText}

            <ArrowRight style={{ width: 14, height: 14 }} />

          </Link>

        </div>

      </footer>



    </div>

  );

}