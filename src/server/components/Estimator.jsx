 import { useState, useRef, useEffect } from 'react';
 const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
const EST_SERVICES=[
    {id:'static',label:'Static site / portfolio',base:15000},
    {id:'dynamic',label:'Web app / e-commerce',base:45000},
    {id:'app',label:'Android app',base:60000},
    {id:'uiux',label:'UI/UX design only',base:12000},
    {id:'marketing',label:'Digital marketing',base:8000}];

const EST_SCOPES=[
    {id:'small',label:'Small',mult:1.0},
    {id:'medium',label:'Medium',mult:1.6},
    {id:'large',label:'Large',mult:2.5}];
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
      el.style.transform = `translate(${x}px,${y}px)`;
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
        willChange: 'transform'
      }}
    >
      {children}
    </button>
  );
}




export default function Estimator({ accent, onInquire, T }) {
    const [svc, setSvc] = useState('static');
    const [scope, setScope] = useState('small');
    const [timeline, setTimeline] = useState(4);

    const selected = EST_SERVICES.find(s => s.id === svc);
    const scopeMult = EST_SCOPES.find(s => s.id === scope).mult;
    const rushMult = timeline < 3 ? 1.3 : timeline < 5 ? 1.1 : 1.0;
    const estimate = Math.round((selected.base * scopeMult * rushMult) / 1000) * 1000;

    const fmt = v => '₹' + v.toLocaleString('en-IN');

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                width: '100%'
            }}
        >

            {/* Service Type */}
            <div>
                <div
                    style={{
                        fontSize: '0.72rem',
                        color: T.textFaint,
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginBottom: '10px',
                        fontFamily: '"JetBrains Mono", monospace'
                    }}
                >
                    Service type
                </div>

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                    }}
                >
                    {EST_SERVICES.map(s => (
                        <button
                            key={s.id}
                            onClick={() => setSvc(s.id)}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: '10px',
                                border: `1px solid ${svc === s.id ? accent : T.border}`,
                                background: svc === s.id ? `${accent}12` : 'transparent',
                                color: svc === s.id ? accent : T.textMuted,
                                fontSize: '0.88rem',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: `all 0.2s ${EASE}`,
                                fontFamily: '"Inter", sans-serif'
                            }}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Project Scope */}
            <div>
                <div
                    style={{
                        fontSize: '0.72rem',
                        color: T.textFaint,
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginBottom: '10px',
                        fontFamily: '"JetBrains Mono", monospace'
                    }}
                >
                    Project scope
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '8px',
                        alignItems: 'stretch'
                    }}
                >
                    {EST_SCOPES.map(s => (
                        <button
                            key={s.id}
                            onClick={() => setScope(s.id)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '9px',
                                border: `1px solid ${scope === s.id ? accent : T.border}`,
                                background: scope === s.id ? `${accent}12` : 'transparent',
                                color: scope === s.id ? accent : T.textMuted,
                                fontSize: '0.88rem',
                                cursor: 'pointer',
                                transition: `all 0.2s ${EASE}`,
                                fontFamily: '"Inter", sans-serif'
                            }}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Timeline */}
            <div>
                <div
                    style={{
                        fontSize: '0.72rem',
                        color: T.textFaint,
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginBottom: '10px',
                        fontFamily: '"JetBrains Mono", monospace'
                    }}
                >
                    Timeline — {timeline} weeks {timeline < 3 ? '⚡ rush' : ''}
                </div>

                <input
                    type="range"
                    min="2"
                    max="12"
                    step="1"
                    value={timeline}
                    onChange={e => setTimeline(+e.target.value)}
                    style={{
                        width: '100%',
                        accentColor: accent,
                        cursor: 'pointer'
                    }}
                />

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.75rem',
                        color: T.textFaint,
                        marginTop: '5px',
                        fontFamily: '"JetBrains Mono", monospace'
                    }}
                >
                    <span>2 wk</span>
                    <span>12 wk</span>
                </div>
            </div>

            {/* Estimate Footer */}
            <div
                style={{
                    borderTop: `1px solid ${T.border}`,
                    paddingTop: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px'
                }}
            >
                <div>
                    <div
                        style={{
                            fontSize: '0.72rem',
                            color: T.textFaint,
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            fontFamily: '"JetBrains Mono", monospace',
                            marginBottom: '4px'
                        }}
                    >
                        Estimated range
                    </div>

                    <div
                        style={{
                            fontSize: '1.8rem',
                            fontWeight: 700,
                            fontFamily: '"Space Grotesk", sans-serif',
                            color: accent,
                            letterSpacing: '-0.02em',
                            transition: 'color 0.4s'
                        }}
                    >
                        {fmt(estimate)} – {fmt(Math.round(estimate * 1.3 / 1000) * 1000)}
                    </div>

                    <div
                        style={{
                            fontSize: '0.75rem',
                            color: T.textVeryFaint,
                            marginTop: '3px'
                        }}
                    >
                        indicative · final quote after consultation
                    </div>
                </div>

                <MagneticButton
                    onClick={() => onInquire(selected.label)}
                    strength={0.2}
                    style={{
                        background: accent,
                        color: '#07080f',
                        border: 'none',
                        padding: '12px 22px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        fontFamily: '"Inter", sans-serif',
                        whiteSpace: 'nowrap',
                        transition: `background 0.4s ${EASE}`
                    }}
                >
                    Get exact quote →
                </MagneticButton>
            </div>

        </div>
    );
}