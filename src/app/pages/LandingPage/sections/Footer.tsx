import { Link }     from 'react-router-dom';
import { Zap, ArrowRight } from 'lucide-react';
import { GM, S }   from '../constants';

interface Props {
  appLink:     string;
  appLinkText: string;
}

export function Footer({ appLink, appLinkText }: Props) {
  return (
    <footer style={{ padding: '40px 32px' }}>
      <div style={{
        maxWidth:        '1280px',
        margin:          '0 auto',
        display:         'flex',
        flexWrap:        'wrap',
        alignItems:      'center',
        justifyContent:  'space-between',
        gap:             '16px',
      }}>
        <FooterLogo />

        <p style={{ fontFamily: GM.font, fontSize: '12px', color: GM.textMuted, textAlign: 'center', margin: 0 }}>
          KFUPM · 252 Senior Project · Team F22
        </p>

        <Link to={appLink} style={{ ...S.btnOutline, padding: '9px 20px', fontSize: '13px' }}>
          {appLinkText}
          <ArrowRight style={{ width: 14, height: 14 }} />
        </Link>
      </div>
    </footer>
  );
}

function FooterLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
      <div style={{
        width:          26,
        height:         26,
        borderRadius:   '7px',
        background:     GM.greenDim,
        border:         `1px solid ${GM.greenBorder}`,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
      }}>
        <Zap style={{ width: 12, height: 12, color: GM.greenText }} />
      </div>
      <span style={{ fontFamily: GM.font, fontWeight: 700, fontSize: '14px', color: GM.text }}>
        MFC System
      </span>
    </div>
  );
}
