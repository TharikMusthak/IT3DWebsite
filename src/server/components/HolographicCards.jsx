/* ══════════════════════════════════════════════
    ✦ FLOATING HOLOGRAPHIC CARDS
    ══════════════════════════════════════════════ */
    import { useState, useRef, useEffect } from 'react';
    const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
export default function HolographicCards({ accent, T }) {
  const cards = [
    { icon:'⚡', title:'Speed',   value:'98/100', sub:'Lighthouse score', color:'#00ffcc' },
    { icon:'📈', title:'ROAS',   value:'4.2×',   sub:'avg. return',      color:'#007fff' },
    { icon:'🚀', title:'Deploy', value:'6 wks',  sub:'avg. delivery',    color:'#bf5aff' },
    { icon:'🔒', title:'Uptime', value:'99.9%',  sub:'guaranteed SLA',   color:'#ff007f' },
  ];
  return (
    <>
      {cards.map((card, i) => (
        <HoloCard key={card.title} card={card} i={i} T={T} accent={accent} />
      ))}
    </>
  );
}

function HoloCard({ card, i, T, accent }) {
  const ref = useRef(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;

      el.style.transform = `
        perspective(600px)
        rotateY(${px * 22}deg)
        rotateX(${-py * 18}deg)
        translateY(-8px)
        scale(1.04)
      `;

      el.style.setProperty('--mx', `${(px + 0.5) * 100}%`);
      el.style.setProperty('--my', `${(py + 0.5) * 100}%`);
    };

    const onLeave = () => {
      el.style.transform =
        'perspective(600px) rotateY(0deg) rotateX(0deg) translateY(0px) scale(1)';
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);

    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: T.isDark
          ? 'rgba(255,255,255,0.04)'
          : 'rgba(255,255,255,0.7)',

        border: `1px solid ${
          hovered ? card.color + '80' : T.border
        }`,

        borderRadius: '16px',
        padding: '22px',

        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        gap: '8px',

        cursor: 'default',
        transition: `border-color 0.3s, box-shadow 0.3s, transform 0.2s ${EASE}`,

        boxShadow: hovered
          ? `0 20px 50px ${card.color}25, inset 0 0 30px ${card.color}06`
          : 'none',

        willChange: 'transform',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '210px'
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '16px',
          pointerEvents: 'none',
          opacity: hovered ? 0.18 : 0,
          background: `radial-gradient(circle at var(--mx,50%) var(--my,50%), ${card.color}60 0%, transparent 65%)`,
          transition: 'opacity 0.3s'
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: `linear-gradient(90deg,transparent,${card.color},transparent)`,
          opacity: hovered ? 0.7 : 0,
          transition: 'opacity 0.3s',
          animation: hovered
            ? 'scanLine 1.5s ease-in-out infinite'
            : 'none'
        }}
      />

      <style>
        {`
          @keyframes scanLine {
            0% { top:0; }
            100% { top:100%; }
          }
        `}
      </style>

      <div
        style={{
          fontSize: '1.8rem',
          marginBottom: '4px'
        }}
      >
        {card.icon}
      </div>

      <div
        style={{
          fontSize: '0.75rem',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          color: T.textFaint,
          fontFamily: '"JetBrains Mono", monospace'
        }}
      >
        {card.title}
      </div>

      <div
        style={{
          fontSize: '1.9rem',
          fontWeight: 800,
          fontFamily: '"Space Grotesk", sans-serif',
          color: card.color,
          lineHeight: 1
        }}
      >
        {card.value}
      </div>

      <div
        style={{
          fontSize: '0.78rem',
          color: T.textMuted,
          fontFamily: '"JetBrains Mono", monospace'
        }}
      >
        {card.sub}
      </div>
    </div>
  );
}