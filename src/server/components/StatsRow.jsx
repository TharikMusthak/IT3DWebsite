import { useState, useEffect, useRef } from 'react';

// ✦ Scroll Reveal Hook
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setVisible(true);
        obs.disconnect();
      }
    }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

// ✦ Number Counting Hook
function useCountUp(target, duration = 1800, started = false) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);
  useEffect(() => {
    if (!started) return;
    const startTime = performance.now();
    const isFloat = target % 1 !== 0;
    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;
      setValue(isFloat ? parseFloat(current.toFixed(1)) : Math.round(current));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, started]);
  return value;
}

function parseStatValue(str) {
  const match = str.match(/^([0-9.]+)([^0-9.]*)$/);
  if (!match) return { num: null, suffix: str, prefix: '' };
  return { num: parseFloat(match[1]), suffix: match[2], prefix: '' };
}

// ✦ Individual Stat Component
function AnimatedStat({ value, label, accent, T }) {
  const [ref, visible] = useReveal(0.3);
  const { num, suffix } = parseStatValue(value);
  const counted = useCountUp(num ?? 0, 1600, visible);
  const display = num !== null ? `${counted}${suffix}` : value;
  
  return (
    <div ref={ref} className="stat-item" style={{ background: T.statBg, border: `1px solid ${T.statBorder}` }}>
      <span style={{ fontSize: '2rem', fontWeight: 700, fontFamily: '"Space Grotesk",sans-serif', color: accent, transition: 'color 0.5s ease', lineHeight: 1, display: 'block', minWidth: '4rem', textAlign: 'center' }}>
        {display}
      </span>
      <span style={{ fontSize: '0.82rem', color: T.statLabel, marginTop: '7px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
        {label}
      </span>
    </div>
  );
}

// ✦ Stats Data
const STATS = [
  { value: '50+', label: 'Projects shipped' },
  { value: '3×', label: 'Average lead lift' },
  { value: '98%', label: 'Client retention' },
  { value: '24h', label: 'Support response' }
];

// ✦ Main Stats Row Component
export default function StatsRow({ accent, T }) {
  return (
    <section style={{ padding: '0 7% 80px' }}>
      <div className="stats-row" style={{ display: 'flex', gap: '16px' }}>
        {STATS.map(({ value, label }) => (
          <AnimatedStat key={label} value={value} label={label} accent={accent} T={T} />
        ))}
      </div>
    </section>
  );
}