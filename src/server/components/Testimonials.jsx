import { useState, useEffect, useRef } from 'react';

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

const TESTIMONIALS = [
  {
    name: 'Arjun Mehta',
    role: 'Founder, RetailEdge',
    text: 'ZenithLogic Solutions delivered our e-commerce platform in 6 weeks flat. Sales conversions went up 40% in the first month. Genuinely the best tech partner we have worked with.'
  },
  {
    name: 'Priya Nair',
    role: 'Marketing Head, SpiceRoute Foods',
    text: 'Our Google Ads ROAS went from 1.8x to 4.2x after ZenithLogic Solutions took over the campaigns. They actually understand performance marketing, not just design.'
  },
  {
    name: 'Karthik Sundaram',
    role: 'CEO, LogiTrack',
    text: 'The Android app they built handles 500+ daily active drivers without a hiccup. Clean code, great documentation, and they were available at every step.'
  },
  {
    name: 'Deepa Krishnan',
    role: 'Owner, Studio Bloom',
    text: 'I needed a portfolio that felt like me, not a template. ZenithLogic Solutions nailed the brief on the first revision. My inquiry rate doubled within two weeks.'
  }
];


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

export default function Testimonials({ accent, T }) {
  const [active, setActive] = useState(0);
  const tiltRef = useTilt(4);

  useEffect(() => {
    const t = setInterval(() => setActive((i) => (i + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const t = TESTIMONIALS[active];

  return (
    <div style={{ position: 'relative' }}>
      {/* Testimonial Card */}
      <div
        ref={tiltRef}
        style={{
          background: T.cardBg,
          border: `1px solid ${T.border}`,
          borderRadius: '20px',
          padding: '40px',
          minHeight: '180px',
          transition: `border-color 0.4s ${EASE}, box-shadow 0.4s ${EASE}, transform 0.2s ${EASE}`,
          borderTopColor: `${accent}40`,
          willChange: 'transform'
        }}
      >
        <div style={{ fontSize: '2rem', color: accent, lineHeight: 1, marginBottom: '16px', fontFamily: 'Georgia,serif', opacity: 0.6 }}>
          "
        </div>
        
        <p style={{ color: T.textMuted, lineHeight: 1.75, fontSize: '1rem', margin: '0 0 24px', fontStyle: 'italic' }}>
          {t.text}
        </p>
        
        {/* User Info Strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: `${accent}22`,
              border: `1px solid ${accent}40`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: accent,
              fontFamily: '"Space Grotesk",sans-serif',
              flexShrink: 0
            }}
          >
            {t.name.split(' ').map((w) => w[0]).join('')}
          </div>
          
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: T.text }}>
              {t.name}
            </div>
            <div style={{ fontSize: '0.78rem', color: T.textFaint }}>
              {t.role}
            </div>
          </div>
        </div>
      </div>

      {/* Pagination Dots */}
      <div style={{ display: 'flex', gap: '7px', marginTop: '16px', justifyContent: 'center' }}>
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            style={{
              width: i === active ? 22 : 7,
              height: '7px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              background: i === active ? accent : T.border,
              transition: `all 0.35s ${EASE}`,
              padding: 0
            }}
          />
        ))}
      </div>
    </div>
  );
}