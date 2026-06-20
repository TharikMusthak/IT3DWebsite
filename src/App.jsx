import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import WelcomeScreen from './server/components/WelcomeScreen';

const FONTS = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap';
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
const ACCENTS = ['#00ffcc', '#ff007f', '#007fff', '#bf5aff', '#00ffcc'];
const NODE_COUNT = 16;

/* ══════════════════════════════════════════════
   ✦ SHARED THREE.JS LOADER — fixes duplicate canvas bug
   Only one <script> tag ever gets injected, no matter
   how many 3D components mount at the same time.
   ══════════════════════════════════════════════ */
let _threeLoadPromise = null;
function loadThree() {
  if (window.THREE) return Promise.resolve();
  if (_threeLoadPromise) return _threeLoadPromise;
  _threeLoadPromise = new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    s.onload = resolve;
    document.head.appendChild(s);
  });
  return _threeLoadPromise;
}

/* ── Theme tokens ── */
function getTheme(mode) {
  const dark = mode === 'dark';
  return {
    bg:            dark ? '#07080f' : '#f4f5f9',
    bgSecondary:   dark ? '#0d0f1a' : '#eceef4',
    surface:       dark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.03)',
    border:        dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.09)',
    borderHover:   dark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.18)',
    text:          dark ? '#EEF0F8' : '#0f1117',
    textMuted:     dark ? '#8a9ab8' : '#546180',
    textFaint:     dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)',
    textVeryFaint: dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)',
    textGhost:     dark ? '#4a5568' : '#9baabb',
    navBg:         dark ? 'rgba(7,8,15,0.88)' : 'rgba(244,245,249,0.92)',
    navBorder:     dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)',
    glass: {
      background:        dark ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.55)',
      border:            dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(255,255,255,0.6)',
      borderRadius:      '20px',
      backdropFilter:    'blur(16px) saturate(180%)',
      WebkitBackdropFilter: 'blur(16px) saturate(180%)',
      boxShadow:         dark ? 'none' : '0 8px 32px rgba(31,41,55,0.08)',
    },
    inputBg:       dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)',
    inputBorder:   dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.12)',
    inputColor:    dark ? '#fff' : '#0f1117',
    cardBg:        dark ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.85)',
    statBg:        dark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.8)',
    statBorder:    dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
    statLabel:     dark ? '#64748b' : '#7a8aaa',
    footerBorder:  dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)',
    cookieBg:      dark ? 'rgba(7,8,15,0.97)' : 'rgba(244,245,249,0.98)',
    cookieBorder:  dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)',
    mapBg:         dark ? '#0a0c14' : '#e8ecf3',
    mapGridStroke: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)',
    mapRoadMain:   dark ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.13)',
    mapRoadMainGlow: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
    mapRoadSec:    dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    mapRoadSecGlow: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
    mapRoadMin:    dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
    mapBlock:      dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.04)',
    mapLabelRoad:  dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)',
    mapLabelArea:  dark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.3)',
    mapCompassBg:  dark ? 'rgba(7,8,15,0.7)' : 'rgba(244,245,249,0.85)',
    mapCompassBorder: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)',
    mapScaleStroke: dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)',
    mapScaleLabel: dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)',
    bgGradients: dark
      ? `radial-gradient(ellipse 70% 50% at 10% 0%, rgba(0,255,204,0.07), transparent 55%),
         radial-gradient(ellipse 55% 50% at 95% 40%, rgba(255,0,127,0.04), transparent 55%),
         radial-gradient(ellipse 60% 60% at 50% 100%, rgba(0,127,255,0.05), transparent 55%)`
      : `radial-gradient(ellipse 70% 50% at 10% 0%, rgba(0,200,160,0.06), transparent 55%),
         radial-gradient(ellipse 55% 50% at 95% 40%, rgba(200,0,100,0.03), transparent 55%),
         radial-gradient(ellipse 60% 60% at 50% 100%, rgba(0,100,200,0.04), transparent 55%)`,
    networkOpacity: dark ? 0.38 : 0.18,
    btnDeclineBg:  dark ? 'transparent' : 'rgba(0,0,0,0.04)',
    btnDeclineBorder: dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
    btnDeclineColor:  dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)',
    mapOverlayGrad: dark
      ? 'linear-gradient(0deg,rgba(7,8,15,0.97) 0%,rgba(7,8,15,0.7) 70%,transparent 100%)'
      : 'linear-gradient(0deg,rgba(244,245,249,0.97) 0%,rgba(244,245,249,0.7) 70%,transparent 100%)',
    mapCoordColor: dark ? '#8a9ab8' : '#546180',
    mapPinFill:    dark ? '#07080f' : '#f4f5f9',
    isDark: dark,
  };
}

function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark';
  return (
    <button onClick={onToggle} aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} style={{ width:60,height:32,borderRadius:999,border:'none',background:isDark?'#4f46e5':'#d1d5db',position:'relative',cursor:'pointer',transition:'all 0.3s ease',padding:0 }}>
      <div style={{ width:26,height:26,borderRadius:'50%',background:'#fff',position:'absolute',top:3,left:isDark?31:3,transition:'all 0.3s ease',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px' }}>{isDark?'🌙':'☀️'}</div>
    </button>
  );
}

/* ══════════════════════════════════════════════
   ✦ 3D GLOBE (hero background)
   Uses shared loadThree() — no duplicate script tags
   ══════════════════════════════════════════════ */
function Globe3D({ accent }) {
  const mountRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    let cancelled = false;

    loadThree().then(() => {
      if (cancelled || !el) return;
      if (el.querySelector('canvas')) return;

      const THREE = window.THREE;
      const W = el.offsetWidth, H = el.offsetHeight;

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(W, H);
      renderer.setClearColor(0x000000, 0);
      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
      camera.position.z = 3.2;

      const sphereGeo = new THREE.SphereGeometry(1, 64, 64);
      const sphereMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(accent),
        wireframe: false, transparent: true, opacity: 0.04,
      });
      scene.add(new THREE.Mesh(sphereGeo, sphereMat));

      const lineMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(accent), transparent: true, opacity: 0.18,
      });
      for (let lat = -75; lat <= 75; lat += 15) {
        const pts = [];
        const phi = (lat * Math.PI) / 180;
        for (let lon = 0; lon <= 360; lon += 3) {
          const theta = (lon * Math.PI) / 180;
          pts.push(new THREE.Vector3(
            Math.cos(phi) * Math.cos(theta),
            Math.sin(phi),
            Math.cos(phi) * Math.sin(theta)
          ));
        }
        scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
      }
      for (let lon = 0; lon < 360; lon += 15) {
        const pts = [];
        const theta = (lon * Math.PI) / 180;
        for (let lat = -90; lat <= 90; lat += 3) {
          const phi = (lat * Math.PI) / 180;
          pts.push(new THREE.Vector3(
            Math.cos(phi) * Math.cos(theta),
            Math.sin(phi),
            Math.cos(phi) * Math.sin(theta)
          ));
        }
        scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
      }

      const cities = [
        [13,80],[28,77],[11,76],[19,73],[12,77],[22,88],
        [1,103],[35,139],[51,-0.1],[40,-74],[37,-122],[48,2],
        [-33,151],[-23,-46],[55,37],
      ];
      cities.forEach(([lat, lon]) => {
        const phi = (lat * Math.PI) / 180;
        const theta = (lon * Math.PI) / 180;
        const x = Math.cos(phi) * Math.cos(theta);
        const y = Math.sin(phi);
        const z = Math.cos(phi) * Math.sin(theta);
        const dot = new THREE.Mesh(
          new THREE.SphereGeometry(0.025, 8, 8),
          new THREE.MeshBasicMaterial({ color: new THREE.Color(accent), transparent: true, opacity: 0.85 })
        );
        dot.position.set(x, y, z);
        scene.add(dot);
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(0.03, 0.055, 16),
          new THREE.MeshBasicMaterial({ color: new THREE.Color(accent), side: THREE.DoubleSide, transparent: true, opacity: 0.35 })
        );
        ring.position.set(x, y, z);
        ring.lookAt(0, 0, 0);
        scene.add(ring);
      });

      const arcPairs = [[0,1],[1,2],[3,4],[6,7],[8,9],[10,11],[12,13],[0,8],[5,8],[7,9]];
      arcPairs.forEach(([i, j]) => {
        const c1 = cities[i], c2 = cities[j];
        const pts = [];
        for (let t = 0; t <= 1; t += 0.02) {
          const phi1=(c1[0]*Math.PI)/180, th1=(c1[1]*Math.PI)/180;
          const phi2=(c2[0]*Math.PI)/180, th2=(c2[1]*Math.PI)/180;
          const v1 = new THREE.Vector3(Math.cos(phi1)*Math.cos(th1), Math.sin(phi1), Math.cos(phi1)*Math.sin(th1));
          const v2 = new THREE.Vector3(Math.cos(phi2)*Math.cos(th2), Math.sin(phi2), Math.cos(phi2)*Math.sin(th2));
          const mid = v1.clone().lerp(v2, t).normalize().multiplyScalar(1.12 + 0.1 * Math.sin(t * Math.PI));
          pts.push(mid);
        }
        scene.add(new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(pts),
          new THREE.LineBasicMaterial({ color: new THREE.Color(accent), transparent: true, opacity: 0.22 })
        ));
      });

      const atmMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(accent), transparent: true, opacity: 0.03, side: THREE.FrontSide,
      });
      scene.add(new THREE.Mesh(new THREE.SphereGeometry(1.08, 32, 32), atmMat));

      // ── Quaternion objects — allocated once, reused every frame ──
      const _qX = new THREE.Quaternion();
      const _qY = new THREE.Quaternion();
      const _axisX = new THREE.Vector3(1, 0, 0);
      const _axisY = new THREE.Vector3(0, 1, 0);

      let rotX = 0, rotY = 0;
      let velX = 0, velY = 0;
      let isDragging = false, lastX = 0, lastY = 0;

      const DAMPING         = 0.92;
      const DRAG_SENSITIVITY = 0.005;
      const AUTO_SPEED      = 0.0018; // always-on baseline spin

      const canvas = renderer.domElement;
      canvas.style.cursor = 'grab';

      const onPointerDown = (e) => {
        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        velX = 0;
        velY = 0;
        canvas.style.cursor = 'grabbing';
        e.preventDefault();
      };

      const onPointerMove = (e) => {
        if (!isDragging) return;
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        velY = dx * DRAG_SENSITIVITY;
        velX = dy * DRAG_SENSITIVITY;
        rotY += velY;
        rotX += velX;
        // NO clamp — full 360° in all directions
      };

      const onPointerUp = () => {
        isDragging = false;
        canvas.style.cursor = 'grab';
      };

      canvas.addEventListener('pointerdown',  onPointerDown);
      canvas.addEventListener('pointermove',  onPointerMove);
      canvas.addEventListener('pointerup',    onPointerUp);
      canvas.addEventListener('pointerleave', onPointerUp);
      canvas.addEventListener('dragstart',    (e) => e.preventDefault());

      const animate = () => {
        frameRef.current = requestAnimationFrame(animate);

        if (!isDragging) {
          // Inertia: decay and apply residual velocity
          velX *= DAMPING;
          velY *= DAMPING;
          rotX += velX;
          rotY += velY;
        }

        // Auto-rotation: always runs every frame, drag input adds on top
        rotY += AUTO_SPEED;

        // Quaternion composition — no gimbal lock, full 360° all axes
        _qX.setFromAxisAngle(_axisX, rotX);
        _qY.setFromAxisAngle(_axisY, rotY);
        scene.quaternion.copy(_qY.clone().multiply(_qX));

        renderer.render(scene, camera);
      };
      animate();

      el._updateAccent = (c) => {
        scene.traverse(obj => { if (obj.material) obj.material.color?.set(c); });
      };
      el._cleanup = () => {
        cancelled = true;
        cancelAnimationFrame(frameRef.current);
        canvas.removeEventListener('pointerdown',  onPointerDown);
        canvas.removeEventListener('pointermove',  onPointerMove);
        canvas.removeEventListener('pointerup',    onPointerUp);
        canvas.removeEventListener('pointerleave', onPointerUp);
        renderer.dispose();
        if (el.contains(canvas)) el.removeChild(canvas);
      };
    });

    return () => {
      cancelled = true;
      if (el._cleanup) el._cleanup();
    };
  }, []);

  useEffect(() => {
    if (mountRef.current?._updateAccent) mountRef.current._updateAccent(accent);
  }, [accent]);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'absolute',
        right: '1px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '560px',
        height: '560px',
        opacity: 0.9,
        pointerEvents: 'auto',
      }}
      className="ai-orb"
    />
  );
}

