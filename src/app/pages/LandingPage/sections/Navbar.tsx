import { Link }        from 'react-router-dom';
import { motion }      from 'motion/react';
import { Zap, ArrowRight } from 'lucide-react';
import { ThemeToggle } from '@/app/components/ThemeToggle';
import { GM, S }       from '../constants';

const NAV_LINKS = [
  { href: '#problem',    label: 'Problem'  },
  { href: '#solution',   label: 'Solution' },
  { href: '#objectives', label: 'Results'  },
  { href: '#team',       label: 'Team'     },
] as const;

interface Props {
  appLink:     string;
  appLinkText: string;
}

export function Navbar({ appLink, appLinkText }: Props) {
  return (
    <motion.nav
      style={{
        position:             'fixed',
        top:                  0,
        left:                 0,
        right:                0,
        zIndex:               50,
        height:               '60px',
        background:           GM.navBg,
        backdropFilter:       'blur(22px)',
        WebkitBackdropFilter: 'blur(22px)',
        borderBottom:         `1px solid ${GM.glassBorder}`,
        display:              'flex',
        alignItems:           'center',
      }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div style={{
        maxWidth:        '1280px',
        width:           '100%',
        margin:          '0 auto',
        padding:         '0 32px',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'space-between',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <div style={{
            width:          30,
            height:         30,
            borderRadius:   '8px',
            background:     GM.greenDim,
            border:         `1px solid ${GM.greenBorder}`,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
          }}>
            <Zap style={{ width: 14, height: 14, color: GM.greenText }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: '15px', letterSpacing: '-0.02em', color: GM.text }}>
            MFC System
          </span>
        </div>

        {/* Links + Theme toggle + CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {NAV_LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="hidden sm:inline-flex"
              style={{
                borderRadius:   GM.radiusPill,
                padding:        '7px 14px',
                fontSize:       '13px',
                fontWeight:     500,
                color:          GM.textMuted,
                textDecoration: 'none',
                transition:     `color 0.2s ${GM.ease}`,
                fontFamily:     GM.font,
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
  );
}
