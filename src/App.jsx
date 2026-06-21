import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import WelcomeScreen from './server/components/WelcomeScreen';
import Globe3D from './server/components/Globe3D';
import AIBrain3D from './server/components/AIBrain3D';
import HolographicCards from './server/components/HolographicCards';
import Estimator from './server/components/Estimator';
import ContactForm from './server/components/ContactForm';
import Testimonials from './server/components/Testimonials';
import Portfolio from './server/components/Portfolio';
import loadThree from './server/utils/loadThree';
import './App.css';
import LocationSection from './server/components/LocationSection';
import Logo3D from './server/components/Logo3D';
import getTheme from './server/utils/theme';
import ThemeToggle from './server/components/ThemeToggle';
import NetworkVisual, { TOPOLOGIES } from './server/components/NetworkVisual';
import { FloatingCodeSnippets, TypingHeadline } from './server/components/HeroElements';
import Services from './server/components/Services';
import StatsRow from './server/components/StatsRow';

const FONTS = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap';
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
const ACCENTS = ['#00ffcc', '#ff007f', '#007fff', '#bf5aff', '#00ffcc'];
const NODE_COUNT = 16;

/* ── Original components preserved ── */

function Reveal({ children, delay = 0, style = {} }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.65s ${EASE} ${delay}ms, transform 0.65s ${EASE} ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function useMagnetic(strength = 0.3) {
  const ref = useRef(null);
  
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return;
    
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * strength;
      const y = (e.clientY - r.top - r.height / 2) * strength;
      el.style.transform = `translate(${x}px, ${y}px)`;
    };
    
    const onLeave = () => {
      el.style.transform = 'translate(0,0)';
    };
    
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [strength]);
  
  return ref;
}

function MagneticButton({ children, onClick, style, className, strength = 0.25 }) {
  const ref = useMagnetic(strength);
  return (
    <button
      ref={ref}
      className={className}
      onClick={onClick}
      style={{
        ...style,
        transition: `${style?.transition ? style.transition + ',' : ''}transform 0.15s ${EASE}`,
        willChange: 'transform',
      }}
    >
      {children}
    </button>
  );
}

function useTilt(max = 8) {
  const ref = useRef(null);
  
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return;
    
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = (0.5 - py) * max * 2;
      const ry = (px - 0.5) * max * 2;
      el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
    };
    
    const onLeave = () => {
      el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    };
    
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [max]);
  
  return ref;
}