/* ══════════════════════════════════════════════
   ✦ 3D AI BRAIN
   Uses shared loadThree()
   ══════════════════════════════════════════════ */
function AIBrain3D({ accent }) {
  const mountRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    let cancelled = false;

    loadThree().then(() => {
      if (cancelled || !el) return;
      if (el.querySelector('canvas')) return;

      const THREE = window.THREE;
      const W = el.offsetWidth, H = el.offsetHeight;
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(W, H);
      renderer.setClearColor(0x000000, 0);
      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
      camera.position.z = 3.5;

      const mouse = { x: 0, y: 0 };

const handleMouseMove = (e) => {
  const rect = el.getBoundingClientRect();

  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
};

el.addEventListener('mousemove', handleMouseMove);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const handleEnter = () => {
  camera.position.z = 3.0;
};

const handleLeave = () => {
  camera.position.z = 3.5;
};

el.addEventListener('mouseenter', handleEnter);
el.addEventListener('mouseleave', handleLeave);
      const nodeCount = 120;
      const nodes = [];
      const nodeMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(accent), transparent: true, opacity: 0.9 });
      for (let i = 0; i < nodeCount; i++) {
        const lobe = i < nodeCount * 0.5 ? -0.5 : 0.5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const r = 0.4 + Math.random() * 0.55;
        const x = lobe + r * Math.sin(phi) * Math.cos(theta) * 1.3;
        const y = r * Math.sin(phi) * Math.sin(theta) * 0.8;
        const z = r * Math.cos(phi) * 0.7;
        const geo = new THREE.SphereGeometry(0.018 + Math.random() * 0.015, 6, 6);
        const mesh = new THREE.Mesh(geo, nodeMat.clone());
        mesh.position.set(x, y, z);
        mesh.userData = { baseX: x, baseY: y, baseZ: z, phase: Math.random() * Math.PI * 2, speed: 0.3 + Math.random() * 0.7 };
        scene.add(mesh);
        nodes.push(mesh);
      }

      const edgeMat = new THREE.LineBasicMaterial({ color: new THREE.Color(accent), transparent: true, opacity: 0.12 });
      nodes.forEach((n, i) => {
        nodes.slice(i + 1).forEach((m) => {
          const dist = n.position.distanceTo(m.position);
          if (dist < 0.38 && Math.random() > 0.55) {
            const pts = [n.position.clone(), m.position.clone()];
            scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), edgeMat.clone()));
          }
        });
      });

      const pGeo = new THREE.BufferGeometry();
      const pPos = new Float32Array(60 * 3);
      for (let i = 0; i < 60; i++) {
        pPos[i*3] = (Math.random()-0.5)*3.2;
        pPos[i*3+1] = (Math.random()-0.5)*2.4;
        pPos[i*3+2] = (Math.random()-0.5)*1.6;
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      const pMat = new THREE.PointsMaterial({ color: new THREE.Color(accent), size: 0.018, transparent: true, opacity: 0.5 });
      scene.add(new THREE.Points(pGeo, pMat));

      let t = 0;
     const animate = () => {
  frameRef.current = requestAnimationFrame(animate);

  t += 0.012;

  // Mouse follow rotation
  scene.rotation.y += (mouse.x * 0.5 - scene.rotation.y) * 0.05;
  scene.rotation.x += (mouse.y * 0.3 - scene.rotation.x) * 0.05;

  // Raycaster hover detection
  pointer.x = mouse.x;
  pointer.y = mouse.y;

  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObjects(nodes);

  nodes.forEach((n) => {
    const pulse =
      Math.sin(t * n.userData.speed + n.userData.phase) * 0.012;

    n.position.set(
      n.userData.baseX + pulse,
      n.userData.baseY + pulse * 0.5,
      n.userData.baseZ
    );

    const baseScale =
      1 + 0.3 * Math.abs(
        Math.sin(t * n.userData.speed + n.userData.phase)
      );

    n.scale.setScalar(baseScale);
    n.material.opacity = 0.6;
  });

  if (intersects.length > 0) {
    intersects[0].object.material.opacity = 1;
    intersects[0].object.scale.setScalar(2);
  }

  renderer.render(scene, camera);
};

animate();

      el._updateAccent = (c) => { scene.traverse(obj => { if (obj.material) obj.material.color?.set(c); }); };
el._cleanup = () => {
  cancelled = true;

  el.removeEventListener('mousemove', handleMouseMove);

  cancelAnimationFrame(frameRef.current);

  renderer.dispose();

  if (el.contains(renderer.domElement)) {
    el.removeChild(renderer.domElement);
  }

  el.removeEventListener('mouseenter', handleEnter);
el.removeEventListener('mouseleave', handleLeave);
};
    });

    return () => {
      cancelled = true;
      if (el._cleanup) el._cleanup();
    };
  }, []);

  useEffect(() => { if (mountRef.current?._updateAccent) mountRef.current._updateAccent(accent); }, [accent]);

  return <div ref={mountRef} style={{ width:'100%', height:'100%' }} />;
}

/* ══════════════════════════════════════════════
   ✦ FLOATING HOLOGRAPHIC CARDS
   ══════════════════════════════════════════════ */
function HolographicCards({ accent, T }) {
  const cards = [
    { icon:'⚡', title:'Speed',  value:'98/100', sub:'Lighthouse score', color:'#00ffcc' },
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
      el.style.transform = `perspective(600px) rotateY(${px*22}deg) rotateX(${-py*18}deg) translateY(-8px) scale(1.04)`;
      el.style.setProperty('--mx', `${(px+0.5)*100}%`);
      el.style.setProperty('--my', `${(py+0.5)*100}%`);
    };
    const onLeave = () => { el.style.transform = `perspective(600px) rotateY(0deg) rotateX(0deg) translateY(0px) scale(1)`; };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); };
  }, []);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: T.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.7)',
        border: `1px solid ${hovered ? card.color+'80' : T.border}`,
        borderRadius:'16px', padding:'20px', cursor:'default',
        transition:`border-color 0.3s, box-shadow 0.3s, transform 0.2s ${EASE}`,
        boxShadow: hovered ? `0 20px 50px ${card.color}25, inset 0 0 30px ${card.color}06` : 'none',
        willChange:'transform', position:'relative', overflow:'hidden',
      }}
    >
      <div style={{ position:'absolute', inset:0, borderRadius:'16px', pointerEvents:'none', opacity: hovered ? 0.18 : 0, background:`radial-gradient(circle at var(--mx,50%) var(--my,50%), ${card.color}60 0%, transparent 65%)`, transition:'opacity 0.3s' }}/>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:'1px', background:`linear-gradient(90deg,transparent,${card.color},transparent)`, opacity: hovered ? 0.7 : 0, transition:'opacity 0.3s', animation: hovered ? 'scanLine 1.5s ease-in-out infinite' : 'none' }}/>
      <style>{`@keyframes scanLine { 0%{top:0} 100%{top:100%} }`}</style>
      <div style={{ fontSize:'1.5rem', marginBottom:'10px' }}>{card.icon}</div>
      <div style={{ fontSize:'1.6rem', fontWeight:800, fontFamily:'"Space Grotesk",sans-serif', color:card.color, lineHeight:1 }}>{card.value}</div>
      <div style={{ fontSize:'0.78rem', color:T.textMuted, marginTop:'4px', fontFamily:'"JetBrains Mono",monospace' }}>{card.sub}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   ✦ 3D LOGO — FIXED
   Uses shared loadThree() so only ONE script tag is ever
   injected regardless of how many Logo3D instances mount.
   Canvas-guard prevents double-init from React StrictMode.
   ══════════════════════════════════════════════ */
function Logo3D({ accent, size = 'normal', onClick }) {
  const mountRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    let cancelled = false;

    loadThree().then(() => {
      // Both guards are required:
      // 1. cancelled — component unmounted before promise resolved
      // 2. querySelector('canvas') — StrictMode double-invoke / second Logo3D instance
      if (cancelled || !el) return;
      if (el.querySelector('canvas')) return;

      const THREE = window.THREE;
      const W = el.offsetWidth, H = el.offsetHeight;
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(W, H);
      renderer.setClearColor(0x000000, 0);
      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 50);
      camera.position.z = 2.8;

      const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(accent), wireframe: true, transparent: true, opacity: 0.85 });
      const matSolid = new THREE.MeshBasicMaterial({ color: new THREE.Color(accent), transparent: true, opacity: 0.12 });

      // Top bar of Z — wireframe layer
      const topBar = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.22, 0.18), mat);
      topBar.position.set(0, 0.55, 0);
      scene.add(topBar);

      // Top bar of Z — solid fill layer (separate object, correct position)
      const topBarSolid = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.22, 0.18), matSolid);
      topBarSolid.position.set(0, 0.55, 0);
      scene.add(topBarSolid);

      // Diagonal bar of Z
      const diagGroup = new THREE.Group();
      const diag = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.18, 0.18), mat);
      diag.rotation.z = -Math.atan2(1.2, 1.4);
      diagGroup.add(diag);
      scene.add(diagGroup);

      // Bottom bar of Z — wireframe layer
      const botBar = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.22, 0.18), mat);
      botBar.position.set(0, -0.55, 0);
      scene.add(botBar);

      // Bottom bar of Z — solid fill layer
      const botBarSolid = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.22, 0.18), matSolid);
      botBarSolid.position.set(0, -0.55, 0);
      scene.add(botBarSolid);

      // Floating orbit ring
      const ringGeo = new THREE.TorusGeometry(0.85, 0.025, 8, 64);
      const ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(accent), transparent: true, opacity: 0.35 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI * 0.3;
      scene.add(ring);

      // Orbiting dot
      const orbitDot = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(accent) }));
      scene.add(orbitDot);

      let t = 0;
      const animate = () => {
        frameRef.current = requestAnimationFrame(animate);
        t += 0.02;
        scene.rotation.y = Math.sin(t * 0.3) * 0.4;
        ring.rotation.z = t * 0.5;
        orbitDot.position.set(Math.cos(t) * 0.85, Math.sin(t) * 0.85 * Math.sin(Math.PI*0.3), Math.sin(t) * 0.85 * Math.cos(Math.PI*0.3));
        renderer.render(scene, camera);
      };
      animate();

      el._updateAccent = (c) => { scene.traverse(obj => { if (obj.material) obj.material.color?.set(c); }); };
      el._cleanup = () => {
        cancelled = true;
        cancelAnimationFrame(frameRef.current);
        renderer.dispose();
        if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      };
    });

    return () => {
      cancelled = true;
      if (el._cleanup) el._cleanup();
    };
  }, []);

  useEffect(() => { if (mountRef.current?._updateAccent) mountRef.current._updateAccent(accent); }, [accent]);

  const dim = size === 'large' ? 72 : 44;
  return (
    <div ref={mountRef} onClick={onClick} style={{ width:dim, height:dim, cursor:'pointer', flexShrink:0 }} />
  );
}

/* ── Original components preserved ── */
function circlePoints(n, cx, cy, r, startAngle = -Math.PI / 2) {
  return Array.from({ length: n }, (_, i) => {
    const a = startAngle + (i / n) * Math.PI * 2;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  });
}

const meshNodes = [[18,22],[42,14],[68,18],[88,30],[10,48],[34,40],[58,46],[82,52],[16,72],[40,66],[64,74],[86,70],[28,90],[52,86],[74,92],[94,86]];
const meshEdges = [[0,1],[1,2],[2,3],[0,4],[1,5],[2,6],[3,7],[4,5],[5,6],[6,7],[4,8],[5,9],[6,10],[7,11],[8,9],[9,10],[10,11],[8,12],[9,13],[10,14],[11,15],[12,13],[13,14],[14,15],[0,5],[2,5],[5,10],[7,10],[1,6],[3,6],[9,12],[11,14]];
const treeNodes = [[50,8],[22,28],[50,28],[78,28],[10,52],[34,52],[50,52],[66,52],[90,52],[6,78],[18,78],[30,78],[42,78],[58,78],[70,78],[82,78]];
const treeEdges = [[0,1],[0,2],[0,3],[1,4],[1,5],[2,6],[2,7],[3,8],[4,9],[4,10],[5,11],[5,12],[6,13],[7,14],[8,15],[14,15]];
const clusterNodes = [[14,18],[28,14],[22,30],[10,34],[70,16],[86,22],[78,34],[92,36],[38,70],[54,64],[50,82],[66,76],[44,38],[62,40],[30,54],[76,56]];
const clusterEdges = [[0,1],[1,2],[2,3],[3,0],[0,2],[4,5],[5,6],[6,7],[7,4],[4,6],[8,9],[9,10],[10,11],[11,8],[9,11],[2,12],[12,6],[12,13],[13,11]];
const ringOuter = circlePoints(11, 50, 50, 38);
const ringInner = circlePoints(5, 50, 50, 14, -Math.PI / 2 + 0.3);
const ringNodes = [...ringOuter, ...ringInner];
const ringEdges = [...Array.from({length:11},(_,i)=>[i,(i+1)%11]),...Array.from({length:5},(_,i)=>[11+i,11+((i+1)%5)]),[11,0],[12,2],[13,5],[14,7],[15,9]];
const gridNodes = [];
for (let r=0;r<4;r++) for (let c=0;c<4;c++) gridNodes.push([15+c*23.33,15+r*23.33]);
const gridEdges = [];
for (let r=0;r<4;r++) for (let c=0;c<4;c++) { const i=r*4+c; if(c<3) gridEdges.push([i,i+1]); if(r<3) gridEdges.push([i,i+4]); }

