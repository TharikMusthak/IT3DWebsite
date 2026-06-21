
  import { useState, useRef, useEffect } from 'react';

import loadThree from '../utils/loadThree';

export default function AIBrain3D({ accent }) {
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
      const W = el.offsetWidth;
      const H = el.offsetHeight;

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
      });

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(W, H);
      renderer.setClearColor(0x000000, 0);

      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();

      const camera = new THREE.PerspectiveCamera(
        50,
        W / H,
        0.1,
        100
      );

      camera.position.z = 3.5;

      const mouse = { x: 0, y: 0 };

      const handleMouseMove = (e) => {
        const rect = el.getBoundingClientRect();

        mouse.x =
          ((e.clientX - rect.left) / rect.width) * 2 - 1;

        mouse.y =
          -((e.clientY - rect.top) / rect.height) * 2 + 1;
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

      const nodeMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(accent),
        transparent: true,
        opacity: 0.9
      });

      for (let i = 0; i < nodeCount; i++) {
        const lobe = i < nodeCount * 0.5 ? -0.5 : 0.5;

        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const r = 0.4 + Math.random() * 0.55;

        const x =
          lobe +
          r * Math.sin(phi) * Math.cos(theta) * 1.3;

        const y =
          r * Math.sin(phi) * Math.sin(theta) * 0.8;

        const z =
          r * Math.cos(phi) * 0.7;

        const geo = new THREE.SphereGeometry(
          0.018 + Math.random() * 0.015,
          6,
          6
        );

        const mesh = new THREE.Mesh(
          geo,
          nodeMat.clone()
        );

        mesh.position.set(x, y, z);

        mesh.userData = {
          baseX: x,
          baseY: y,
          baseZ: z,
          phase: Math.random() * Math.PI * 2,
          speed: 0.3 + Math.random() * 0.7
        };

        scene.add(mesh);
        nodes.push(mesh);
      }

      const edgeMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(accent),
        transparent: true,
        opacity: 0.12
      });

      nodes.forEach((n, i) => {
        nodes.slice(i + 1).forEach((m) => {
          const dist = n.position.distanceTo(m.position);

          if (dist < 0.38 && Math.random() > 0.55) {
            const pts = [
              n.position.clone(),
              m.position.clone()
            ];

            scene.add(
              new THREE.Line(
                new THREE.BufferGeometry().setFromPoints(pts),
                edgeMat.clone()
              )
            );
          }
        });
      });

      const pGeo = new THREE.BufferGeometry();

      const pPos = new Float32Array(60 * 3);

      for (let i = 0; i < 60; i++) {
        pPos[i * 3] = (Math.random() - 0.5) * 3.2;
        pPos[i * 3 + 1] = (Math.random() - 0.5) * 2.4;
        pPos[i * 3 + 2] = (Math.random() - 0.5) * 1.6;
      }

      pGeo.setAttribute(
        'position',
        new THREE.BufferAttribute(pPos, 3)
      );

      const pMat = new THREE.PointsMaterial({
        color: new THREE.Color(accent),
        size: 0.018,
        transparent: true,
        opacity: 0.5
      });

      scene.add(new THREE.Points(pGeo, pMat));

      let t = 0;

      const animate = () => {
        frameRef.current =
          requestAnimationFrame(animate);

        t += 0.012;

        scene.rotation.y +=
          (mouse.x * 0.5 - scene.rotation.y) * 0.05;

        scene.rotation.x +=
          (mouse.y * 0.3 - scene.rotation.x) * 0.05;

        pointer.x = mouse.x;
        pointer.y = mouse.y;

        raycaster.setFromCamera(pointer, camera);

        const intersects =
          raycaster.intersectObjects(nodes);

        nodes.forEach((n) => {
          const pulse =
            Math.sin(
              t * n.userData.speed +
                n.userData.phase
            ) * 0.012;

          n.position.set(
            n.userData.baseX + pulse,
            n.userData.baseY + pulse * 0.5,
            n.userData.baseZ
          );

          const baseScale =
            1 +
            0.3 *
              Math.abs(
                Math.sin(
                  t * n.userData.speed +
                    n.userData.phase
                )
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
    });

    return () => {
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  useEffect(() => {
    if (mountRef.current?._updateAccent) {
      mountRef.current._updateAccent(accent);
    }
  }, [accent]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div
        ref={mountRef}
        style={{
          width: '100%',
          height: '100%',
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      />
    </div>
  );
}