function CursorGlow({ accent }) {
  const ref = useRef(null);
  const [enabled] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (window.matchMedia('(pointer: coarse)').matches) return false;
    return true;
  });

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    let raf = null;
    
    const onMove = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        if (el) el.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
        raf = null;
      });
    };
    
    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 420,
        height: 420,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${accent}12, transparent 70%)`,
        pointerEvents: 'none',
        zIndex: 1,
        mixBlendMode: 'plus-lighter',
        transition: 'background 0.6s ease',
        willChange: 'transform',
      }}
    />
  );
}

function useGSAP() {
  const [ready, setReady] = useState(() => typeof window !== 'undefined' && !!window.gsap && !!window.ScrollTrigger);
  
  useEffect(() => {
    if (ready) return;
    if (typeof window === 'undefined') return;
    
    if (window.gsap && window.ScrollTrigger) {
      setTimeout(() => setReady(true), 0);
      return;
    }
    
    let core, plugin;
    const loadPlugin = () => {
      plugin = document.createElement('script');
      plugin.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js';
      plugin.onload = () => {
        if (window.gsap && window.ScrollTrigger) {
          window.gsap.registerPlugin(window.ScrollTrigger);
          setReady(true);
        }
      };
      document.head.appendChild(plugin);
    };
    
    if (window.gsap) {
      loadPlugin();
    } else {
      core = document.createElement('script');
      core.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';
      core.onload = loadPlugin;
      document.head.appendChild(core);
    }
  }, [ready]);
  
  return ready;
}

function GSAPReveal({ children, type = 'fade', delay = 0, className, style = {} }) {
  const wrapRef = useRef(null);
  const innerRef = useRef(null);
  const ready = useGSAP();
  
  useEffect(() => {
    if (!ready) return;
    const gsap = window.gsap;
    const wrap = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap) return;
    
    const ctx = gsap.context(() => {
      if (type === 'text' && inner) {
        gsap.set(inner, { yPercent: 100, opacity: 0 });
        gsap.to(inner, {
          yPercent: 0,
          opacity: 1,
          duration: 1,
          ease: 'power4.out',
          delay: delay / 1000,
          scrollTrigger: { trigger: wrap, start: 'top 88%', toggleActions: 'play none none reverse' },
        });
      } else if (type === 'image') {
        gsap.set(wrap, { clipPath: 'inset(14% 14% 14% 14% round 20px)', scale: 1.08, opacity: 0 });
        gsap.to(wrap, {
          clipPath: 'inset(0% 0% 0% 0% round 20px)',
          scale: 1,
          opacity: 1,
          duration: 1.15,
          ease: 'power3.out',
          delay: delay / 1000,
          scrollTrigger: { trigger: wrap, start: 'top 88%', toggleActions: 'play none none reverse' },
        });
      } else {
        gsap.set(wrap, { y: 36, opacity: 0 });
        gsap.to(wrap, {
          y: 0,
          opacity: 1,
          duration: 0.85,
          ease: 'power3.out',
          delay: delay / 1000,
          scrollTrigger: { trigger: wrap, start: 'top 92%', toggleActions: 'play none none reverse' },
        });
      }
    });
    
    return () => ctx.revert();
  }, [ready, type, delay]);

  if (type === 'text') {
    return (
      <div ref={wrapRef} className={className} style={{ overflow: 'hidden', ...style }}>
        <div ref={innerRef}>{children}</div>
      </div>
    );
  }
  
  return (
    <div ref={wrapRef} className={className} style={style}>
      {children}
    </div>
  );
}

function useParallax(speed = 0.15) {
  const ref = useRef(null);
  const ready = useGSAP();
  
  useEffect(() => {
    if (!ready || !ref.current) return;
    const gsap = window.gsap;
    const ctx = gsap.context(() => {
      gsap.to(ref.current, {
        yPercent: speed * 100,
        ease: 'none',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });
    return () => ctx.revert();
  }, [ready, speed]);
  
  return ref;
}

function BackToTop({ visible, accent }) {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      style={{
        position: 'fixed',
        bottom: 20,
        left: 20,
        zIndex: 90,
        width: 42,
        height: 42,
        borderRadius: '50%',
        border: `1px solid ${accent}50`,
        background: 'rgba(7,8,15,0.85)',
        backdropFilter: 'blur(8px)',
        cursor: 'pointer',
        color: accent,
        fontSize: '1.1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.7)',
        transition: `all 0.35s ${EASE}`,
        pointerEvents: visible ? 'auto' : 'none',
      }}
      aria-label="Back to top"
    >
      ↑
    </button>
  );
}

function CookieBanner({ accent, onAccept, T }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        background: T.cookieBg,
        backdropFilter: 'blur(16px)',
        borderTop: `1px solid ${T.cookieBorder}`,
        padding: '16px 7%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        flexWrap: 'wrap',
      }}
    >
      <p style={{ color: T.textMuted, fontSize: '0.85rem', margin: 0, lineHeight: 1.6, maxWidth: '620px' }}>
        We use cookies to improve your experience and measure ad performance. No data is sold.{' '}
        <span style={{ color: T.textVeryFaint }}>By continuing you accept this.</span>
      </p>
      <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
        <button
          onClick={onAccept}
          style={{
            background: T.btnDeclineBg,
            border: `1px solid ${T.btnDeclineBorder}`,
            color: T.btnDeclineColor,
            padding: '8px 18px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.82rem',
            fontFamily: '"Inter",sans-serif',
          }}
        >
          Decline
        </button>
        <button
          onClick={onAccept}
          style={{
            background: accent,
            color: '#07080f',
            border: 'none',
            padding: '8px 18px',
            borderRadius: '8px',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.82rem',
            fontFamily: '"Inter",sans-serif',
            transition: `background 0.4s ${EASE}`,
          }}
        >
          Accept
        </button>
      </div>
    </div>
  );
}

/* ── Main app ── */
export default function App() {
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const [formSuccess, setFormSuccess] = useState(false);
  const [showCookie, setShowCookie] = useState(true);
  const [activeNav, setActiveNav] = useState('');
  const [showEstimator, setShowEstimator] = useState(false);
  const [prefillSvc, setPrefillSvc] = useState('');
  const [pageEntered, setPageEntered] = useState(false);

  const T = useMemo(() => getTheme(theme), [theme]);
  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), []);
  const showBackToTop = scrollPct > 0.15;
  const heroBgParallax = useParallax(0.25);
  const globeParallax = useParallax(-0.15);

  useEffect(() => {
    const t = setTimeout(() => setPageEntered(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let rafId;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        setScrollPct(max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0);
        
        const sections = ['services', 'work', 'vision', 'location', 'contact'];
        for (let i = sections.length - 1; i >= 0; i--) {
          const el = document.getElementById(sections[i]);
          if (el && el.getBoundingClientRect().top <= 120) {
            setActiveNav(sections[i]);
            break;
          }
          if (i === 0) setActiveNav('');
        }
      });
    };
    
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const stageIdx = Math.min(Math.floor(scrollPct * (TOPOLOGIES.length - 1)), TOPOLOGIES.length - 1);
  const accent = ACCENTS[stageIdx];
  const scrollTo = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  }, []);
  
  const handleInquire = (svcLabel) => {
    setPrefillSvc(svcLabel);
    setShowEstimator(false);
    scrollTo('contact');
  };
  
  const navLinks = ['Services', 'Work', 'Vision', 'Location', 'Contact'];

  // ✦ Welcome Screen Loading Logic - Fixed safely below accent declaration
  // ✦ Welcome Screen Loading Logic
  if (loading) {
    return <WelcomeScreen onDone={() => setLoading(false)} accent={accent || '#00ffcc'} />;
  }

  return (
    <>
      {/* ── 1. FIXED ELEMENTS (இது ஸ்க்ரோல் ஆகாமல் ஸ்க்ரீனில் அப்படியே ஒட்டி இருக்கும்) ── */}
      <CursorGlow accent={accent} />

      {/* Topology tag */}
      <div
        className="topo-tag"
        style={{ position: 'fixed', bottom: 25, right: 90, zIndex: 90, display: 'flex', alignItems: 'center', gap: 7, background: T.navBg, backdropFilter: 'blur(8px)', padding: '5px 13px', borderRadius: 999, border: `1px solid ${T.navBorder}`, fontFamily: '"JetBrains Mono",monospace', fontSize: '0.68rem', color: T.textMuted }}
      >
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: accent, transition: 'background 0.6s ease', flexShrink: 0 }} />
        {TOPOLOGIES[stageIdx]?.label}
      </div>

      {/* WhatsApp FAB */}
      <button
        onClick={() => window.open('https://wa.me/918111056064?text=Hi%20ZenithLogic%2C%20I%27d%20like%20to%20discuss%20a%20project', '_blank')}
        aria-label="Chat on WhatsApp"
        style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, width: '56px', height: '56px', borderRadius: '50%', border: 'none', background: '#25d366', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(37,211,102,0.4)', transition: 'all 0.3s ease' }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        <svg viewBox="0 0 24 24" width="30" height="30" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
        </svg>
      </button>

      <BackToTop visible={showBackToTop} accent={accent} />
      {showCookie && <CookieBanner accent={accent} onAccept={() => setShowCookie(false)} T={T} />}

      {/* ── 2. SCROLLING MAIN CONTENT (மெயின் பேஜ் கன்டென்ட்) ── */}
      <div
        style={{
          width: '100%',
          maxWidth: '100vw',
          minHeight: '100vh',
          backgroundColor: T.bg,
          backgroundImage: T.bgGradients,
          color: T.text,
          fontFamily: '"Inter",sans-serif',
          margin: 0,
          padding: 0,
          overflowX: 'hidden',
          opacity: pageEntered ? 1 : 0,
          transform: pageEntered ? 'translateY(0)' : 'translateY(12px)',
          transition: `opacity 0.7s ${EASE}, transform 0.7s ${EASE}, background-color 0.4s ${EASE}, color 0.4s ${EASE}`,
        }}
      >
        {/* Network BG */}
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, opacity: T.networkOpacity, pointerEvents: 'none', transition: 'opacity 0.5s ease' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: 'min(860px,110vw)', height: 'min(860px,110vh)', transform: 'translate(-50%,-50%)' }}>
            <NetworkVisual progress={scrollPct} accent={accent} />
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* ── Header ── */}
          <header style={{ position: 'sticky', top: 0, zIndex: 100, padding: '12px 7%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: T.navBg, backdropFilter: 'blur(18px)', borderBottom: `1px solid ${T.navBorder}`, transition: `background 0.4s ${EASE}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Logo3D accent={accent} size="normal" />
              <div style={{ fontFamily: '"Space Grotesk",sans-serif', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '1px', color: T.text }}>
                ZenithLogic<span style={{ color: accent, transition: 'color 0.5s ease' }}>Solutions</span>
              </div>
            </div>
            <nav className="nav-desktop" style={{ display: 'flex', gap: '36px' }}>
              {navLinks.map((lbl) => (
                <a key={lbl} className={`nav-link${activeNav === lbl.toLowerCase() ? ' active' : ''}`} style={{ color: T.textMuted }} onClick={() => scrollTo(lbl.toLowerCase())}>
                  {lbl}
                </a>
              ))}
            </nav>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ThemeToggle theme={theme} onToggle={toggleTheme} accent={accent} />
              <button className="btn cta-btn" onClick={() => scrollTo('contact')} style={{ background: accent, color: '#07080f', padding: '10px 22px', fontSize: '0.85rem', borderRadius: '10px', transition: `background 0.5s ease` }}>
                Start a project
              </button>
            </div>
            <button className="hamburger" onClick={() => setMenuOpen((v) => !v)} style={{ display: 'none', flexDirection: 'column', gap: '5px', background: 'transparent', border: `1px solid ${T.borderHover}`, borderRadius: '8px', padding: '9px', cursor: 'pointer' }}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{ width: 18, height: 2, background: T.text, display: 'block' }} />
              ))}
            </button>
          </header>

          {menuOpen && (
            <div style={{ position: 'fixed', top: 69, left: 0, right: 0, zIndex: 99, background: T.navBg, backdropFilter: 'blur(20px)', padding: '24px 7%', display: 'flex', flexDirection: 'column', gap: '18px', borderBottom: `1px solid ${T.navBorder}` }}>
              {navLinks.map((lbl) => (
                <a key={lbl} onClick={() => scrollTo(lbl.toLowerCase())} style={{ color: T.textMuted, textDecoration: 'none', fontSize: '1.05rem', fontWeight: 500, cursor: 'pointer' }}>
                  {lbl}
                </a>
              ))}
              <button className="btn" onClick={() => scrollTo('contact')} style={{ background: accent, color: '#07080f', padding: '13px', borderRadius: '10px', marginTop: 4 }}>
                Start a project
              </button>
            </div>
          )}

          {/* ── Hero ── */}
          <section style={{ padding: '100px 7% 80px', minHeight: '86vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
            <div ref={heroBgParallax} style={{ position: 'absolute', inset: 0, willChange: 'transform' }}>
              <FloatingCodeSnippets accent={accent} />
            </div>

            <div style={{ maxWidth: '780px', position: 'relative', zIndex: 2 }}>
              <GSAPReveal type="text" delay={0}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '22px' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: accent, boxShadow: `0 0 10px ${accent}`, transition: 'background 0.5s ease' }} />
                  <span style={{ color: accent, fontSize: '0.75rem', fontWeight: 600, letterSpacing: '2.5px', textTransform: 'uppercase', fontFamily: '"JetBrains Mono",monospace', transition: 'color 0.5s ease' }}>
                    Web development · Coimbatore
                  </span>
                </div>
              </GSAPReveal>
              <GSAPReveal type="text" delay={120}>
                <h1 className="hero-head" style={{ fontSize: 'clamp(2.6rem,5.5vw,4.4rem)', lineHeight: 1.08, marginBottom: '26px', fontWeight: 800, color: T.text }}>
                  Build a web presence<br />
                  <TypingHeadline accent={accent} />
                </h1>
              </GSAPReveal>
              <GSAPReveal type="text" delay={240}>
                <p style={{ fontSize: '1.1rem', color: T.textMuted, lineHeight: 1.75, maxWidth: '530px', marginBottom: '44px' }}>
                  We design and build websites, apps, and marketing systems that grow businesses — from a single landing page to a full digital operation.
                </p>
              </GSAPReveal>
              <GSAPReveal type="fade" delay={360}>
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                  <MagneticButton className="btn" onClick={() => scrollTo('contact')} style={{ backgroundImage: `linear-gradient(120deg,${accent},#007fff)`, color: '#07080f', padding: '16px 34px', fontSize: '0.95rem' }}>
                    Let's talk →
                  </MagneticButton>
                  <MagneticButton className="btn" onClick={() => { setShowEstimator(true); scrollTo('estimator'); }} style={{ background: 'transparent', color: T.text, border: `1px solid ${T.borderHover}`, padding: '16px 34px', fontSize: '0.95rem' }}>
                    Estimate cost
                  </MagneticButton>
                </div>
              </GSAPReveal>
            </div>

            {/* 3D Globe */}
            <div ref={globeParallax} className="ai-orb" style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'auto', zIndex: 1, willChange: 'transform' }}>
              <Globe3D accent={accent} />
            </div>
          </section>

          {/* ── Holographic Stats Strip ── */}
          <section style={{ padding: '0 7% 60px' }}>
            <GSAPReveal type="image">
              <div style={{ ...T.glass, borderRadius: '24px', padding: '32px' }}>
                <p style={{ color: accent, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: '20px', fontFamily: '"JetBrains Mono",monospace', transition: 'color 0.5s' }}>
                  Live metrics
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                  <HolographicCards accent={accent} T={T} />
                </div>
              </div>
            </GSAPReveal>
          </section>

          {/* ── Neural Network + AI Brain ── */}
          <section style={{ padding: '0 7% 60px' }}>
            <GSAPReveal type="image">
              <div style={{ ...T.glass, borderRadius: '24px', padding: '32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'center' }} className="neural-layout">
                <div>
                  <p style={{ color: accent, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: '10px', fontFamily: '"JetBrains Mono",monospace', transition: 'color 0.5s' }}>
                    Architecture
                  </p>
                  <h2 style={{ fontSize: 'clamp(1.3rem,2.5vw,1.9rem)', marginBottom: '12px', lineHeight: 1.2, color: T.text }}>Built for the digital future.</h2>
                  <p style={{ color: T.textMuted, fontSize: '0.93rem', lineHeight: 1.7 }}>
                    Our technology ecosystem combines innovative design, intelligent systems, and scalable infrastructure to deliver secure, high-performance solutions for businesses worldwide.
                  </p>
                </div>
                <div style={{ height: '200px', borderRadius: '16px', overflow: 'hidden', background: T.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)', border: `1px solid ${T.border}` }}>
                  <AIBrain3D accent={accent} />
                </div>
              </div>
            </GSAPReveal>
          </section>

          {/* Stats */}
          <StatsRow accent={accent} T={T} />
          
          {/* Services */}
          <Services accent={accent} T={T} />
          
          {/* Estimator */}
          <section id="estimator" style={{ padding: '0 7% 80px' }}>
            <GSAPReveal type="image">
              <div style={{ ...T.glass, borderRadius: '24px', overflow: 'hidden' }}>
                <button
                  onClick={() => setShowEstimator((v) => !v)}
                  style={{ width: '100%', padding: '22px 32px', background: 'transparent', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', color: T.text, fontFamily: '"Space Grotesk",sans-serif' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span style={{ fontSize: '1.2rem' }}>🧮</span>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: T.text }}>Project cost estimator</div>
                      <div style={{ fontSize: '0.82rem', color: T.textMuted, marginTop: '2px' }}>Get a ballpark figure in 30 seconds</div>
                    </div>
                  </div>
                  <span style={{ color: accent, fontSize: '1.2rem', transform: showEstimator ? 'rotate(180deg)' : 'rotate(0)', transition: `transform 0.3s ${EASE}` }}>▾</span>
                </button>
                {showEstimator && (
                  <div style={{ padding: '0 32px 32px', borderTop: `1px solid ${T.border}` }}>
                    <div style={{ paddingTop: '24px' }}>
                      <Estimator accent={accent} onInquire={handleInquire} T={T} />
                    </div>
                  </div>
                )}
              </div>
            </GSAPReveal>
          </section>

          {/* Portfolio */}
          <section id="work" style={{ padding: '0 7% 80px' }}>
            <GSAPReveal type="text">
              <div style={{ marginBottom: '36px' }}>
                <p style={{ color: accent, fontSize: '0.75rem', fontWeight: 600, letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: '12px', fontFamily: '"JetBrains Mono",monospace', transition: 'color 0.5s ease' }}>Work</p>
                <h2 style={{ fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', lineHeight: 1.2, color: T.text }}>Recent projects.</h2>
              </div>
            </GSAPReveal>
            <Portfolio T={T} />
          </section>

          {/* Marketing callout */}
          <section style={{ padding: '0 7% 80px' }}>
            <GSAPReveal type="image">
              <div style={{ ...T.glass, padding: '56px 6%', borderRadius: '24px', overflow: 'hidden', position: 'relative', textAlign: 'center' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: `linear-gradient(90deg,transparent,${accent}60,transparent)` }} />
                <div style={{ display: 'inline-block', border: `1px solid ${accent}50`, color: accent, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '3px', padding: '5px 16px', borderRadius: 999, marginBottom: '22px', fontFamily: '"JetBrains Mono",monospace' }}>Marketing</div>
                <h2 style={{ fontSize: 'clamp(1.7rem,4vw,2.9rem)', marginBottom: '18px', lineHeight: 1.15, color: T.text }}>More leads. Less guesswork.</h2>
                <p style={{ color: T.textMuted, fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto 36px', lineHeight: 1.75 }}>We run Google and Meta ad campaigns grounded in data — tracking every click, call, and form fill back to a real conversion.</p>
                <MagneticButton className="btn" onClick={() => scrollTo('contact')} style={{ backgroundImage: `linear-gradient(120deg,${accent},#007fff)`, color: '#07080f', padding: '15px 36px', fontSize: '0.95rem' }}>
                  Get a marketing audit →
                </MagneticButton>
              </div>
            </GSAPReveal>
          </section>

          {/* Testimonials */}
          <section style={{ padding: '0 7% 80px' }}>
            <GSAPReveal type="text">
              <div style={{ marginBottom: '32px' }}>
                <p style={{ color: accent, fontSize: '0.75rem', fontWeight: 600, letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: '12px', fontFamily: '"JetBrains Mono",monospace', transition: 'color 0.5s ease' }}>Client stories</p>
                <h2 style={{ fontSize: 'clamp(1.8rem,3.5vw,2.6rem)', lineHeight: 1.2, color: T.text }}>What clients say.</h2>
              </div>
            </GSAPReveal>
            <GSAPReveal type="image" delay={100}>
              <Testimonials accent={accent} T={T} />
            </GSAPReveal>
          </section>

          {/* Vision */}
          <section id="vision" style={{ padding: '0 7% 80px' }}>
            <GSAPReveal type="image">
              <div style={{ ...T.glass, padding: '52px 6%', textAlign: 'center', borderRadius: '24px' }}>
                <h2 style={{ fontSize: 'clamp(1.6rem,3.5vw,2.5rem)', marginBottom: '22px', color: T.text }}>
                  What we're <span style={{ color: accent, transition: 'color 0.5s' }}>building toward</span>
                </h2>
                <p style={{ color: T.textMuted, lineHeight: 1.85, fontSize: '1.05rem', maxWidth: '720px', margin: '0 auto', fontStyle: 'italic' }}>
                  "Our vision at ZenithLogic Solutions is to be a leading force in shaping the future of digital experiences — a world where businesses of every size can thrive online, propelled by thoughtful technology and creative work built to last."
                </p>
              </div>
            </GSAPReveal>
          </section>

          {/* Contact */}
          <section id="contact" style={{ padding: '60px 7% 80px' }}>
            <div className="contact-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: '60px', alignItems: 'start' }}>
              <GSAPReveal type="text">
                <div>
                  <p style={{ color: accent, fontSize: '0.75rem', fontWeight: 600, letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: '14px', fontFamily: '"JetBrains Mono",monospace' }}>Contact</p>
                  <h2 style={{ fontSize: 'clamp(1.8rem,3.5vw,2.7rem)', marginBottom: '18px', lineHeight: 1.15, color: T.text }}>
                    Let's build something<br />
                    <span style={{ color: accent }}>worth showing.</span>
                  </h2>
                  <p style={{ color: T.textMuted, lineHeight: 1.75, marginBottom: '44px', fontSize: '1rem' }}>
                    Tell us about your project and we'll get back to you within a business day with a clear plan and a fair quote.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                    {[
                      { icon: '📞', meta: 'Call us', value: '+91 81110 056064' },
                      { icon: '✉️', meta: 'Email us', value: 'info@zenithlogicsolutions.com', href: 'mailto:info@zenithlogicsolutions.com' }
                    ].map(({ icon, meta, value, href }) => (
                      <div key={meta} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div className="contact-icon" style={{ background: T.surface, border: `1px solid ${T.border}` }}>{icon}</div>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: T.textGhost, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>{meta}</div>
                          <a href={href} style={{ color: T.text, textDecoration: 'none', fontWeight: 600, fontSize: '1rem' }} onMouseEnter={(e) => (e.target.style.color = accent)} onMouseLeave={(e) => (e.target.style.color = T.text)}>
                            {value}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </GSAPReveal>
              <GSAPReveal type="image" delay={150}>
                <div style={{ ...T.glass, padding: '40px', boxShadow: '0 24px 60px rgba(0,0,0,0.15)' }}>
                  {formSuccess ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>✅</div>
                      <h3 style={{ fontSize: '1.3rem', marginBottom: '10px', color: '#00ffcc' }}>Message sent!</h3>
                      <p style={{ color: T.textMuted, lineHeight: 1.7 }}>We'll review your project and get back to you within one business day.</p>
                      <button onClick={() => setFormSuccess(false)} style={{ marginTop: '24px', background: 'transparent', border: `1px solid ${T.borderHover}`, color: T.textFaint, padding: '10px 20px', borderRadius: '9px', cursor: 'pointer', fontSize: '0.85rem', fontFamily: '"Inter",sans-serif' }}>
                        Send another
                      </button>
                    </div>
                  ) : (
                    <ContactForm accent={accent} onSuccess={() => setFormSuccess(true)} prefillService={prefillSvc} T={T} />
                  )}
                </div>
              </GSAPReveal>
            </div>
          </section>

          <LocationSection accent={accent} T={T} EASE={EASE} />

          {/* Footer */}
          <footer style={{ padding: '28px 7%', borderTop: `1px solid ${T.footerBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Logo3D accent={accent} size="normal" />
              <span style={{ fontFamily: '"Space Grotesk",sans-serif', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '1px', color: T.text }}>
                ZenithLogic<span style={{ color: accent, transition: 'color 0.5s' }}>Solutions</span>
              </span>
            </div>
            <span style={{ color: T.textGhost, fontSize: '0.82rem' }}>
              © {new Date().getFullYear()} ZenithLogic Solutions · Coimbatore, Tamil Nadu
            </span>
          </footer>
        </div>
      </div>
    </>
  );
}