const TOPOLOGIES = [
  { name:'mesh',    nodes:meshNodes,    edges:meshEdges,    label:'topology.mesh' },
  { name:'tree',    nodes:treeNodes,    edges:treeEdges,    label:'topology.tree' },
  { name:'cluster', nodes:clusterNodes, edges:clusterEdges, label:'topology.cluster' },
  { name:'ring',    nodes:ringNodes,    edges:ringEdges,    label:'topology.ring' },
  { name:'grid',    nodes:gridNodes,    edges:gridEdges,    label:'topology.grid' },
];

function lerp(a,b,t){return a+(b-a)*t;}
function lerpPt(p1,p2,t){return [lerp(p1[0],p2[0],t),lerp(p1[1],p2[1],t)];}

const CODE_SNIPPETS = ['const zenith = new Agency();','npm run build --prod','git push origin main','SELECT * FROM clients;','return <ZenithLogic />;','fetch("/api/contact")','await deploy(project)','.then(growth => profit)','useState(0) → useState(50)','ROAS: 1.8x → 4.2x','Lighthouse: 98/100','git commit -m "ship it"'];
const FLOATING_SNIPPETS = CODE_SNIPPETS.map((text, i) => ({ text, x:5+Math.random()*85, y:5+Math.random()*88, duration:18+Math.random()*14, delay:i*1.3, opacity:0.12+Math.random()*0.12, scale:0.7+Math.random()*0.5 }));

function FloatingCodeSnippets({ accent }) {
  return (
    <div style={{position:'absolute',inset:0,pointerEvents:'none',overflow:'hidden'}}>
      <style>{`@keyframes floatDrift{0%{transform:translateY(0px) translateX(0px);}25%{transform:translateY(-18px) translateX(8px);}50%{transform:translateY(-8px) translateX(-6px);}75%{transform:translateY(-22px) translateX(4px);}100%{transform:translateY(0px) translateX(0px);}}`}</style>
      {FLOATING_SNIPPETS.map((s,i)=>(
        <div key={i} style={{position:'absolute',left:`${s.x}%`,top:`${s.y}%`,fontFamily:'"JetBrains Mono",monospace',fontSize:`${s.scale*0.72}rem`,color:accent,opacity:s.opacity,whiteSpace:'nowrap',animation:`floatDrift ${s.duration}s ease-in-out ${s.delay}s infinite`,transition:'color 0.5s ease',userSelect:'none'}}>{s.text}</div>
      ))}
    </div>
  );
}

const NEURAL_LAYERS = [{count:4,x:12},{count:6,x:32},{count:6,x:52},{count:4,x:72},{count:2,x:88}];
function buildNeuralNodes(){return NEURAL_LAYERS.map(layer=>{const gap=80/(layer.count+1);return Array.from({length:layer.count},(_,i)=>({x:layer.x,y:10+gap*(i+1)}));});}
const NEURAL_NODES = buildNeuralNodes();
function buildNeuralEdges(){const edges=[];for(let l=0;l<NEURAL_LAYERS.length-1;l++){for(let a=0;a<NEURAL_NODES[l].length;a++){for(let b=0;b<NEURAL_NODES[l+1].length;b++){edges.push({from:NEURAL_NODES[l][a],to:NEURAL_NODES[l+1][b],l,a,b});}}}return edges;}
const NEURAL_EDGES = buildNeuralEdges();

function NeuralNetworkAnimation({ accent }) {
  const [tick, setTick] = useState(0);
  useEffect(()=>{const id=setInterval(()=>setTick(t=>t+1),80);return()=>clearInterval(id);},[]);
  const activeLayer=tick%(NEURAL_LAYERS.length*8);const pulseLayer=Math.floor(activeLayer/8);
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" style={{width:'100%',height:'100%',display:'block'}}>
      {NEURAL_EDGES.map((e,i)=>{const isActive=e.l===pulseLayer;return(<line key={i} x1={e.from.x} y1={e.from.y} x2={e.to.x} y2={e.to.y} stroke={accent} strokeWidth={isActive?'0.3':'0.15'} opacity={isActive?0.55:0.12} style={{transition:'opacity 0.15s,stroke-width 0.15s'}}/>);})}
      {NEURAL_NODES.map((layer,li)=>layer.map((n,ni)=>{const isActive=li===pulseLayer||li===pulseLayer+1;return(<g key={`${li}-${ni}`}><circle cx={n.x} cy={n.y} r={isActive?2.2:1.4} fill={accent} opacity={isActive?0.9:0.3} style={{transition:'all 0.15s'}}/>{isActive&&(<circle cx={n.x} cy={n.y} r="4" fill={accent} opacity="0"><animate attributeName="r" values="2;6" dur="0.6s" fill="freeze"/><animate attributeName="opacity" values="0.4;0" dur="0.6s" fill="freeze"/></circle>)}</g>);}))};
    </svg>
  );
}

