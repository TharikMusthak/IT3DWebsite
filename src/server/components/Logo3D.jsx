import { useRef, useEffect } from 'react';
import loadThree from '../utils/loadThree';

export default function Logo3D({ accent, size = 'normal', onClick }) {
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
      const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 50);
      camera.position.z = 2.8;

      const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(accent), wireframe: true, transparent: true, opacity: 0.85 });
      const matSolid = new THREE.MeshBasicMaterial({ color: new THREE.Color(accent), transparent: true, opacity: 0.12 });

      const topBar = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.22, 0.18), mat);
      topBar.position.set(0, 0.55, 0);
      scene.add(topBar);

      const topBarSolid = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.22, 0.18), matSolid);
      topBarSolid.position.set(0, 0.55, 0);
      scene.add(topBarSolid);

      const diagGroup = new THREE.Group();
      const diag = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.18, 0.18), mat);
      diag.rotation.z = -Math.atan2(1.2, 1.4);
      diagGroup.add(diag);
      scene.add(diagGroup);

      const botBar = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.22, 0.18), mat);
      botBar.position.set(0, -0.55, 0);
      scene.add(botBar);

      const botBarSolid = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.22, 0.18), matSolid);
      botBarSolid.position.set(0, -0.55, 0);
      scene.add(botBarSolid);

      const ringGeo = new THREE.TorusGeometry(0.85, 0.025, 8, 64);
      const ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(accent), transparent: true, opacity: 0.35 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI * 0.3;
      scene.add(ring);

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