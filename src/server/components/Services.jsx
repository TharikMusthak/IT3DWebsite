import { useRef, useEffect, useState } from 'react';

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

// ✦ Animation Hooks (உங்க App.jsx-ல் இருந்து எடுக்கப்பட்டது)
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
        gsap.to(inner, { yPercent: 0, opacity: 1, duration: 1, ease: 'power4.out', delay: delay / 1000, scrollTrigger: { trigger: wrap, start: 'top 88%', toggleActions: 'play none none reverse' } });
      } else if (type === 'image') {
        gsap.set(wrap, { clipPath: 'inset(14% 14% 14% 14% round 20px)', scale: 1.08, opacity: 0 });
        gsap.to(wrap, { clipPath: 'inset(0% 0% 0% 0% round 20px)', scale: 1, opacity: 1, duration: 1.15, ease: 'power3.out', delay: delay / 1000, scrollTrigger: { trigger: wrap, start: 'top 88%', toggleActions: 'play none none reverse' } });
      } else {
        gsap.set(wrap, { y: 36, opacity: 0 });
        gsap.to(wrap, { y: 0, opacity: 1, duration: 0.85, ease: 'power3.out', delay: delay / 1000, scrollTrigger: { trigger: wrap, start: 'top 92%', toggleActions: 'play none none reverse' } });
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
    <div ref={wrapRef} className={className} style={style}>{children}</div>
  );
}

// ✦ Services Data
const SERVICES = [
  { icon: '⚡', title: 'Dynamic web applications', body: 'Real-time databases, secure user systems, e-commerce flows, and admin dashboards built to handle live transactional load.', span: 2 },
  { icon: '📄', title: 'Portfolios & static sites', body: 'Fast-loading, zero-maintenance sites for professionals and businesses — optimized for SEO and first impressions.' },
  { icon: '🎨', title: 'UI/UX design', body: 'Wireframes to polished interfaces. Figma prototyping, user flow mapping, and minimal layouts designed for retention.' },
  { icon: '📱', title: 'Android app development', body: 'Native and hybrid apps built to scale across device sizes, with smooth API integration and push notification support.' },
  { icon: '📈', title: 'Digital marketing', body: 'Meta and Google ad campaigns, SEO, and lead generation systems built to turn traffic into measurable conversions.' },
  { icon: '💬', title: 'WhatsApp & click-to-call', body: 'Automated messaging channels and one-tap contact pathways that turn web visitors into qualified leads, fast.', span: 3 }
];

// ✦ Service Card Component
function ServiceCard({ icon, title, body, span, delay, T }) {
  const tiltRef = useTilt(5);
  return (
    <GSAPReveal type="image" delay={delay}>
      <div ref={tiltRef} className={`card${span === 2 ? ' span2' : span === 3 ? ' span3' : ''}`} style={{ background: T.cardBg, border: `1px solid ${T.border}`, borderRadius: '20px', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', cursor: 'default', height: '100%', willChange: 'transform' }}>
        <div style={{ fontSize: '2rem', marginBottom: '20px' }}>{icon}</div>
        <div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', fontWeight: 700, color: T.text }}>{title}</h3>
          <p style={{ color: T.textMuted, lineHeight: 1.65, fontSize: '0.93rem', margin: 0 }}>{body}</p>
        </div>
      </div>
    </GSAPReveal>
  );
}

// ✦ Main Services Section Component
export default function Services({ accent, T }) {
  return (
    <section id="services" style={{ padding: '80px 7%' }}>
      <GSAPReveal type="text">
        <div style={{ marginBottom: '44px' }}>
          <p style={{ color: accent, fontSize: '0.75rem', fontWeight: 600, letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: '12px', fontFamily: '"JetBrains Mono",monospace', transition: 'color 0.5s ease' }}>Services</p>
          <h2 style={{ fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', maxWidth: '620px', lineHeight: 1.2, color: T.text }}>Everything you need to compete online.</h2>
        </div>
      </GSAPReveal>
      <div className="bento">
        {SERVICES.map(({ icon, title, body, span }, i) => (
          <ServiceCard key={title} icon={icon} title={title} body={body} span={span} delay={i * 60} T={T} />
        ))}
      </div>
    </section>
  );
}