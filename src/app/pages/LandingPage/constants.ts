import { CSSProperties } from 'react';

// ─── Design Tokens ────────────────────────────────────────────────────────────
// All color values resolve from theme.css CSS variables (--lp-* namespace).
// Only true constants (geometry, motion) are hardcoded here.

export const GM = {
  // Typography
  font: "'Helvetica Neue', Helvetica, Arial, sans-serif",

  // Surfaces (CSS variables — adapt to light/dark theme)
  bg:              'var(--lp-bg)',
  text:            'var(--lp-text)',
  textMuted:       'var(--lp-text-muted)',

  // Green accent
  green:           '#DDE4C3',              // pastel fill only
  greenText:       'var(--lp-green-text)', // text & icon color
  greenDim:        'var(--lp-green-dim)',
  greenBorder:     'var(--lp-green-border)',
  greenDeep:       '#8EA468',              // always readable in both themes
  greenIconBg:     'var(--lp-green-icon-bg)',

  // Yellow accent
  yellow:          '#F6F4D4',              // pastel fill only
  yellowText:      'var(--lp-yellow-text)',
  yellowDim:       'var(--lp-yellow-dim)',
  yellowBorder:    'var(--lp-yellow-border)',
  yellowIconBg:    'var(--lp-yellow-icon-bg)',

  // Combined deep-green icon background
  greenDeepIconBg: 'var(--lp-green-deep-icon-bg)',

  // Glassmorphism
  glassA:      'var(--lp-glass-bg)',
  glassBorder: 'var(--lp-glass-border)',
  glassBlur:   '20px',

  // Navigation
  navBg: 'var(--lp-nav-bg)',

  // Hero gradient text
  gradientStart: 'var(--lp-gradient-start)',
  gradientEnd:   'var(--lp-gradient-end)',

  // Shape
  radiusCard: '24px',
  radiusPill: '100px',

  // Motion easing
  ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// ─── Shared Style Presets ─────────────────────────────────────────────────────

export const S: Record<string, CSSProperties> = {
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
    display:        'inline-flex',
    alignItems:     'center',
    gap:            '8px',
    borderRadius:   GM.radiusPill,
    background:     GM.green,
    color:          '#0C0F09',
    border:         'none',
    fontFamily:     GM.font,
    fontWeight:     600,
    fontSize:       '14px',
    letterSpacing:  '-0.01em',
    cursor:         'pointer',
    padding:        '12px 24px',
    textDecoration: 'none',
    transition:     `all 0.22s ${GM.ease}`,
    whiteSpace:     'nowrap',
  },

  /** Outline pill — transparent bg, green text/border */
  btnOutline: {
    display:        'inline-flex',
    alignItems:     'center',
    gap:            '8px',
    borderRadius:   GM.radiusPill,
    background:     'transparent',
    color:          GM.greenText,
    border:         `1px solid ${GM.glassBorder}`,
    fontFamily:     GM.font,
    fontWeight:     500,
    fontSize:       '14px',
    letterSpacing:  '-0.01em',
    cursor:         'pointer',
    padding:        '12px 24px',
    textDecoration: 'none',
    transition:     `all 0.22s ${GM.ease}`,
    whiteSpace:     'nowrap',
  },
};

// ─── Animation Presets ────────────────────────────────────────────────────────

export const fadeUp = (delay = 0) => ({
  initial:     { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0  },
  viewport:    { once: true, margin: '-60px' },
  transition:  { duration: 0.6, delay, ease: [0.22, 0.61, 0.36, 1] as const },
});

export const fadeIn = (delay = 0) => ({
  initial:     { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport:    { once: true, margin: '-60px' },
  transition:  { duration: 0.55, delay },
});
