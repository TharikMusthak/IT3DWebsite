import { useState, useEffect, useRef } from 'react';

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

const PROJECTS = [
  {
    title: 'RetailEdge Platform',
    tags: ['E-commerce', 'React', 'Node.js'],
    desc: 'Full-stack storefront with real-time inventory and Razorpay checkout.',
    color: '#00ffcc'
  },
  {
    title: 'LogiTrack Driver App',
    tags: ['Android', 'Maps API', 'Firebase'],
    desc: 'Fleet tracking app for 500+ daily active drivers across Tamil Nadu.',
    color: '#007fff'
  },
  {
    title: 'Studio Bloom Portfolio',
    tags: ['Static', 'Framer', 'SEO'],
    desc: 'Award-winning portfolio site — 2s load, 98 Lighthouse score.',
    color: '#bf5aff'
  },
  {
    title: 'SpiceRoute Marketing',
    tags: ['Google Ads', 'Meta', 'SEO'],
    desc: 'Managed campaigns delivering 4.2× ROAS for a D2C food brand.',
    color: '#ff007f'
  }
];

// App.jsx-ல் இருக்கும் useTilt ஹூக்-ஐ இந்த ஃபைலிலும் பயன்படுத்த இங்கே சேர்த்துள்ளேன்
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

// GSAPReveal உங்க மெயின் App.jsx-ல் குளோபலாக இருக்கலாம், அல்லது விடுபட்டிருந்தால் எரர் வராமல் இருக்க இந்த எளிய Reveal லாஜிக் உதவும்
function GSAPReveal({ children, delay, type }) {
  return (
    <div
      style={{
        animation: `wsFadeUp 0.8s ${EASE} ${delay}ms both`,
        height: '100%'
      }}
    >
      {children}
    </div>
  );
}

function ProjectCard({ p, delay, T }) {
  const [hovered, setHovered] = useState(false);
  const tiltRef = useTilt(6);

  return (
    <GSAPReveal type="image" delay={delay}>
      <div
        ref={tiltRef}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: T.cardBg,
          border: `1px solid ${hovered ? p.color + '55' : T.border}`,
          borderRadius: '16px',
          padding: '26px',
          cursor: 'default',
          transition: `border-color 0.35s ${EASE}, box-shadow 0.35s ${EASE}, transform 0.2s ${EASE}`,
          boxShadow: hovered ? `0 16px 40px rgba(0,0,0,0.15)` : 'none',
          willChange: 'transform',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box'
        }}
      >
        {/* Status Dot */}
        <div
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: p.color,
            marginBottom: '16px',
            boxShadow: `0 0 12px ${p.color}80`
          }}
        />
        
        {/* Project Title */}
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px', fontFamily: '"Space Grotesk",sans-serif', color: T.text }}>
          {p.title}
        </h3>
        
        {/* Project Description */}
        <p style={{ color: T.textMuted, fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '14px', flexGrow: 1 }}>
          {p.desc}
        </p>
        
        {/* Project Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {p.tags.map((tag) => (
            <span
              key={tag}
              style={{
                padding: '3px 10px',
                borderRadius: '20px',
                fontSize: '0.72rem',
                fontWeight: 500,
                background: `${p.color}12`,
                border: `1px solid ${p.color}30`,
                color: p.color,
                fontFamily: '"JetBrains Mono",monospace'
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </GSAPReveal>
  );
}

export default function Portfolio({ T }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '16px',
        alignItems: 'stretch'
      }}
    >
      {PROJECTS.map((p, i) => (
        <ProjectCard key={p.title} p={p} delay={i * 80} T={T} />
      ))}
    </div>
  );
}