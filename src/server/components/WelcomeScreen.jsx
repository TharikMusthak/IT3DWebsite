import { useState, useEffect } from 'react';

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

/* ── Animated logo mark ── */
function LogoMark({ accent }) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="28" stroke={accent} strokeWidth="1.5" opacity="0.25"/>
      <circle cx="32" cy="32" r="28" stroke={accent} strokeWidth="2" strokeDasharray="8 170" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 32 32" to="360 32 32" dur="2.2s" repeatCount="indefinite"/>
      </circle>
      <g>
        <line x1="32" y1="14" x2="32" y2="50" stroke={accent} strokeWidth="1.5" opacity="0.5"/>
        <line x1="14" y1="32" x2="50" y2="32" stroke={accent} strokeWidth="1.5" opacity="0.5"/>
        <circle cx="32" cy="32" r="4" fill={accent}>
          <animate attributeName="r" values="4;6;4" dur="1.6s" repeatCount="indefinite"/>
        </circle>
        <circle cx="32" cy="14" r="2.5" fill={accent} opacity="0.85"/>
        <circle cx="32" cy="50" r="2.5" fill={accent} opacity="0.85"/>
        <circle cx="14" cy="32" r="2.5" fill={accent} opacity="0.85"/>
        <circle cx="50" cy="32" r="2.5" fill={accent} opacity="0.85"/>
      </g>
    </svg>
  );
}

/* ── Welcome / loading screen ── */
export default function WelcomeScreen({ onDone, accent = '#00ffcc', minDuration = 2000 }) { 
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const elapsed = now - start;
      const pct = Math.min(elapsed / minDuration, 1);
      setProgress(1 - Math.pow(1 - pct, 3));
      if (pct < 1) {
        raf = requestAnimationFrame(tick);
      } else {
       
        onDone?.(); 
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [minDuration, onDone]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#07080f',
      backgroundImage: `radial-gradient(ellipse 70% 50% at 50% 30%, ${accent}14, transparent 60%)`,
    }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=JetBrains+Mono:wght@400;500&display=swap"/>
      <style>{`
        @keyframes wsFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes wsPulseGlow {
          0%,100% { opacity: 0.35; }
          50%     { opacity: 0.8; }
        }
        @media(prefers-reduced-motion:reduce){*{animation-duration:0.01ms!important;transition-duration:0.01ms!important;}}
      `}</style>

      <div style={{
        animation: 'wsFadeUp 0.7s ' + EASE + ' both',
        marginBottom: '24px',
      }}>
        <LogoMark accent={accent}/>
      </div>

      <div style={{
        fontFamily: '"Space Grotesk", sans-serif',
        fontSize: 'clamp(1.4rem, 4vw, 2rem)',
        fontWeight: 700,
        letterSpacing: '1.5px',
        color: '#EEF0F8',
        marginBottom: '10px',
        animation: 'wsFadeUp 0.7s ' + EASE + ' 0.1s both',
      }}>
        ZenithLogic<span style={{ color: accent }}>Solutions</span>
      </div>

      <div style={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '0.75rem',
        letterSpacing: '3px',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.35)',
        marginBottom: '40px',
        animation: 'wsFadeUp 0.7s ' + EASE + ' 0.2s both',
      }}>
        Crafting digital experiences
      </div>

      <div style={{
        width: 'min(220px, 60vw)',
        height: '2px',
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '2px',
        overflow: 'hidden',
        animation: 'wsFadeUp 0.7s ' + EASE + ' 0.3s both',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute',
          top: 0, left: 0, bottom: 0,
          width: `${progress * 100}%`,
          background: `linear-gradient(90deg, ${accent}, #007fff)`,
          borderRadius: '2px',
          transition: 'width 0.1s linear',
          boxShadow: `0 0 12px ${accent}80`,
        }}/>
      </div>

      <div style={{
        marginTop: '14px',
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '0.7rem',
        color: 'rgba(255,255,255,0.25)',
        animation: 'wsFadeUp 0.7s ' + EASE + ' 0.4s both, wsPulseGlow 2s ease-in-out infinite',
      }}>
        {Math.round(progress * 100)}%
      </div>
    </div>
  );
}