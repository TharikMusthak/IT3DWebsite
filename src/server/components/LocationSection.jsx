import React, { useRef, useEffect } from 'react';

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

// ✦ Mouse 3D Tilt Hook
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

// ✦ GSAP Reveal Fallback
function GSAPReveal({ children, delay = 0, style = {} }) {
  return (
    <div style={{ animation: `wsFadeUp 0.8s ${EASE} ${delay}ms both`, height: '100%', ...style }}>
      {children}
    </div>
  );
}

// ✦ Main Location Section Component
export default function LocationSection({ accent, T }) {
  const mapTiltRef = useTilt(2);

  return (
    <section id="location" style={{ padding: '60px 7% 80px' }}>
      <GSAPReveal type="text">
        <p style={{ color: accent, fontSize: '0.75rem', fontWeight: 600, letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: '12px', fontFamily: '"JetBrains Mono",monospace', transition: 'color 0.5s ease' }}>
          Location
        </p>
        <h2 style={{ fontSize: 'clamp(1.8rem,3.5vw,2.6rem)', marginBottom: '8px', fontFamily: '"Space Grotesk",sans-serif', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2, color: T.text }}>
          Find us in Coimbatore.
        </h2>
        <p style={{ color: T.textMuted, fontSize: '1rem', marginBottom: '40px', lineHeight: 1.7 }}>
          Drop by the office or reach out — we're always happy to meet in person.
        </p>
      </GSAPReveal>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '28px', alignItems: 'start' }} className="contact-layout">
        
        {/* Office Details */}
        <GSAPReveal type="image">
          <div
            style={{ ...T.glass, padding: '32px', transition: `border-color 0.4s ${EASE},box-shadow 0.4s ${EASE}` }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = `${accent}40`; e.currentTarget.style.boxShadow = `0 0 40px ${accent}0a`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = 'none'; }}
          >
            {[
              { icon: '📍', meta: 'Office address', val: <>42, Avinashi Road,<br />Peelamedu, Coimbatore,<br />Tamil Nadu – 641 004</> },
              { icon: '📞', meta: 'Phone', val: <a href="tel:+918111056064" style={{ color: T.text, textDecoration: 'none', fontWeight: 500 }} onMouseEnter={e => e.target.style.color = accent} onMouseLeave={e => e.target.style.color = T.text}>+91 81110 56064</a> },
              { icon: '✉️', meta: 'Email', val: <a href="mailto:info@zenithlogicsolutions.com" style={{ color: T.text, textDecoration: 'none', fontWeight: 500 }} onMouseEnter={e => e.target.style.color = accent} onMouseLeave={e => e.target.style.color = T.text}>info@zenithlogicsolutions.com</a> }
            ].map(({ icon, meta, val }) => (
              <div key={meta} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '24px' }}>
                <div style={{ width: 42, height: 42, borderRadius: '12px', flexShrink: 0, background: `${accent}0f`, border: `1px solid ${accent}24`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', transition: 'background 0.5s' }}>
                  {icon}
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: T.textGhost, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', fontFamily: '"JetBrains Mono",monospace' }}>{meta}</div>
                  <div style={{ color: T.text, fontSize: '0.95rem', fontWeight: 500, lineHeight: 1.5 }}>{val}</div>
                </div>
              </div>
            ))}

            <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: '22px', marginBottom: '22px' }}>
              <div style={{ fontSize: '0.7rem', color: T.textGhost, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', fontFamily: '"JetBrains Mono",monospace' }}>Business hours</div>
              {[
                ['Monday – Friday', '09:00 – 18:00', true],
                ['Saturday', '10:00 – 14:00', true],
                ['Sunday', 'Closed', false]
              ].map(([day, time, open]) => (
                <div key={day} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: `1px solid ${T.border}`, fontSize: '0.85rem' }}>
                  <span style={{ color: T.textMuted }}>{day}</span>
                  <span style={{ color: open ? accent : T.textGhost, fontFamily: '"JetBrains Mono",monospace', fontSize: '0.78rem', transition: 'color 0.5s' }}>{time}</span>
                </div>
              ))}
            </div>
          </div>
        </GSAPReveal>

        {/* Custom SVG Map */}
        <GSAPReveal type="image" delay={150}>
            <div
              ref={mapTiltRef}
              style={{ 
                background: T.surface, 
                borderWidth: '1px', 
                borderStyle: 'solid', 
                borderColor: T.border, 
                borderRadius: '20px', 
                overflow: 'hidden', 
                position: 'relative', 
                transition: `border-color 0.4s ${EASE},box-shadow 0.4s ${EASE},transform 0.2s ${EASE}`, 
                willChange: 'transform' 
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${accent}50`; e.currentTarget.style.boxShadow = `0 0 60px ${accent}14,inset 0 0 40px ${accent}05`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = 'none'; }}
            >
            <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 10, display: 'inline-flex', alignItems: 'center', gap: 7, background: `${accent}14`, border: `1px solid ${accent}38`, borderRadius: 999, padding: '5px 14px', fontFamily: '"JetBrains Mono",monospace', fontSize: '0.7rem', color: accent }}>
              <span style={{ width: 3, height: 6, borderRadius: '50%', background: accent, display: 'inline-block' }} />
              Coimbatore, TN
            </div>
            
            <svg viewBox="0 0 480 360" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '350px', display: 'block' }}>
              <rect width="480" height="300" fill={T.mapBg} />
              <g stroke={T.mapGridStroke} strokeWidth="1">
                {[40, 80, 120, 160, 200, 240, 280, 320].map(y => <line key={`h${y}`} x1="0" y1={y} x2="480" y2={y} />)}
                {[48, 96, 144, 192, 240, 288, 336, 384, 432].map(x => <line key={`v${x}`} x1={x} y1="0" x2={x} y2="360" />)}
              </g>
              <line x1="0" y1="220" x2="480" y2="140" stroke={T.mapRoadMain} strokeWidth="5" />
              <line x1="0" y1="220" x2="480" y2="140" stroke={T.mapRoadMainGlow} strokeWidth="9" />
              <line x1="200" y1="0" x2="200" y2="360" stroke={T.mapRoadSec} strokeWidth="3.5" />
              <line x1="200" y1="0" x2="200" y2="360" stroke={T.mapRoadSecGlow} strokeWidth="7" />
              <line x1="0" y1="180" x2="480" y2="180" stroke={T.mapRoadMin} strokeWidth="2" />
              <line x1="300" y1="0" x2="300" y2="360" stroke={T.mapRoadMin} strokeWidth="2" />
              {[
                [50, 42, 68, 36], [50, 84, 68, 34], [50, 124, 68, 34], [148, 42, 48, 36], [148, 84, 48, 34],
                [204, 42, 82, 36], [204, 84, 82, 34], [304, 42, 76, 36], [304, 84, 76, 34], [390, 42, 80, 76],
                [50, 202, 68, 36], [50, 244, 68, 34], [50, 284, 68, 34], [148, 202, 48, 36], [148, 244, 48, 74],
                [204, 202, 82, 36], [204, 244, 82, 34], [304, 202, 76, 76], [390, 202, 80, 76], [304, 284, 166, 70],
                [204, 284, 82, 70]
              ].map(([x, y, w, h], i) => (
                <rect key={i} x={x} y={y} width={w} height={h} rx="2" fill={T.mapBlock} />
              ))}
              <rect x="204" y="124" width="82" height="54" rx="3" fill={`${accent}08`} stroke={`${accent}20`} strokeWidth="1" />
              <text x="240" y="136" textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize="8" fill={T.mapLabelRoad} transform="rotate(-9.5 240 136)">Avinashi Road</text>
              <text x="210" y="90" fontFamily="JetBrains Mono,monospace" fontSize="7.5" fill={T.mapLabelArea}>Peelamedu</text>
              <defs>
                <radialGradient id="locPinGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={accent} stopOpacity="0.18" />
                  <stop offset="100%" stopColor={accent} stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="245" cy="163" r="44" fill="url(#locPinGlow)" />
              <circle cx="245" cy="163" r="6" fill="none" stroke={accent} strokeWidth="1.5" opacity="0.7">
                <animate attributeName="r" values="6;26" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7;0" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle cx="245" cy="163" r="6" fill="none" stroke={accent} strokeWidth="1" opacity="0.5">
                <animate attributeName="r" values="6;26" dur="3s" begin="1s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0" dur="3s" begin="1s" repeatCount="indefinite" />
              </circle>
              <path d="M245,141 C235,141 229,148 229,155 C229,167 245,185 245,185 C245,185 261,167 261,155 C261,148 255,141 245,141 Z" fill={accent} opacity="0.95" />
              <circle cx="245" cy="155" r="5.5" fill={T.mapPinFill} />
              <g transform="translate(444,32)">
                <circle cx="0" cy="0" r="14" fill={T.mapCompassBg} stroke={T.mapCompassBorder} strokeWidth="0.8" />
                <text x="0" y="-5" textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize="7" fill={accent} fontWeight="bold">N</text>
                <line x1="0" y1="-2" x2="0" y2="3" stroke={T.mapLabelArea} strokeWidth="0.8" />
                <line x1="-3" y1="0" x2="3" y2="0" stroke={T.mapLabelArea} strokeWidth="0.8" />
              </g>
              <g transform="translate(22,340)">
                <line x1="0" y1="0" x2="48" y2="0" stroke={T.mapScaleStroke} strokeWidth="1" />
                <line x1="0" y1="-3" x2="0" y2="3" stroke={T.mapScaleStroke} strokeWidth="1" />
                <line x1="48" y1="-3" x2="48" y2="3" stroke={T.mapScaleStroke} strokeWidth="1" />
                <text x="24" y="-7" textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize="6.5" fill={T.mapScaleLabel}>500 m</text>
              </g>
            </svg>

            <div style={{ position: 'relative', background: T.mapOverlayGrad, padding: '24px 20px 18px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginTop: '-60px' }}>
              <div>
                <div style={{ fontFamily: '"Space Grotesk",sans-serif', fontWeight: 700, fontSize: '1rem', color: T.text, marginBottom: 2 }}>ZenithLogic Solutions</div>
                <div style={{ fontSize: '0.78rem', color: T.mapCoordColor, fontFamily: '"JetBrains Mono",monospace' }}>11.0168° N, 76.9558° E</div>
              </div>
              <a href="https://maps.google.com/?q=11.0168,76.9558" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: accent, color: '#07080f', border: 'none', borderRadius: '10px', padding: '9px 16px', fontSize: '0.8rem', fontWeight: 700, fontFamily: '"Inter",sans-serif', cursor: 'pointer', textDecoration: 'none', transition: `background 0.4s ${EASE}` }} onMouseEnter={e => { e.currentTarget.style.background = '#00e6b8'; }} onMouseLeave={e => { e.currentTarget.style.background = accent; }}>
                ➤ Open in Maps
              </a>
            </div>
          </div>
        </GSAPReveal>

      </div>
    </section>
  );
}