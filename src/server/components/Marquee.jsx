import React from 'react';
import { 
  SiReact, 
  SiNodedotjs, 
  SiFigma, 
  SiPython,
  SiTailwindcss, 
  SiThreedotjs, 
  SiJavascript,
  SiPhp,
  SiMysql,
  SiFirebase 
} from 'react-icons/si';

const STACKS = [
  { name: 'React', icon: <SiReact /> },
  { name: 'Node.js', icon: <SiNodedotjs /> },
  { name: 'Figma', icon: <SiFigma /> }, // இங்கும் SiAmazonAws
  { name: 'Python', icon: <SiPython /> },
   { name: 'Mysql', icon: <SiMysql /> },
  { name: 'Php', icon: <SiPhp /> },
  { name: 'Javascript', icon: <SiJavascript /> },
  { name: 'Tailwind', icon: <SiTailwindcss /> },
  { name: 'Three.js', icon: <SiThreedotjs /> },
  { name: 'Firebase', icon: <SiFirebase /> },
];
export default function Marquee({ T }) {
  // ... மற்ற கோட் அப்படியே இருக்கட்டும் ...
  return (
    <div style={{ padding: '30px 0', overflow: 'hidden', background: T.surface, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-inner {
          display: flex;
          width: fit-content;
          animation: scroll 25s linear infinite;
        }
      `}</style>
      <div className="marquee-inner">
        {[...STACKS, ...STACKS].map((tech, i) => (
          <div key={i} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            padding: '0 40px', 
            fontSize: '1.4rem', 
            fontWeight: 600, 
            color: T.textMuted, 
            opacity: 0.7 
          }}>
            <span style={{ fontSize: '1.6rem' }}>{tech.icon}</span>
            <span style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: '1rem' }}>{tech.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}