import { useState, useEffect } from 'react';

// ✦ Floating Code Snippets Data & Component
const CODE_SNIPPETS = [
  'const zenith = new Agency();', 'npm run build --prod', 'git push origin main',
  'SELECT * FROM clients;', 'return <ZenithLogic />;', 'fetch("/api/contact")',
  'await deploy(project)', '.then(growth => profit)', 'useState(0) → useState(50)',
  'ROAS: 1.8x → 4.2x', 'Lighthouse: 98/100', 'git commit -m "ship it"'
];

const FLOATING_SNIPPETS = CODE_SNIPPETS.map((text, i) => ({
  text,
  x: 5 + Math.random() * 85,
  y: 5 + Math.random() * 88,
  duration: 18 + Math.random() * 14,
  delay: i * 1.3,
  opacity: 0.12 + Math.random() * 0.12,
  scale: 0.7 + Math.random() * 0.5
}));

export function FloatingCodeSnippets({ accent }) {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <style>{`
        @keyframes floatDrift {
          0% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-18px) translateX(8px); }
          50% { transform: translateY(-8px) translateX(-6px); }
          75% { transform: translateY(-22px) translateX(4px); }
          100% { transform: translateY(0px) translateX(0px); }
        }
      `}</style>
      {FLOATING_SNIPPETS.map((s, i) => (
        <div
          key={i}
          style={{
            position: 'absolute', left: `${s.x}%`, top: `${s.y}%`,
            fontFamily: '"JetBrains Mono",monospace', fontSize: `${s.scale * 0.72}rem`,
            color: accent, opacity: s.opacity, whiteSpace: 'nowrap',
            animation: `floatDrift ${s.duration}s ease-in-out ${s.delay}s infinite`,
            transition: 'color 0.5s ease', userSelect: 'none'
          }}
        >
          {s.text}
        </div>
      ))}
    </div>
  );
}

// ✦ Typing Headline Data & Component
const HEADLINES = [
  'worth finding.', 'worth sharing.', 'worth remembering.', 'worth building.'
];

export function TypingHeadline({ accent }) {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const phrase = HEADLINES[phraseIdx];
    if (!deleting && displayed.length < phrase.length) {
      const t = setTimeout(() => setDisplayed(phrase.slice(0, displayed.length + 1)), 80);
      return () => clearTimeout(t);
    } else if (!deleting && displayed.length === phrase.length) {
      const t = setTimeout(() => setDeleting(true), 2200);
      return () => clearTimeout(t);
    } else if (deleting && displayed.length > 0) {
      const t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 40);
      return () => clearTimeout(t);
    } else if (deleting && displayed.length === 0) {
      const t = setTimeout(() => {
        setDeleting(false);
        setPhraseIdx(i => (i + 1) % HEADLINES.length);
      }, 0);
      return () => clearTimeout(t);
    }
  }, [displayed, deleting, phraseIdx]);

  return (
    <span style={{ backgroundImage: `linear-gradient(120deg,${accent} 0%,#007fff 100%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent', display: 'inline-block' }}>
      {displayed}
      <span style={{ opacity: deleting ? 0 : 1, color: accent, WebkitTextFillColor: accent, transition: 'opacity 0.1s' }}>|</span>
    </span>
  );
}