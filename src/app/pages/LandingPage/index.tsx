import { useAuth }   from '@/app/contexts/AuthContext';
import { GM }        from './constants';
import { Navbar }    from './sections/Navbar';
import { Hero }      from './sections/Hero';
import { Problem }   from './sections/Problem';
import { Solution }  from './sections/Solution';
import { Results }   from './sections/Results';
import { Team }      from './sections/Team';
import { Footer }    from './sections/Footer';
import { Divider }   from './components/Divider';

export default function LandingPage() {
  const { user } = useAuth();

  const appLink     = user ? '/dashboard' : '/login';
  const appLinkText = user ? 'Go to Dashboard' : 'Launch Dashboard';

  return (
    <div style={{ fontFamily: GM.font, background: GM.bg, color: GM.text, minHeight: '100vh', overflowX: 'hidden' }}>
      <Navbar   appLink={appLink} appLinkText={appLinkText} />
      <Hero     appLink={appLink} appLinkText={appLinkText} />
      <Divider />
      <Problem />
      <Divider />
      <Solution />
      <Divider />
      <Results />
      <Divider />
      <Team />
      <Divider />
      <Footer   appLink={appLink} appLinkText={appLinkText} />
    </div>
  );
}
