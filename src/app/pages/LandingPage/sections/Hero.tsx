import { Link }                    from 'react-router-dom';
import { motion }                  from 'motion/react';
import { ArrowRight }              from 'lucide-react';
import { MFC3DScene }              from '@/app/components/MFC3DScene';
import { GM, S }                   from '../constants';
import { SectionBadge }            from '../components/SectionBadge';

interface Props {
  appLink:     string;
  appLinkText: string;
}

export function Hero({ appLink, appLinkText }: Props) {
  return (
    <section style={{
      position:   'relative',
      minHeight:  '100vh',
      paddingTop: '60px',
      display:    'flex',
      alignItems: 'center',
      overflow:   'hidden',
    }}>
      <DotGridBackground />
      <GlowOrbs />

      <div className="relative w-full max-w-[1280px] mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-[45fr_55fr] gap-12 items-center">
        <HeroText appLink={appLink} appLinkText={appLinkText} />
        <Hero3DModel />
      </div>
    </section>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DotGridBackground() {
  return (
    <div style={{
      position:        'absolute',
      inset:           0,
      pointerEvents:   'none',
      backgroundImage: `radial-gradient(circle, ${GM.greenBorder} 1px, transparent 1px)`,
      backgroundSize:  '30px 30px',
    }} />
  );
}

function GlowOrbs() {
  return (
    <>
      <motion.div
        style={{
          position:     'absolute',
          top:          '18%',
          left:         '8%',
          width:        440,
          height:       440,
          borderRadius: '50%',
          background:   'radial-gradient(circle, rgba(142,164,104,0.14), transparent 70%)',
          pointerEvents:'none',
          filter:       'blur(10px)',
        }}
        animate={{ opacity: [0.45, 0.75, 0.45], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        style={{
          position:     'absolute',
          bottom:       '12%',
          right:        '4%',
          width:        360,
          height:       360,
          borderRadius: '50%',
          background:   'radial-gradient(circle, rgba(246,244,212,0.09), transparent 70%)',
          pointerEvents:'none',
          filter:       'blur(10px)',
        }}
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.12, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
    </>
  );
}

function HeroText({ appLink, appLinkText }: Props) {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        style={{ marginBottom: '28px' }}
      >
        <SectionBadge>KFUPM · 252 Senior Project · Team F22</SectionBadge>
      </motion.div>

      <motion.h1
        style={{
          fontFamily:    GM.font,
          fontSize:      'clamp(44px, 5.5vw, 72px)',
          fontWeight:    800,
          letterSpacing: '-0.04em',
          lineHeight:    1.06,
          color:         GM.text,
          margin:        0,
        }}
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.18, ease: [0.22, 0.61, 0.36, 1] }}
      >
        Powering the Future,
        <br />
        <span style={{
          background:             `linear-gradient(135deg, ${GM.gradientStart} 0%, ${GM.gradientEnd} 100%)`,
          WebkitBackgroundClip:   'text',
          WebkitTextFillColor:    'transparent',
          backgroundClip:         'text',
        }}>
          One Drop at a Time.
        </span>
      </motion.h1>

      <motion.p
        style={{
          fontFamily: GM.font,
          fontSize:   '17px',
          color:      GM.textMuted,
          lineHeight: 1.65,
          maxWidth:   '420px',
          margin:     '22px 0 0',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.32 }}
      >
        An intelligent bio-electrochemical system that treats wastewater
        while generating its own sustainable electricity.
      </motion.p>

      <MfcInfoCard />
      <HeroCTAs appLink={appLink} appLinkText={appLinkText} />
    </div>
  );
}

function MfcInfoCard() {
  return (
    <motion.div
      style={{ ...S.glass, marginTop: '28px', padding: '22px 24px', maxWidth: '440px' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.46 }}
    >
      <p style={{
        fontFamily:    GM.font,
        fontSize:      '11px',
        fontWeight:    600,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color:         GM.textMuted,
        margin:        '0 0 10px',
      }}>
        What is a Microbial Fuel Cell?
      </p>
      <p style={{ fontFamily: GM.font, fontSize: '14px', color: GM.textMuted, lineHeight: 1.7, margin: 0 }}>
        At its core, an MFC is a{' '}
        <span style={{ color: GM.text, fontWeight: 500 }}>living battery</span>.
        It harnesses bacterial metabolism to break down organic matter in wastewater,
        releasing electrons captured as an electrical current — simultaneously{' '}
        <span style={{ color: GM.text, fontWeight: 500 }}>cleaning the water</span>{' '}
        and producing{' '}
        <span style={{ color: GM.greenText, fontWeight: 500 }}>green energy</span>.
      </p>
    </motion.div>
  );
}

function HeroCTAs({ appLink, appLinkText }: Props) {
  return (
    <motion.div
      style={{ marginTop: '32px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
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
  );
}

function Hero3DModel() {
  return (
    <motion.div
      style={{ position: 'relative' }}
      initial={{ opacity: 0, x: 36 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.75, delay: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {/* Glow halo */}
      <div style={{
        position:     'absolute',
        inset:        '-32px',
        borderRadius: '40px',
        pointerEvents:'none',
        background:   'radial-gradient(ellipse at center, rgba(142,164,104,0.10) 0%, transparent 65%)',
      }} />

      {/* Canvas */}
      <div style={{
        position:     'relative',
        height:       'clamp(400px, calc(100vh - 100px), 680px)',
        borderRadius: GM.radiusCard,
        overflow:     'hidden',
      }}>
        <MFC3DScene />
      </div>

      <p style={{
        textAlign:   'center',
        fontSize:    '11px',
        color:       GM.textMuted,
        marginTop:   '10px',
        letterSpacing:'0.02em',
        userSelect:  'none',
      }}>
        Fig. 1 — Interactive 3D MFC model · Drag to rotate
      </p>
    </motion.div>
  );
}