function NetworkVisual({ progress, accent }) {
  const count=TOPOLOGIES.length;const scaled=progress*(count-1);const idx=Math.min(Math.floor(scaled),count-2);const t=scaled-idx;const from=TOPOLOGIES[idx],to=TOPOLOGIES[idx+1];
  const [hoveredNode,setHoveredNode]=useState(null);const [clickedNode,setClickedNode]=useState(null);
  const nodes=useMemo(()=>Array.from({length:NODE_COUNT},(_,i)=>lerpPt(from.nodes[i]??[50,50],to.nodes[i]??[50,50],t)),[from,to,t]);
  useEffect(()=>{if(clickedNode!==null){const timer=setTimeout(()=>setClickedNode(null),1200);return()=>clearTimeout(timer);}},[clickedNode]);
  const renderEdges=(topo,opacity,key)=>{if(opacity<=0.01)return null;return topo.edges.map(([a,b],i)=>{if(!nodes[a]||!nodes[b])return null;const[x1,y1]=nodes[a],[x2,y2]=nodes[b];const isConn=clickedNode!==null&&(a===clickedNode||b===clickedNode);return<line key={`${key}-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={accent} strokeWidth={isConn?'0.5':'0.22'} opacity={isConn?opacity*0.9:opacity*0.3} style={{transition:'opacity 0.3s,stroke-width 0.3s'}}/>;});};
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" style={{width:'100%',height:'100%',display:'block'}}>
      <defs><radialGradient id="ng" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor={accent} stopOpacity="0.7"/><stop offset="100%" stopColor={accent} stopOpacity="0"/></radialGradient><radialGradient id="ng-active" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor={accent} stopOpacity="1"/><stop offset="100%" stopColor={accent} stopOpacity="0"/></radialGradient></defs>
      {renderEdges(from,1-t,'f')}{renderEdges(to,t,'t')}
      {nodes.map(([x,y],i)=>{const isH=hoveredNode===i;const isC=clickedNode===i;return(<g key={i} style={{cursor:'pointer'}} onMouseEnter={()=>setHoveredNode(i)} onMouseLeave={()=>setHoveredNode(null)} onClick={()=>setClickedNode(i)}><circle cx={x} cy={y} r={isH||isC?6:3.2} fill={isC?"url(#ng-active)":"url(#ng)"} opacity={isC?0.8:0.45} style={{transition:'r 0.25s,opacity 0.25s'}}/><circle cx={x} cy={y} r={isH?1.6:0.85} fill={i%3===0?accent:'#EEF0F8'} opacity={i%3===0?1:0.7} style={{transition:'r 0.2s'}}>{!isH&&(<animate attributeName="r" values="0.85;1.25;0.85" dur={`${3+(i%3)}s`} repeatCount="indefinite" begin={`${i*0.1}s`}/>)}</circle>{isC&&(<circle cx={x} cy={y} r="2" fill="none" stroke={accent} strokeWidth="0.4"><animate attributeName="r" values="2;10" dur="1.2s" fill="freeze"/><animate attributeName="opacity" values="0.8;0" dur="1.2s" fill="freeze"/></circle>)}</g>);})}
    </svg>
  );
}

const HEADLINES = ['worth finding.','worth sharing.','worth remembering.','worth building.'];
function TypingHeadline({ accent }) {
  const [phraseIdx,setPhraseIdx]=useState(0);const[displayed,setDisplayed]=useState('');const[deleting,setDeleting]=useState(false);
  useEffect(()=>{const phrase=HEADLINES[phraseIdx];if(!deleting&&displayed.length<phrase.length){const t=setTimeout(()=>setDisplayed(phrase.slice(0,displayed.length+1)),80);return()=>clearTimeout(t);}else if(!deleting&&displayed.length===phrase.length){const t=setTimeout(()=>setDeleting(true),2200);return()=>clearTimeout(t);}else if(deleting&&displayed.length>0){const t=setTimeout(()=>setDisplayed(displayed.slice(0,-1)),40);return()=>clearTimeout(t);}else if(deleting&&displayed.length===0){const t=setTimeout(()=>{setDeleting(false);setPhraseIdx(i=>(i+1)%HEADLINES.length);},0);return()=>clearTimeout(t);}},[displayed,deleting,phraseIdx]);
  return (<span style={{backgroundImage:`linear-gradient(120deg,${accent} 0%,#007fff 100%)`,WebkitBackgroundClip:'text',backgroundClip:'text',WebkitTextFillColor:'transparent',color:'transparent',display:'inline-block'}}>{displayed}<span style={{opacity:deleting?0:1,color:accent,WebkitTextFillColor:accent,transition:'opacity 0.1s'}}>|</span></span>);
}

function useReveal(threshold=0.15){const ref=useRef(null);const[visible,setVisible]=useState(false);useEffect(()=>{const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting){setVisible(true);obs.disconnect();}},{threshold});if(ref.current)obs.observe(ref.current);return()=>obs.disconnect();},[threshold]);return[ref,visible];}

function Reveal({children,delay=0,style={}}){const[ref,visible]=useReveal();return(<div ref={ref} style={{opacity:visible?1:0,transform:visible?'translateY(0)':'translateY(28px)',transition:`opacity 0.65s ${EASE} ${delay}ms,transform 0.65s ${EASE} ${delay}ms`,...style}}>{children}</div>);}

function useMagnetic(strength=0.3){const ref=useRef(null);useEffect(()=>{const el=ref.current;if(!el)return;if(typeof window!=='undefined'&&window.matchMedia('(pointer: coarse)').matches)return;const onMove=(e)=>{const r=el.getBoundingClientRect();const x=(e.clientX-r.left-r.width/2)*strength;const y=(e.clientY-r.top-r.height/2)*strength;el.style.transform=`translate(${x}px,${y}px)`;};const onLeave=()=>{el.style.transform='translate(0,0)';};el.addEventListener('mousemove',onMove);el.addEventListener('mouseleave',onLeave);return()=>{el.removeEventListener('mousemove',onMove);el.removeEventListener('mouseleave',onLeave);};},[strength]);return ref;}

function MagneticButton({children,onClick,style,className,strength=0.25}){const ref=useMagnetic(strength);return(<button ref={ref} className={className} onClick={onClick} style={{...style,transition:`${style?.transition?style.transition+',':''}transform 0.15s ${EASE}`,willChange:'transform'}}>{children}</button>);}

function useTilt(max=8){const ref=useRef(null);useEffect(()=>{const el=ref.current;if(!el)return;if(typeof window!=='undefined'&&window.matchMedia('(pointer: coarse)').matches)return;const onMove=(e)=>{const r=el.getBoundingClientRect();const px=(e.clientX-r.left)/r.width;const py=(e.clientY-r.top)/r.height;const rx=(0.5-py)*max*2;const ry=(px-0.5)*max*2;el.style.transform=`perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;};const onLeave=()=>{el.style.transform='perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)';};el.addEventListener('mousemove',onMove);el.addEventListener('mouseleave',onLeave);return()=>{el.removeEventListener('mousemove',onMove);el.removeEventListener('mouseleave',onLeave);};},[max]);return ref;}

function CursorGlow({accent}){const ref=useRef(null);const[enabled]=useState(()=>{if(typeof window==='undefined')return false;if(window.matchMedia('(pointer: coarse)').matches)return false;return true;});useEffect(()=>{if(!enabled)return;const el=ref.current;let raf=null;const onMove=(e)=>{if(raf)return;raf=requestAnimationFrame(()=>{if(el)el.style.transform=`translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`;raf=null;});};window.addEventListener('mousemove',onMove);return()=>{window.removeEventListener('mousemove',onMove);if(raf)cancelAnimationFrame(raf);};},[enabled]);if(!enabled)return null;return(<div ref={ref} aria-hidden="true" style={{position:'fixed',top:0,left:0,width:420,height:420,borderRadius:'50%',background:`radial-gradient(circle,${accent}12,transparent 70%)`,pointerEvents:'none',zIndex:1,mixBlendMode:'plus-lighter',transition:'background 0.6s ease',willChange:'transform'}}/>);}

function useGSAP(){const[ready,setReady]=useState(()=>typeof window!=='undefined'&&!!window.gsap&&!!window.ScrollTrigger);useEffect(()=>{if(ready)return;if(typeof window==='undefined')return;if(window.gsap&&window.ScrollTrigger){setTimeout(()=>{setReady(true);},0);return;}let core,plugin;const loadPlugin=()=>{plugin=document.createElement('script');plugin.src='https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js';plugin.onload=()=>{if(window.gsap&&window.ScrollTrigger){window.gsap.registerPlugin(window.ScrollTrigger);setReady(true);}};document.head.appendChild(plugin);};if(window.gsap){loadPlugin();}else{core=document.createElement('script');core.src='https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';core.onload=loadPlugin;document.head.appendChild(core);}},[ready]);return ready;}

function GSAPReveal({children,type='fade',delay=0,className,style={}}){const wrapRef=useRef(null);const innerRef=useRef(null);const ready=useGSAP();useEffect(()=>{if(!ready)return;const gsap=window.gsap;const wrap=wrapRef.current;const inner=innerRef.current;if(!wrap)return;const ctx=gsap.context(()=>{if(type==='text'&&inner){gsap.set(inner,{yPercent:100,opacity:0});gsap.to(inner,{yPercent:0,opacity:1,duration:1,ease:'power4.out',delay:delay/1000,scrollTrigger:{trigger:wrap,start:'top 88%',toggleActions:'play none none reverse'},});}else if(type==='image'){gsap.set(wrap,{clipPath:'inset(14% 14% 14% 14% round 20px)',scale:1.08,opacity:0});gsap.to(wrap,{clipPath:'inset(0% 0% 0% 0% round 20px)',scale:1,opacity:1,duration:1.15,ease:'power3.out',delay:delay/1000,scrollTrigger:{trigger:wrap,start:'top 88%',toggleActions:'play none none reverse'},});}else{gsap.set(wrap,{y:36,opacity:0});gsap.to(wrap,{y:0,opacity:1,duration:0.85,ease:'power3.out',delay:delay/1000,scrollTrigger:{trigger:wrap,start:'top 92%',toggleActions:'play none none reverse'},});}});return()=>ctx.revert();},[ready,type,delay]);if(type==='text'){return(<div ref={wrapRef} className={className} style={{overflow:'hidden',...style}}><div ref={innerRef}>{children}</div></div>);}return(<div ref={wrapRef} className={className} style={style}>{children}</div>);}

function useParallax(speed=0.15){const ref=useRef(null);const ready=useGSAP();useEffect(()=>{if(!ready||!ref.current)return;const gsap=window.gsap;const ctx=gsap.context(()=>{gsap.to(ref.current,{yPercent:speed*100,ease:'none',scrollTrigger:{trigger:ref.current,start:'top bottom',end:'bottom top',scrub:true,},});});return()=>ctx.revert();},[ready,speed]);return ref;}

function useCountUp(target,duration=1800,started=false){const[value,setValue]=useState(0);const rafRef=useRef(null);useEffect(()=>{if(!started)return;const startTime=performance.now();const isFloat=target%1!==0;const tick=(now)=>{const elapsed=now-startTime;const progress=Math.min(elapsed/duration,1);const eased=1-Math.pow(1-progress,3);const current=eased*target;setValue(isFloat?parseFloat(current.toFixed(1)):Math.round(current));if(progress<1)rafRef.current=requestAnimationFrame(tick);};rafRef.current=requestAnimationFrame(tick);return()=>{if(rafRef.current)cancelAnimationFrame(rafRef.current);};},[target,duration,started]);return value;}

function parseStatValue(str){const match=str.match(/^([0-9.]+)([^0-9.]*)$/);if(!match)return{num:null,suffix:str,prefix:''};return{num:parseFloat(match[1]),suffix:match[2],prefix:''};}

function AnimatedStat({value,label,accent,T}){const[ref,visible]=useReveal(0.3);const{num,suffix}=parseStatValue(value);const counted=useCountUp(num??0,1600,visible);const display=num!==null?`${counted}${suffix}`:value;return(<div ref={ref} className="stat-item" style={{background:T.statBg,border:`1px solid ${T.statBorder}`}}><span style={{fontSize:'2rem',fontWeight:700,fontFamily:'"Space Grotesk",sans-serif',color:accent,transition:'color 0.5s ease',lineHeight:1,display:'block',minWidth:'4rem',textAlign:'center'}}>{display}</span><span style={{fontSize:'0.82rem',color:T.statLabel,marginTop:'7px',fontWeight:500,textTransform:'uppercase',letterSpacing:'0.8px'}}>{label}</span></div>);}

const EST_SERVICES=[{id:'static',label:'Static site / portfolio',base:15000},{id:'dynamic',label:'Web app / e-commerce',base:45000},{id:'app',label:'Android app',base:60000},{id:'uiux',label:'UI/UX design only',base:12000},{id:'marketing',label:'Digital marketing',base:8000}];
const EST_SCOPES=[{id:'small',label:'Small',mult:1.0},{id:'medium',label:'Medium',mult:1.6},{id:'large',label:'Large',mult:2.5}];
function Estimator({accent,onInquire,T}){const[svc,setSvc]=useState('static');const[scope,setScope]=useState('small');const[timeline,setTimeline]=useState(4);const selected=EST_SERVICES.find(s=>s.id===svc);const scopeMult=EST_SCOPES.find(s=>s.id===scope).mult;const rushMult=timeline<3?1.3:timeline<5?1.1:1.0;const estimate=Math.round((selected.base*scopeMult*rushMult)/1000)*1000;const fmt=v=>'₹'+v.toLocaleString('en-IN');return(<div style={{display:'flex',flexDirection:'column',gap:'20px'}}><div><div style={{fontSize:'0.72rem',color:T.textFaint,textTransform:'uppercase',letterSpacing:'1px',marginBottom:'10px',fontFamily:'"JetBrains Mono",monospace'}}>Service type</div><div style={{display:'flex',flexDirection:'column',gap:'6px'}}>{EST_SERVICES.map(s=>(<button key={s.id} onClick={()=>setSvc(s.id)} style={{padding:'10px 14px',borderRadius:'10px',border:`1px solid ${svc===s.id?accent:T.border}`,background:svc===s.id?`${accent}12`:'transparent',color:svc===s.id?accent:T.textMuted,fontSize:'0.88rem',cursor:'pointer',textAlign:'left',transition:`all 0.2s ${EASE}`,fontFamily:'"Inter",sans-serif'}}>{s.label}</button>))}</div></div><div><div style={{fontSize:'0.72rem',color:T.textFaint,textTransform:'uppercase',letterSpacing:'1px',marginBottom:'10px',fontFamily:'"JetBrains Mono",monospace'}}>Project scope</div><div style={{display:'flex',gap:'8px'}}>{EST_SCOPES.map(s=>(<button key={s.id} onClick={()=>setScope(s.id)} style={{flex:1,padding:'9px',borderRadius:'9px',border:`1px solid ${scope===s.id?accent:T.border}`,background:scope===s.id?`${accent}12`:'transparent',color:scope===s.id?accent:T.textMuted,fontSize:'0.88rem',cursor:'pointer',transition:`all 0.2s ${EASE}`,fontFamily:'"Inter",sans-serif'}}>{s.label}</button>))}</div></div><div><div style={{fontSize:'0.72rem',color:T.textFaint,textTransform:'uppercase',letterSpacing:'1px',marginBottom:'10px',fontFamily:'"JetBrains Mono",monospace'}}>Timeline — {timeline} weeks {timeline<3?'⚡ rush':''}</div><input type="range" min="2" max="12" step="1" value={timeline} onChange={e=>setTimeline(+e.target.value)} style={{width:'100%',accentColor:accent,cursor:'pointer'}}/><div style={{display:'flex',justifyContent:'space-between',fontSize:'0.75rem',color:T.textFaint,marginTop:'5px',fontFamily:'"JetBrains Mono",monospace'}}><span>2 wk</span><span>12 wk</span></div></div><div style={{borderTop:`1px solid ${T.border}`,paddingTop:'18px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'12px'}}><div><div style={{fontSize:'0.72rem',color:T.textFaint,textTransform:'uppercase',letterSpacing:'1px',fontFamily:'"JetBrains Mono",monospace',marginBottom:'4px'}}>Estimated range</div><div style={{fontSize:'1.8rem',fontWeight:700,fontFamily:'"Space Grotesk",sans-serif',color:accent,letterSpacing:'-0.02em',transition:'color 0.4s'}}>{fmt(estimate)} – {fmt(Math.round(estimate*1.3/1000)*1000)}</div><div style={{fontSize:'0.75rem',color:T.textVeryFaint,marginTop:'3px'}}>indicative · final quote after consultation</div></div><MagneticButton onClick={()=>onInquire(selected.label)} strength={0.2} style={{background:accent,color:'#07080f',border:'none',padding:'12px 22px',borderRadius:'10px',fontWeight:700,fontSize:'0.88rem',cursor:'pointer',fontFamily:'"Inter",sans-serif',whiteSpace:'nowrap',transition:`background 0.4s ${EASE}`}}>Get exact quote →</MagneticButton></div></div>);}

const TESTIMONIALS=[{name:'Arjun Mehta',role:'Founder, RetailEdge',text:'ZenithLogic Solutions delivered our e-commerce platform in 6 weeks flat. Sales conversions went up 40% in the first month. Genuinely the best tech partner we have worked with.'},{name:'Priya Nair',role:'Marketing Head, SpiceRoute Foods',text:'Our Google Ads ROAS went from 1.8x to 4.2x after ZenithLogic Solutions took over the campaigns. They actually understand performance marketing, not just design.'},{name:'Karthik Sundaram',role:'CEO, LogiTrack',text:'The Android app they built handles 500+ daily active drivers without a hiccup. Clean code, great documentation, and they were available at every step.'},{name:'Deepa Krishnan',role:'Owner, Studio Bloom',text:'I needed a portfolio that felt like me, not a template. ZenithLogic Solutions nailed the brief on the first revision. My inquiry rate doubled within two weeks.'}];
function Testimonials({accent,T}){const[active,setActive]=useState(0);const tiltRef=useTilt(4);useEffect(()=>{const t=setInterval(()=>setActive(i=>(i+1)%TESTIMONIALS.length),5000);return()=>clearInterval(t);},[]);const t=TESTIMONIALS[active];return(<div style={{position:'relative'}}><div ref={tiltRef} style={{background:T.cardBg,border:`1px solid ${T.border}`,borderRadius:'20px',padding:'40px',minHeight:'180px',transition:`border-color 0.4s ${EASE},box-shadow 0.4s ${EASE},transform 0.2s ${EASE}`,borderTopColor:`${accent}40`,willChange:'transform'}}><div style={{fontSize:'2rem',color:accent,lineHeight:1,marginBottom:'16px',fontFamily:'Georgia,serif',opacity:0.6}}>"</div><p style={{color:T.textMuted,lineHeight:1.75,fontSize:'1rem',margin:'0 0 24px',fontStyle:'italic'}}>{t.text}</p><div style={{display:'flex',alignItems:'center',gap:'12px'}}><div style={{width:'38px',height:'38px',borderRadius:'50%',background:`${accent}22`,border:`1px solid ${accent}40`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.85rem',fontWeight:700,color:accent,fontFamily:'"Space Grotesk",sans-serif',flexShrink:0}}>{t.name.split(' ').map(w=>w[0]).join('')}</div><div><div style={{fontSize:'0.9rem',fontWeight:600,color:T.text}}>{t.name}</div><div style={{fontSize:'0.78rem',color:T.textFaint}}>{t.role}</div></div></div></div><div style={{display:'flex',gap:'7px',marginTop:'16px',justifyContent:'center'}}>{TESTIMONIALS.map((_,i)=>(<button key={i} onClick={()=>setActive(i)} style={{width:i===active?22:7,height:'7px',borderRadius:'4px',border:'none',cursor:'pointer',background:i===active?accent:T.border,transition:`all 0.35s ${EASE}`,padding:0}}/>))}</div></div>);}

const PROJECTS=[{title:'RetailEdge Platform',tags:['E-commerce','React','Node.js'],desc:'Full-stack storefront with real-time inventory and Razorpay checkout.',color:'#00ffcc'},{title:'LogiTrack Driver App',tags:['Android','Maps API','Firebase'],desc:'Fleet tracking app for 500+ daily active drivers across Tamil Nadu.',color:'#007fff'},{title:'Studio Bloom Portfolio',tags:['Static','Framer','SEO'],desc:'Award-winning portfolio site — 2s load, 98 Lighthouse score.',color:'#bf5aff'},{title:'SpiceRoute Marketing',tags:['Google Ads','Meta','SEO'],desc:'Managed campaigns delivering 4.2× ROAS for a D2C food brand.',color:'#ff007f'}];

function ProjectCard({p,delay,T}){
  const[hovered,setHovered]=useState(false);
  const tiltRef=useTilt(6);
  return(
    <GSAPReveal type="image" delay={delay}>
      <div ref={tiltRef} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} style={{
        background:T.cardBg,
        border:`1px solid ${hovered?p.color+'55':T.border}`,
        borderRadius:'16px',
        padding:'26px',
        cursor:'default',
        transition:`border-color 0.35s ${EASE},box-shadow 0.35s ${EASE},transform 0.2s ${EASE}`,
        boxShadow:hovered?`0 16px 40px rgba(0,0,0,0.15)`:'none',
        willChange:'transform',
        height:'100%',
        display:'flex',
        flexDirection:'column',
        boxSizing:'border-box',
      }}>
        <div style={{width:'10px',height:'10px',borderRadius:'50%',background:p.color,marginBottom:'16px',boxShadow:`0 0 12px ${p.color}80`}}/>
        <h3 style={{fontSize:'1.05rem',fontWeight:700,marginBottom:'8px',fontFamily:'"Space Grotesk",sans-serif',color:T.text}}>{p.title}</h3>
        <p style={{color:T.textMuted,fontSize:'0.88rem',lineHeight:1.6,marginBottom:'14px',flexGrow:1}}>{p.desc}</p>
        <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
          {p.tags.map(tag=>(
            <span key={tag} style={{padding:'3px 10px',borderRadius:'20px',fontSize:'0.72rem',fontWeight:500,background:`${p.color}12`,border:`1px solid ${p.color}30`,color:p.color,fontFamily:'"JetBrains Mono",monospace'}}>{tag}</span>
          ))}
        </div>
      </div>
    </GSAPReveal>
  );
}

function Portfolio({T}){
  return(
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:'16px',alignItems:'stretch'}}>
      {PROJECTS.map((p,i)=>(<ProjectCard key={p.title} p={p} delay={i*80} T={T}/>))}
    </div>
  );
}
const STEPS=[{label:'About you',fields:['name','email']},{label:'Your project',fields:['service','scope']},{label:'Details',fields:['message']}];
const SERVICE_OPTIONS=['Website / landing page','Web app / e-commerce','Android app','UI/UX design','Digital marketing','Other'];
const SCOPE_OPTIONS=['Under ₹25,000','₹25,000 – ₹75,000','₹75,000 – ₹2,00,000','₹2,00,000+'];

function ContactForm({accent,onSuccess,prefillService,T}){const[step,setStep]=useState(0);const[vals,setVals]=useState({name:'',email:'',service:prefillService||'',scope:'',message:''});const[sending,setSending]=useState(false);const[error,setError]=useState('');const set=(k,v)=>setVals(p=>({...p,[k]:v}));const canNext=()=>{if(step===0)return vals.name.trim()&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vals.email);if(step===1)return vals.service&&vals.scope;if(step===2)return vals.message.trim().length>=10;return true;};const submit=async()=>{setSending(true);setError('');try{const res=await fetch('http://localhost:5000/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(vals)});const data=await res.json();if(data.success)onSuccess();else setError('Server error — please call or email us directly.');}catch{setError('Could not connect — please call or email us directly.');}setSending(false);};const inputStyle={width:'100%',background:T.inputBg,border:T.inputBorder,color:T.inputColor,padding:'14px 16px',borderRadius:'12px',fontSize:'0.93rem',fontFamily:'"Inter",sans-serif',outline:'none'};const focusStyle=`input:focus,textarea:focus{border-color:${accent}!important;box-shadow:0 0 0 3px ${accent}15;}`;return(<div><style>{focusStyle}</style><div style={{display:'flex',gap:'8px',marginBottom:'28px'}}>{STEPS.map((s,i)=>(<div key={i} style={{flex:1}}><div style={{height:'3px',borderRadius:'2px',background:i<=step?accent:T.border,transition:`background 0.4s ${EASE}`,marginBottom:'6px'}}/><div style={{fontSize:'0.7rem',color:i===step?accent:T.textFaint,fontFamily:'"JetBrains Mono",monospace',transition:'color 0.3s'}}>{s.label}</div></div>))}</div>{step===0&&(<div style={{display:'flex',flexDirection:'column',gap:'14px'}}><div><label style={{fontSize:'0.75rem',color:T.textFaint,display:'block',marginBottom:'7px',textTransform:'uppercase',letterSpacing:'1px',fontFamily:'"JetBrains Mono",monospace'}}>Your name</label><input value={vals.name} onChange={e=>set('name',e.target.value)} placeholder="e.g. Priya Sharma" style={inputStyle}/></div><div><label style={{fontSize:'0.75rem',color:T.textFaint,display:'block',marginBottom:'7px',textTransform:'uppercase',letterSpacing:'1px',fontFamily:'"JetBrains Mono",monospace'}}>Email address</label><input type="email" value={vals.email} onChange={e=>set('email',e.target.value)} placeholder="you@company.com" style={inputStyle}/></div></div>)}{step===1&&(<div style={{display:'flex',flexDirection:'column',gap:'20px'}}><div><label style={{fontSize:'0.75rem',color:T.textFaint,display:'block',marginBottom:'10px',textTransform:'uppercase',letterSpacing:'1px',fontFamily:'"JetBrains Mono",monospace'}}>What do you need?</label><div style={{display:'flex',flexDirection:'column',gap:'7px'}}>{SERVICE_OPTIONS.map(o=>(<button key={o} onClick={()=>set('service',o)} style={{padding:'11px 14px',borderRadius:'10px',border:`1px solid ${vals.service===o?accent:T.border}`,background:vals.service===o?`${accent}12`:'transparent',color:vals.service===o?accent:T.textMuted,fontSize:'0.9rem',cursor:'pointer',textAlign:'left',fontFamily:'"Inter",sans-serif',transition:`all 0.2s ${EASE}`}}>{o}</button>))}</div></div><div><label style={{fontSize:'0.75rem',color:T.textFaint,display:'block',marginBottom:'10px',textTransform:'uppercase',letterSpacing:'1px',fontFamily:'"JetBrains Mono",monospace'}}>Approximate budget</label><div style={{display:'flex',flexWrap:'wrap',gap:'8px'}}>{SCOPE_OPTIONS.map(o=>(<button key={o} onClick={()=>set('scope',o)} style={{padding:'9px 14px',borderRadius:'9px',border:`1px solid ${vals.scope===o?accent:T.border}`,background:vals.scope===o?`${accent}12`:'transparent',color:vals.scope===o?accent:T.textMuted,fontSize:'0.84rem',cursor:'pointer',fontFamily:'"Inter",sans-serif',transition:`all 0.2s ${EASE}`}}>{o}</button>))}</div></div></div>)}{step===2&&(<div><label style={{fontSize:'0.75rem',color:T.textFaint,display:'block',marginBottom:'7px',textTransform:'uppercase',letterSpacing:'1px',fontFamily:'"JetBrains Mono",monospace'}}>Tell us more</label><textarea value={vals.message} onChange={e=>set('message',e.target.value)} placeholder="Describe your project, goals, or any questions you have…" rows={6} style={{...inputStyle,resize:'none',lineHeight:1.6}}/><div style={{fontSize:'0.75rem',color:vals.message.length<10?T.textFaint:accent,marginTop:'6px',fontFamily:'"JetBrains Mono",monospace',transition:'color 0.3s'}}>{vals.message.length} chars {vals.message.length<10?`· ${10-vals.message.length} more needed`:'· good to go'}</div>{error&&<div style={{color:'#ff607a',fontSize:'0.85rem',marginTop:'12px',background:'rgba(255,96,122,0.06)',border:'1px solid rgba(255,96,122,0.2)',padding:'12px 14px',borderRadius:'10px'}}>{error}</div>}</div>)}<div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:'24px',gap:'10px'}}>{step>0?<button onClick={()=>setStep(s=>s-1)} style={{background:'transparent',border:`1px solid ${T.borderHover}`,color:T.textFaint,padding:'12px 20px',borderRadius:'10px',cursor:'pointer',fontSize:'0.88rem',fontFamily:'"Inter",sans-serif'}}>← Back</button>:<div/>}{step<STEPS.length-1?<button onClick={()=>canNext()&&setStep(s=>s+1)} style={{background:canNext()?accent:T.border,color:canNext()?'#07080f':T.textFaint,border:'none',padding:'12px 28px',borderRadius:'10px',fontWeight:700,fontSize:'0.9rem',cursor:canNext()?'pointer':'default',fontFamily:'"Inter",sans-serif',transition:`all 0.25s ${EASE}`}}>Next →</button>:<button onClick={()=>canNext()&&!sending&&submit()} style={{background:canNext()&&!sending?accent:T.border,color:canNext()&&!sending?'#07080f':T.textFaint,border:'none',padding:'12px 28px',borderRadius:'10px',fontWeight:700,fontSize:'0.9rem',cursor:canNext()&&!sending?'pointer':'default',fontFamily:'"Inter",sans-serif',transition:`all 0.25s ${EASE}`}}>{sending?'Sending…':'Send message →'}</button>}</div></div>);}

const SERVICES=[{icon:'⚡',title:'Dynamic web applications',body:'Real-time databases, secure user systems, e-commerce flows, and admin dashboards built to handle live transactional load.',span:2},{icon:'📄',title:'Portfolios & static sites',body:'Fast-loading, zero-maintenance sites for professionals and businesses — optimized for SEO and first impressions.'},{icon:'🎨',title:'UI/UX design',body:'Wireframes to polished interfaces. Figma prototyping, user flow mapping, and minimal layouts designed for retention.'},{icon:'📱',title:'Android app development',body:'Native and hybrid apps built to scale across device sizes, with smooth API integration and push notification support.'},{icon:'📈',title:'Digital marketing',body:'Meta and Google ad campaigns, SEO, and lead generation systems built to turn traffic into measurable conversions.'},{icon:'💬',title:'WhatsApp & click-to-call',body:'Automated messaging channels and one-tap contact pathways that turn web visitors into qualified leads, fast.',span:3}];

function ServiceCard({icon,title,body,span,delay,T}){const tiltRef=useTilt(5);return(<GSAPReveal type="image" delay={delay}><div ref={tiltRef} className={`card${span===2?' span2':span===3?' span3':''}`} style={{background:T.cardBg,border:`1px solid ${T.border}`,borderRadius:'20px',backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)',cursor:'default',height:'100%',willChange:'transform'}}><div style={{fontSize:'2rem',marginBottom:'20px'}}>{icon}</div><div><h3 style={{fontSize:'1.2rem',marginBottom:'10px',fontWeight:700,color:T.text}}>{title}</h3><p style={{color:T.textMuted,lineHeight:1.65,fontSize:'0.93rem',margin:0}}>{body}</p></div></div></GSAPReveal>);}

const STATS=[{value:'50+',label:'Projects shipped'},{value:'3×',label:'Average lead lift'},{value:'98%',label:'Client retention'},{value:'24h',label:'Support response'}];

function BackToTop({visible,accent}){return(<button onClick={()=>window.scrollTo({top:0,behavior:'smooth'})} style={{position:'fixed',bottom:20,left:20,zIndex:90,width:42,height:42,borderRadius:'50%',border:`1px solid ${accent}50`,background:'rgba(7,8,15,0.85)',backdropFilter:'blur(8px)',cursor:'pointer',color:accent,fontSize:'1.1rem',display:'flex',alignItems:'center',justifyContent:'center',opacity:visible?1:0,transform:visible?'scale(1)':'scale(0.7)',transition:`all 0.35s ${EASE}`,pointerEvents:visible?'auto':'none'}} aria-label="Back to top">↑</button>);}

function CookieBanner({accent,onAccept,T}){return(<div style={{position:'fixed',bottom:0,left:0,right:0,zIndex:200,background:T.cookieBg,backdropFilter:'blur(16px)',borderTop:`1px solid ${T.cookieBorder}`,padding:'16px 7%',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'20px',flexWrap:'wrap'}}><p style={{color:T.textMuted,fontSize:'0.85rem',margin:0,lineHeight:1.6,maxWidth:'620px'}}>We use cookies to improve your experience and measure ad performance. No data is sold. <span style={{color:T.textVeryFaint}}>By continuing you accept this.</span></p><div style={{display:'flex',gap:'10px',flexShrink:0}}><button onClick={onAccept} style={{background:T.btnDeclineBg,border:`1px solid ${T.btnDeclineBorder}`,color:T.btnDeclineColor,padding:'8px 18px',borderRadius:'8px',cursor:'pointer',fontSize:'0.82rem',fontFamily:'"Inter",sans-serif'}}>Decline</button><button onClick={onAccept} style={{background:accent,color:'#07080f',border:'none',padding:'8px 18px',borderRadius:'8px',fontWeight:700,cursor:'pointer',fontSize:'0.82rem',fontFamily:'"Inter",sans-serif',transition:`background 0.4s ${EASE}`}}>Accept</button></div></div>);}

function LocationSection({accent,T,EASE}){const mapTiltRef=useTilt(2);return(<section id="location" style={{padding:'60px 7% 80px'}}><GSAPReveal type="text"><p style={{color:accent,fontSize:'0.75rem',fontWeight:600,letterSpacing:'2.5px',textTransform:'uppercase',marginBottom:'12px',fontFamily:'"JetBrains Mono",monospace',transition:'color 0.5s ease'}}>Location</p><h2 style={{fontSize:'clamp(1.8rem,3.5vw,2.6rem)',marginBottom:'8px',fontFamily:'"Space Grotesk",sans-serif',fontWeight:700,letterSpacing:'-0.02em',lineHeight:1.2,color:T.text}}>Find us in Coimbatore.</h2><p style={{color:T.textMuted,fontSize:'1rem',marginBottom:'40px',lineHeight:1.7}}>Drop by the office or reach out — we're always happy to meet in person.</p></GSAPReveal><div style={{display:'grid',gridTemplateColumns:'1fr 1.4fr',gap:'28px',alignItems:'start'}} className="contact-layout"><GSAPReveal type="image"><div style={{...T.glass,padding:'32px',transition:`border-color 0.4s ${EASE},box-shadow 0.4s ${EASE}`}} onMouseEnter={e=>{e.currentTarget.style.borderColor=`${accent}40`;e.currentTarget.style.boxShadow=`0 0 40px ${accent}0a`;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.boxShadow='none';}}>{[{icon:'📍',meta:'Office address',val:<>42, Avinashi Road,<br/>Peelamedu, Coimbatore,<br/>Tamil Nadu – 641 004</>},{icon:'📞',meta:'Phone',val:<a href="tel:+918111056064" style={{color:T.text,textDecoration:'none',fontWeight:500}} onMouseEnter={e=>e.target.style.color=accent} onMouseLeave={e=>e.target.style.color=T.text}>+91 81110 56064</a>},{icon:'✉️',meta:'Email',val:<a href="mailto:info@zenithlogicsolutions.com" style={{color:T.text,textDecoration:'none',fontWeight:500}} onMouseEnter={e=>e.target.style.color=accent} onMouseLeave={e=>e.target.style.color=T.text}>info@zenithlogicsolutions.com</a>}].map(({icon,meta,val})=>(<div key={meta} style={{display:'flex',alignItems:'flex-start',gap:'14px',marginBottom:'24px'}}><div style={{width:42,height:42,borderRadius:'12px',flexShrink:0,background:`${accent}0f`,border:`1px solid ${accent}24`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem',transition:'background 0.5s'}}>{icon}</div><div><div style={{fontSize:'0.7rem',color:T.textGhost,textTransform:'uppercase',letterSpacing:'1px',marginBottom:'4px',fontFamily:'"JetBrains Mono",monospace'}}>{meta}</div><div style={{color:T.text,fontSize:'0.95rem',fontWeight:500,lineHeight:1.5}}>{val}</div></div></div>))}<div style={{borderTop:`1px solid ${T.border}`,paddingTop:'22px',marginBottom:'22px'}}><div style={{fontSize:'0.7rem',color:T.textGhost,textTransform:'uppercase',letterSpacing:'1px',marginBottom:'10px',fontFamily:'"JetBrains Mono",monospace'}}>Business hours</div>{[['Monday – Friday','09:00 – 18:00',true],['Saturday','10:00 – 14:00',true],['Sunday','Closed',false]].map(([day,time,open])=>(<div key={day} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 0',borderBottom:`1px solid ${T.border}`,fontSize:'0.85rem'}}><span style={{color:T.textMuted}}>{day}</span><span style={{color:open?accent:T.textGhost,fontFamily:'"JetBrains Mono",monospace',fontSize:'0.78rem',transition:'color 0.5s'}}>{time}</span></div>))}</div></div></GSAPReveal><GSAPReveal type="image" delay={150}><div ref={mapTiltRef} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:'20px',overflow:'hidden',position:'relative',transition:`border-color 0.4s ${EASE},box-shadow 0.4s ${EASE},transform 0.2s ${EASE}`,willChange:'transform'}} onMouseEnter={e=>{e.currentTarget.style.borderColor=`${accent}50`;e.currentTarget.style.boxShadow=`0 0 60px ${accent}14,inset 0 0 40px ${accent}05`;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.boxShadow='none';}}><div style={{position:'absolute',top:16,left:16,zIndex:10,display:'inline-flex',alignItems:'center',gap:7,background:`${accent}14`,border:`1px solid ${accent}38`,borderRadius:999,padding:'5px 14px',fontFamily:'"JetBrains Mono",monospace',fontSize:'0.7rem',color:accent}}><span style={{width:3,height:6,borderRadius:'50%',background:accent,display:'inline-block'}}/>Coimbatore, TN</div><svg viewBox="0 0 480 360" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'350px',display:'block'}}><rect width="480" height="300" fill={T.mapBg}/><g stroke={T.mapGridStroke} strokeWidth="1">{[40,80,120,160,200,240,280,320].map(y=><line key={`h${y}`} x1="0" y1={y} x2="480" y2={y}/>)}{[48,96,144,192,240,288,336,384,432].map(x=><line key={`v${x}`} x1={x} y1="0" x2={x} y2="360"/>)}</g><line x1="0" y1="220" x2="480" y2="140" stroke={T.mapRoadMain} strokeWidth="5"/><line x1="0" y1="220" x2="480" y2="140" stroke={T.mapRoadMainGlow} strokeWidth="9"/><line x1="200" y1="0" x2="200" y2="360" stroke={T.mapRoadSec} strokeWidth="3.5"/><line x1="200" y1="0" x2="200" y2="360" stroke={T.mapRoadSecGlow} strokeWidth="7"/><line x1="0" y1="180" x2="480" y2="180" stroke={T.mapRoadMin} strokeWidth="2"/><line x1="300" y1="0" x2="300" y2="360" stroke={T.mapRoadMin} strokeWidth="2"/>{[[50,42,68,36],[50,84,68,34],[50,124,68,34],[148,42,48,36],[148,84,48,34],[204,42,82,36],[204,84,82,34],[304,42,76,36],[304,84,76,34],[390,42,80,76],[50,202,68,36],[50,244,68,34],[50,284,68,34],[148,202,48,36],[148,244,48,74],[204,202,82,36],[204,244,82,34],[304,202,76,76],[390,202,80,76],[304,284,166,70],[204,284,82,70]].map(([x,y,w,h],i)=>(<rect key={i} x={x} y={y} width={w} height={h} rx="2" fill={T.mapBlock}/>))}<rect x="204" y="124" width="82" height="54" rx="3" fill={`${accent}08`} stroke={`${accent}20`} strokeWidth="1"/><text x="240" y="136" textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize="8" fill={T.mapLabelRoad} transform="rotate(-9.5 240 136)">Avinashi Road</text><text x="210" y="90" fontFamily="JetBrains Mono,monospace" fontSize="7.5" fill={T.mapLabelArea}>Peelamedu</text><defs><radialGradient id="locPinGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor={accent} stopOpacity="0.18"/><stop offset="100%" stopColor={accent} stopOpacity="0"/></radialGradient></defs><circle cx="245" cy="163" r="44" fill="url(#locPinGlow)"/><circle cx="245" cy="163" r="6" fill="none" stroke={accent} strokeWidth="1.5" opacity="0.7"><animate attributeName="r" values="6;26" dur="3s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.7;0" dur="3s" repeatCount="indefinite"/></circle><circle cx="245" cy="163" r="6" fill="none" stroke={accent} strokeWidth="1" opacity="0.5"><animate attributeName="r" values="6;26" dur="3s" begin="1s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.5;0" dur="3s" begin="1s" repeatCount="indefinite"/></circle><path d="M245,141 C235,141 229,148 229,155 C229,167 245,185 245,185 C245,185 261,167 261,155 C261,148 255,141 245,141 Z" fill={accent} opacity="0.95"/><circle cx="245" cy="155" r="5.5" fill={T.mapPinFill}/><g transform="translate(444,32)"><circle cx="0" cy="0" r="14" fill={T.mapCompassBg} stroke={T.mapCompassBorder} strokeWidth="0.8"/><text x="0" y="-5" textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize="7" fill={accent} fontWeight="bold">N</text><line x1="0" y1="-2" x2="0" y2="3" stroke={T.mapLabelArea} strokeWidth="0.8"/><line x1="-3" y1="0" x2="3" y2="0" stroke={T.mapLabelArea} strokeWidth="0.8"/></g><g transform="translate(22,340)"><line x1="0" y1="0" x2="48" y2="0" stroke={T.mapScaleStroke} strokeWidth="1"/><line x1="0" y1="-3" x2="0" y2="3" stroke={T.mapScaleStroke} strokeWidth="1"/><line x1="48" y1="-3" x2="48" y2="3" stroke={T.mapScaleStroke} strokeWidth="1"/><text x="24" y="-7" textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize="6.5" fill={T.mapScaleLabel}>500 m</text></g></svg><div style={{position:'relative',background:T.mapOverlayGrad,padding:'24px 20px 18px',display:'flex',alignItems:'flex-end',justifyContent:'space-between',gap:12,flexWrap:'wrap',marginTop:'-60px'}}><div><div style={{fontFamily:'"Space Grotesk",sans-serif',fontWeight:700,fontSize:'1rem',color:T.text,marginBottom:2}}>ZenithLogic Solutions</div><div style={{fontSize:'0.78rem',color:T.mapCoordColor,fontFamily:'"JetBrains Mono",monospace'}}>11.0168° N, 76.9558° E</div></div><a href="https://maps.google.com/?q=11.0168,76.9558" target="_blank" rel="noopener noreferrer" style={{display:'inline-flex',alignItems:'center',gap:8,background:accent,color:'#07080f',border:'none',borderRadius:'10px',padding:'9px 16px',fontSize:'0.8rem',fontWeight:700,fontFamily:'"Inter",sans-serif',cursor:'pointer',textDecoration:'none',transition:`background 0.4s ${EASE}`}} onMouseEnter={e=>{e.currentTarget.style.background='#00e6b8';}} onMouseLeave={e=>{e.currentTarget.style.background=accent;}}>➤ Open in Maps</a></div></div></GSAPReveal></div></section>);}

/* ── Main app ── */
export default function App() {
  const [theme,        setTheme]        = useState('dark');
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [scrollPct,    setScrollPct]    = useState(0);
  const [formSuccess,  setFormSuccess]  = useState(false);
  const [showCookie,   setShowCookie]   = useState(true);
  const [activeNav,    setActiveNav]    = useState('');
  const [showEstimator,setShowEstimator]= useState(false);
  const [prefillSvc,   setPrefillSvc]   = useState('');
  const [pageEntered,  setPageEntered]  = useState(false);

  const T = useMemo(() => getTheme(theme), [theme]);
  const toggleTheme = useCallback(() => setTheme(t => t === 'dark' ? 'light' : 'dark'), []);
  const showBackToTop = scrollPct > 0.15;
  const heroBgParallax = useParallax(0.25);
  const globeParallax  = useParallax(-0.15);

  useEffect(()=>{const t=setTimeout(()=>setPageEntered(true),80);return()=>clearTimeout(t);},[]);

  useEffect(()=>{
    let rafId;
    const onScroll=()=>{
      cancelAnimationFrame(rafId);
      rafId=requestAnimationFrame(()=>{
        const max=document.documentElement.scrollHeight-document.documentElement.clientHeight;
        setScrollPct(max>0?Math.min(Math.max(window.scrollY/max,0),1):0);
        const sections=['services','work','vision','location','contact'];
        for(let i=sections.length-1;i>=0;i--){const el=document.getElementById(sections[i]);if(el&&el.getBoundingClientRect().top<=120){setActiveNav(sections[i]);break;}if(i===0)setActiveNav('');}
      });
    };
    window.addEventListener('scroll',onScroll,{passive:true});
    return()=>{window.removeEventListener('scroll',onScroll);cancelAnimationFrame(rafId);};
  },[]);

  const stageIdx = Math.min(Math.floor(scrollPct*(TOPOLOGIES.length-1)),TOPOLOGIES.length-1);
  const accent   = ACCENTS[stageIdx];
  const scrollTo = useCallback((id)=>{ document.getElementById(id)?.scrollIntoView({behavior:'smooth'}); setMenuOpen(false); },[]);
  const handleInquire = (svcLabel) => { setPrefillSvc(svcLabel); setShowEstimator(false); scrollTo('contact'); };
  const navLinks = ['Services','Work','Vision','Location','Contact'];

  return (
    <div style={{
      width:'100%',maxWidth:'100vw',minHeight:'100vh',
      backgroundColor:T.bg, backgroundImage:T.bgGradients,
      color:T.text,fontFamily:'"Inter",sans-serif',margin:0,padding:0,overflowX:'hidden',
      opacity:pageEntered?1:0, transform:pageEntered?'translateY(0)':'translateY(12px)',
      transition:`opacity 0.7s ${EASE},transform 0.7s ${EASE},background-color 0.4s ${EASE},color 0.4s ${EASE}`,
    }}>
      <link rel="stylesheet" href={FONTS}/>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html,body,#root{width:100%;overflow-x:hidden;}
        h1,h2,h3,h4{font-family:'Space Grotesk',sans-serif;letter-spacing:-0.02em;font-weight:700;}
        .bento{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
        .span2{grid-column:span 2;}.span3{grid-column:span 3;}
        .card{position:relative;overflow:hidden;padding:32px;display:flex;flex-direction:column;justify-content:space-between;min-height:250px;transition:border-color 0.35s ${EASE},box-shadow 0.35s ${EASE};}
        .card:hover{box-shadow:0 16px 48px rgba(0,0,0,0.2);}
        .nav-link{position:relative;text-decoration:none;font-size:0.9rem;font-weight:500;cursor:pointer;transition:color 0.25s ease;}
        .nav-link::after{content:'';position:absolute;left:0;bottom:-4px;width:0;height:1.5px;background:currentColor;transition:width 0.25s ${EASE};}
        .nav-link:hover,.nav-link.active{color:inherit!important;opacity:1!important;}
        .nav-link.active::after,.nav-link:hover::after{width:100%;}
        .btn{display:inline-flex;align-items:center;gap:8px;border:none;cursor:pointer;font-family:'Inter',sans-serif;font-weight:600;border-radius:12px;transition:all 0.25s ${EASE};}
        .btn:hover{transform:translateY(-2px);}
        .btn:active{transform:translateY(0);}
        .stat-item{display:flex;flex-direction:column;align-items:center;padding:28px 20px;border-radius:16px;text-align:center;flex:1;}
        .contact-icon{width:44px;height:44px;border-radius:12px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:1.2rem;}
        .whatsapp-btn{position:fixed;bottom:20px;right:20px;z-index:300;width:52px;height:52px;border-radius:50%;border:none;background:#25d366;cursor:pointer;font-size:1.4rem;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(37,211,102,0.4);transition:all 0.3s ${EASE};}
        .whatsapp-btn:hover{transform:scale(1.1);box-shadow:0 6px 28px rgba(37,211,102,0.55);}
        @media(max-width:1024px){.bento{grid-template-columns:repeat(2,1fr);}.span2,.span3{grid-column:span 2;}}
        @media(max-width:700px){
          .nav-desktop,.cta-btn{display:none!important;}.hamburger{display:flex!important;}
          .bento{grid-template-columns:1fr;}.span2,.span3{grid-column:auto;}
          .hero-head{font-size:clamp(2rem,9vw,3rem)!important;}
          .contact-layout{grid-template-columns:1fr!important;}
          .stats-row{flex-wrap:wrap;}.topo-tag{display:none!important;}
          .est-layout{grid-template-columns:1fr!important;}
          .ai-orb{display:none!important;}
          .holo-strip{grid-template-columns:1fr 1fr!important;}
        }
        @media(prefers-reduced-motion:reduce){*{animation-duration:0.01ms!important;transition-duration:0.01ms!important;}}
      `}</style>

      {/* Network BG */}
      <div style={{position:'fixed',inset:0,zIndex:0,opacity:T.networkOpacity,pointerEvents:'none',transition:'opacity 0.5s ease'}}>
        <div style={{position:'absolute',top:'50%',left:'50%',width:'min(860px,110vw)',height:'min(860px,110vh)',transform:'translate(-50%,-50%)'}}>
          <NetworkVisual progress={scrollPct} accent={accent}/>
        </div>
      </div>

      <CursorGlow accent={accent}/>

      {/* Topology tag */}
      <div className="topo-tag" style={{position:'fixed',bottom:18,right:76,zIndex:90,display:'flex',alignItems:'center',gap:7,background:T.navBg,backdropFilter:'blur(8px)',padding:'5px 13px',borderRadius:999,border:`1px solid ${T.navBorder}`,fontFamily:'"JetBrains Mono",monospace',fontSize:'0.68rem',color:T.textMuted}}>
        <span style={{width:6,height:6,borderRadius:'50%',background:accent,transition:'background 0.6s ease',flexShrink:0}}/>
        {TOPOLOGIES[stageIdx]?.label}
      </div>

      {/* WhatsApp FAB */}
      <button className="whatsapp-btn" onClick={()=>window.open('https://wa.me/918111056064?text=Hi%20ZenithLogic%2C%20I%27d%20like%20to%20discuss%20a%20project','_blank')} aria-label="Chat on WhatsApp" style={{zIndex:300}}>💬</button>

      <BackToTop visible={showBackToTop} accent={accent}/>
      {showCookie && <CookieBanner accent={accent} onAccept={()=>setShowCookie(false)} T={T}/>}

      <div style={{position:'relative',zIndex:2}}>

        {/* ── Header ── */}
        <header style={{position:'sticky',top:0,zIndex:100,padding:'12px 7%',display:'flex',justifyContent:'space-between',alignItems:'center',background:T.navBg,backdropFilter:'blur(18px)',borderBottom:`1px solid ${T.navBorder}`,transition:`background 0.4s ${EASE}`}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px',cursor:'pointer'}} onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}>
            <Logo3D accent={accent} size="normal" />
            <div style={{fontFamily:'"Space Grotesk",sans-serif',fontSize:'1.2rem',fontWeight:700,letterSpacing:'1px',color:T.text}}>
              ZenithLogic<span style={{color:accent,transition:'color 0.5s ease'}}>Solutions</span>
            </div>
          </div>
          <nav className="nav-desktop" style={{display:'flex',gap:'36px'}}>
            {navLinks.map(lbl=>(
              <a key={lbl} className={`nav-link${activeNav===lbl.toLowerCase()?' active':''}`} style={{color:T.textMuted}} onClick={()=>scrollTo(lbl.toLowerCase())}>{lbl}</a>
            ))}
          </nav>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <ThemeToggle theme={theme} onToggle={toggleTheme} accent={accent}/>
            <button className="btn cta-btn" onClick={()=>scrollTo('contact')} style={{background:accent,color:'#07080f',padding:'10px 22px',fontSize:'0.85rem',borderRadius:'10px',transition:`background 0.5s ease`}}>
              Start a project
            </button>
          </div>
          <button className="hamburger" onClick={()=>setMenuOpen(v=>!v)} style={{display:'none',flexDirection:'column',gap:'5px',background:'transparent',border:`1px solid ${T.borderHover}`,borderRadius:'8px',padding:'9px',cursor:'pointer'}}>
            {[0,1,2].map(i=><span key={i} style={{width:18,height:2,background:T.text,display:'block'}}/>)}
          </button>
        </header>

        {menuOpen && (
          <div style={{position:'fixed',top:69,left:0,right:0,zIndex:99,background:T.navBg,backdropFilter:'blur(20px)',padding:'24px 7%',display:'flex',flexDirection:'column',gap:'18px',borderBottom:`1px solid ${T.navBorder}`}}>
            {navLinks.map(lbl=>(<a key={lbl} onClick={()=>scrollTo(lbl.toLowerCase())} style={{color:T.textMuted,textDecoration:'none',fontSize:'1.05rem',fontWeight:500,cursor:'pointer'}}>{lbl}</a>))}
            <button className="btn" onClick={()=>scrollTo('contact')} style={{background:accent,color:'#07080f',padding:'13px',borderRadius:'10px',marginTop:4}}>Start a project</button>
          </div>
        )}

        {/* ── Hero ── */}
        <section style={{padding:'100px 7% 80px',minHeight:'86vh',display:'flex',alignItems:'center',position:'relative',overflow:'hidden'}}>
          <div ref={heroBgParallax} style={{position:'absolute',inset:0,willChange:'transform'}}>
            <FloatingCodeSnippets accent={accent}/>
          </div>

          <div style={{maxWidth:'780px',position:'relative',zIndex:2}}>
            <GSAPReveal type="text" delay={0}>
              <div style={{display:'inline-flex',alignItems:'center',gap:'8px',marginBottom:'22px'}}>
                <span style={{width:7,height:7,borderRadius:'50%',background:accent,boxShadow:`0 0 10px ${accent}`,transition:'background 0.5s ease'}}/>
                <span style={{color:accent,fontSize:'0.75rem',fontWeight:600,letterSpacing:'2.5px',textTransform:'uppercase',fontFamily:'"JetBrains Mono",monospace',transition:'color 0.5s ease'}}>Web development · Coimbatore</span>
              </div>
            </GSAPReveal>
            <GSAPReveal type="text" delay={120}>
              <h1 className="hero-head" style={{fontSize:'clamp(2.6rem,5.5vw,4.4rem)',lineHeight:1.08,marginBottom:'26px',fontWeight:800,color:T.text}}>
                Build a web presence<br/>
                <TypingHeadline accent={accent}/>
              </h1>
            </GSAPReveal>
            <GSAPReveal type="text" delay={240}>
              <p style={{fontSize:'1.1rem',color:T.textMuted,lineHeight:1.75,maxWidth:'530px',marginBottom:'44px'}}>
                We design and build websites, apps, and marketing systems that grow businesses — from a single landing page to a full digital operation.
              </p>
            </GSAPReveal>
            <GSAPReveal type="fade" delay={360}>
              <div style={{display:'flex',gap:'14px',flexWrap:'wrap'}}>
                <MagneticButton className="btn" onClick={()=>scrollTo('contact')} style={{backgroundImage:`linear-gradient(120deg,${accent},#007fff)`,color:'#07080f',padding:'16px 34px',fontSize:'0.95rem'}}>
                  Let's talk →
                </MagneticButton>
                <MagneticButton className="btn" onClick={()=>{setShowEstimator(true);scrollTo('estimator');}} style={{background:'transparent',color:T.text,border:`1px solid ${T.borderHover}`,padding:'16px 34px',fontSize:'0.95rem'}}>
                  Estimate cost
                </MagneticButton>
              </div>
            </GSAPReveal>
          </div>

          {/* 3D Globe */}
          <div ref={globeParallax} className="ai-orb" style={{position:'absolute',right:0,top:'50%',transform:'translateY(-50%)',pointerEvents:'auto',zIndex:1,willChange:'transform'}}>
            <Globe3D accent={accent}/>
          </div>
        </section>

        {/* ── Holographic Stats Strip ── */}
        <section style={{padding:'0 7% 60px'}}>
          <GSAPReveal type="image">
            <div style={{...T.glass, borderRadius:'24px', padding:'32px'}}>
              <p style={{color:accent,fontSize:'0.72rem',fontWeight:600,letterSpacing:'2.5px',
                textTransform:'uppercase',marginBottom:'20px',
                fontFamily:'"JetBrains Mono",monospace',transition:'color 0.5s'}}>
                Live metrics
              </p>
              <div style={{
                display:'grid',
                gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))',
                gap:'12px',
              }}>
                <HolographicCards accent={accent} T={T}/>
              </div>
            </div>
          </GSAPReveal>
        </section>

        {/* ── Neural Network + AI Brain ── */}
        <section style={{padding:'0 7% 60px'}}>
          <GSAPReveal type="image">
            <div style={{
              ...T.glass, borderRadius:'24px', padding:'32px',
              display:'grid', gridTemplateColumns:'1fr 1fr', gap:'32px', alignItems:'center',
            }} className="neural-layout">
              <div>
                <p style={{color:accent,fontSize:'0.72rem',fontWeight:600,letterSpacing:'2.5px',textTransform:'uppercase',marginBottom:'10px',fontFamily:'"JetBrains Mono",monospace',transition:'color 0.5s'}}>Architecture</p>
                <h2 style={{fontSize:'clamp(1.3rem,2.5vw,1.9rem)',marginBottom:'12px',lineHeight:1.2,color:T.text}}>Built for the digital future.</h2>
                <p style={{color:T.textMuted,fontSize:'0.93rem',lineHeight:1.7}}>Our technology ecosystem combines innovative design, intelligent systems, and scalable infrastructure to deliver secure, high-performance solutions for businesses worldwide.</p>
              </div>
              <div style={{height:'200px',borderRadius:'16px',overflow:'hidden',background:T.isDark?'rgba(0,0,0,0.2)':'rgba(0,0,0,0.03)',border:`1px solid ${T.border}`}}>
                <AIBrain3D accent={accent}/>
              </div>
            </div>
          </GSAPReveal>
        </section>

        {/* Stats */}
        <section style={{padding:'0 7% 80px'}}>
          <div className="stats-row" style={{display:'flex',gap:'16px'}}>
            {STATS.map(({value,label})=>(<AnimatedStat key={label} value={value} label={label} accent={accent} T={T}/>))}
          </div>
        </section>

        {/* Services */}
        <section id="services" style={{padding:'80px 7%'}}>
          <GSAPReveal type="text">
            <div style={{marginBottom:'44px'}}>
              <p style={{color:accent,fontSize:'0.75rem',fontWeight:600,letterSpacing:'2.5px',textTransform:'uppercase',marginBottom:'12px',fontFamily:'"JetBrains Mono",monospace',transition:'color 0.5s ease'}}>Services</p>
              <h2 style={{fontSize:'clamp(1.8rem,3.5vw,2.8rem)',maxWidth:'620px',lineHeight:1.2,color:T.text}}>Everything you need to compete online.</h2>
            </div>
          </GSAPReveal>
          <div className="bento">
            {SERVICES.map(({icon,title,body,span},i)=>(<ServiceCard key={title} icon={icon} title={title} body={body} span={span} delay={i*60} T={T}/>))}
          </div>
        </section>

        {/* Estimator */}
        <section id="estimator" style={{padding:'0 7% 80px'}}>
          <GSAPReveal type="image">
            <div style={{...T.glass,borderRadius:'24px',overflow:'hidden'}}>
              <button onClick={()=>setShowEstimator(v=>!v)} style={{width:'100%',padding:'22px 32px',background:'transparent',border:'none',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer',color:T.text,fontFamily:'"Space Grotesk",sans-serif'}}>
                <div style={{display:'flex',alignItems:'center',gap:'14px'}}>
                  <span style={{fontSize:'1.2rem'}}>🧮</span>
                  <div style={{textAlign:'left'}}>
                    <div style={{fontSize:'1.1rem',fontWeight:700,color:T.text}}>Project cost estimator</div>
                    <div style={{fontSize:'0.82rem',color:T.textMuted,marginTop:'2px'}}>Get a ballpark figure in 30 seconds</div>
                  </div>
                </div>
                <span style={{color:accent,fontSize:'1.2rem',transform:showEstimator?'rotate(180deg)':'rotate(0)',transition:`transform 0.3s ${EASE}`}}>▾</span>
              </button>
              {showEstimator && (<div style={{padding:'0 32px 32px',borderTop:`1px solid ${T.border}`}}><div style={{paddingTop:'24px'}}><Estimator accent={accent} onInquire={handleInquire} T={T}/></div></div>)}
            </div>
          </GSAPReveal>
        </section>

        {/* Portfolio */}
        <section id="work" style={{padding:'0 7% 80px'}}>
          <GSAPReveal type="text">
            <div style={{marginBottom:'36px'}}>
              <p style={{color:accent,fontSize:'0.75rem',fontWeight:600,letterSpacing:'2.5px',textTransform:'uppercase',marginBottom:'12px',fontFamily:'"JetBrains Mono",monospace',transition:'color 0.5s ease'}}>Work</p>
              <h2 style={{fontSize:'clamp(1.8rem,3.5vw,2.8rem)',lineHeight:1.2,color:T.text}}>Recent projects.</h2>
            </div>
          </GSAPReveal>
          <Portfolio T={T}/>
        </section>

        {/* Marketing callout */}
        <section style={{padding:'0 7% 80px'}}>
          <GSAPReveal type="image">
            <div style={{...T.glass,padding:'56px 6%',borderRadius:'24px',overflow:'hidden',position:'relative',textAlign:'center'}}>
              <div style={{position:'absolute',top:0,left:0,right:0,height:'1px',background:`linear-gradient(90deg,transparent,${accent}60,transparent)`}}/>
              <div style={{display:'inline-block',border:`1px solid ${accent}50`,color:accent,fontSize:'0.7rem',textTransform:'uppercase',letterSpacing:'3px',padding:'5px 16px',borderRadius:999,marginBottom:'22px',fontFamily:'"JetBrains Mono",monospace'}}>Marketing</div>
              <h2 style={{fontSize:'clamp(1.7rem,4vw,2.9rem)',marginBottom:'18px',lineHeight:1.15,color:T.text}}>More leads. Less guesswork.</h2>
              <p style={{color:T.textMuted,fontSize:'1.05rem',maxWidth:'600px',margin:'0 auto 36px',lineHeight:1.75}}>We run Google and Meta ad campaigns grounded in data — tracking every click, call, and form fill back to a real conversion.</p>
              <MagneticButton className="btn" onClick={()=>scrollTo('contact')} style={{backgroundImage:`linear-gradient(120deg,${accent},#007fff)`,color:'#07080f',padding:'15px 36px',fontSize:'0.95rem'}}>Get a marketing audit →</MagneticButton>
            </div>
          </GSAPReveal>
        </section>

        {/* Testimonials */}
        <section style={{padding:'0 7% 80px'}}>
          <GSAPReveal type="text">
            <div style={{marginBottom:'32px'}}>
              <p style={{color:accent,fontSize:'0.75rem',fontWeight:600,letterSpacing:'2.5px',textTransform:'uppercase',marginBottom:'12px',fontFamily:'"JetBrains Mono",monospace',transition:'color 0.5s ease'}}>Client stories</p>
              <h2 style={{fontSize:'clamp(1.8rem,3.5vw,2.6rem)',lineHeight:1.2,color:T.text}}>What clients say.</h2>
            </div>
          </GSAPReveal>
          <GSAPReveal type="image" delay={100}><Testimonials accent={accent} T={T}/></GSAPReveal>
        </section>

        {/* Vision */}
        <section id="vision" style={{padding:'0 7% 80px'}}>
          <GSAPReveal type="image">
            <div style={{...T.glass,padding:'52px 6%',textAlign:'center',borderRadius:'24px'}}>
              <h2 style={{fontSize:'clamp(1.6rem,3.5vw,2.5rem)',marginBottom:'22px',color:T.text}}>What we're <span style={{color:accent,transition:'color 0.5s'}}>building toward</span></h2>
              <p style={{color:T.textMuted,lineHeight:1.85,fontSize:'1.05rem',maxWidth:'720px',margin:'0 auto',fontStyle:'italic'}}>"Our vision at ZenithLogic Solutions is to be a leading force in shaping the future of digital experiences — a world where businesses of every size can thrive online, propelled by thoughtful technology and creative work built to last."</p>
            </div>
          </GSAPReveal>
        </section>

        {/* Contact */}
        <section id="contact" style={{padding:'60px 7% 80px'}}>
          <div className="contact-layout" style={{display:'grid',gridTemplateColumns:'1fr 1.15fr',gap:'60px',alignItems:'start'}}>
            <GSAPReveal type="text">
              <div>
                <p style={{color:accent,fontSize:'0.75rem',fontWeight:600,letterSpacing:'2.5px',textTransform:'uppercase',marginBottom:'14px',fontFamily:'"JetBrains Mono",monospace'}}>Contact</p>
                <h2 style={{fontSize:'clamp(1.8rem,3.5vw,2.7rem)',marginBottom:'18px',lineHeight:1.15,color:T.text}}>Let's build something<br/><span style={{color:accent}}>worth showing.</span></h2>
                <p style={{color:T.textMuted,lineHeight:1.75,marginBottom:'44px',fontSize:'1rem'}}>Tell us about your project and we'll get back to you within a business day with a clear plan and a fair quote.</p>
                <div style={{display:'flex',flexDirection:'column',gap:'22px'}}>
                  {[{icon:'📞',meta:'Call us',value:'+91 81110 056064'},{icon:'✉️',meta:'Email us',value:'info@zenithlogicsolutions.com',href:'mailto:info@zenithlogicsolutions.com'}].map(({icon,meta,value,href})=>(
                    <div key={meta} style={{display:'flex',alignItems:'center',gap:'16px'}}>
                      <div className="contact-icon" style={{background:T.surface,border:`1px solid ${T.border}`}}>{icon}</div>
                      <div>
                        <div style={{fontSize:'0.72rem',color:T.textGhost,textTransform:'uppercase',letterSpacing:'1px',marginBottom:'3px'}}>{meta}</div>
                        <a href={href} style={{color:T.text,textDecoration:'none',fontWeight:600,fontSize:'1rem'}} onMouseEnter={e=>e.target.style.color=accent} onMouseLeave={e=>e.target.style.color=T.text}>{value}</a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </GSAPReveal>
            <GSAPReveal type="image" delay={150}>
              <div style={{...T.glass,padding:'40px',boxShadow:'0 24px 60px rgba(0,0,0,0.15)'}}>
                {formSuccess
                  ? (<div style={{textAlign:'center',padding:'40px 0'}}><div style={{fontSize:'2.5rem',marginBottom:'16px'}}>✅</div><h3 style={{fontSize:'1.3rem',marginBottom:'10px',color:'#00ffcc'}}>Message sent!</h3><p style={{color:T.textMuted,lineHeight:1.7}}>We'll review your project and get back to you within one business day.</p><button onClick={()=>setFormSuccess(false)} style={{marginTop:'24px',background:'transparent',border:`1px solid ${T.borderHover}`,color:T.textFaint,padding:'10px 20px',borderRadius:'9px',cursor:'pointer',fontSize:'0.85rem',fontFamily:'"Inter",sans-serif'}}>Send another</button></div>)
                  : <ContactForm accent={accent} onSuccess={()=>setFormSuccess(true)} prefillService={prefillSvc} T={T}/>
                }
              </div>
            </GSAPReveal>
          </div>
        </section>

        <LocationSection accent={accent} T={T} EASE={EASE}/>

        {/* Footer — Logo3D here is a separate instance, no duplication due to loadThree() guard */}
        <footer style={{padding:'28px 7%',borderTop:`1px solid ${T.footerBorder}`,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <Logo3D accent={accent} size="normal"/>
            <span style={{fontFamily:'"Space Grotesk",sans-serif',fontWeight:700,fontSize:'1.1rem',letterSpacing:'1px',color:T.text}}>
              ZenithLogic<span style={{color:accent,transition:'color 0.5s'}}>Solutions</span>
            </span>
          </div>
          <span style={{color:T.textGhost,fontSize:'0.82rem'}}>© {new Date().getFullYear()} ZenithLogic Solutions · Coimbatore, Tamil Nadu</span>
        </footer>
      </div>
    </div>
  );
}
