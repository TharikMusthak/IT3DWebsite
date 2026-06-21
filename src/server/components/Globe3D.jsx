/* ══════════════════════════════════════════════
    ✦ 3D GLOBE (hero background)
    ══════════════════════════════════════════════ */
  import { useState, useRef, useEffect } from 'react';
 import loadThree from '../utils/loadThree';


export default function Globe3D({ accent }) {
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

      const _qX = new THREE.Quaternion();
      const _qY = new THREE.Quaternion();
      const _axisX = new THREE.Vector3(1, 0, 0);
      const _axisY = new THREE.Vector3(0, 1, 0);

      let rotX = 0, rotY = 0;
      let velX = 0, velY = 0;
      let isDragging = false, lastX = 0, lastY = 0;

      const DAMPING         = 0.92;
      const DRAG_SENSITIVITY = 0.005;
      const AUTO_SPEED      = 0.0018;

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
          velX *= DAMPING;
          velY *= DAMPING;
          rotX += velX;
          rotY += velY;
        }

        rotY += AUTO_SPEED;

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