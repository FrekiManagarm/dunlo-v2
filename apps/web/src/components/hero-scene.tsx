import { useEffect, useRef } from "react";
import * as THREE from "three";

const N = 55;
const SPEED = 0.0013;
const LINK_DIST = 2.1;
const ACCENT = 0x00e87b;

export function HeroScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(52, w / h, 0.1, 100);
    camera.position.set(0, 0, 8);

    // ── Particle data with true Z depth ─────────────────────────────────────
    const pos = new Float32Array(N * 3);
    const vel = new Float32Array(N * 3);

    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 9;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 5;
      vel[i * 3] = (Math.random() - 0.5) * SPEED;
      vel[i * 3 + 1] = (Math.random() - 0.5) * SPEED;
      vel[i * 3 + 2] = (Math.random() - 0.5) * SPEED * 0.25;
    }

    // ── Points (single draw call) ────────────────────────────────────────────
    const ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const ptMat = new THREE.PointsMaterial({
      color: ACCENT,
      size: 0.058,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
    });
    scene.add(new THREE.Points(ptGeo, ptMat));

    // ── Line segments (pre-allocated, zero-GC) ───────────────────────────────
    const maxSegs = (N * (N - 1)) / 2;
    const linePos = new Float32Array(maxSegs * 6);
    const lineAttr = new THREE.BufferAttribute(linePos, 3);
    lineAttr.setUsage(THREE.DynamicDrawUsage);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", lineAttr);
    const lineMat = new THREE.LineBasicMaterial({
      color: ACCENT,
      transparent: true,
      opacity: 0.085,
    });
    scene.add(new THREE.LineSegments(lineGeo, lineMat));

    // ── Wireframe icosahedron (centerpiece — offset right) ───────────────────
    const icoGeo = new THREE.IcosahedronGeometry(2.9, 2);
    const icoMat = new THREE.MeshBasicMaterial({
      color: ACCENT,
      wireframe: true,
      transparent: true,
      opacity: 0.042,
    });
    const ico = new THREE.Mesh(icoGeo, icoMat);
    ico.position.set(2.8, 0.3, -1);
    scene.add(ico);

    let raf: number;
    let t = 0;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      t += 0.0007;

      ico.rotation.y = t * 0.65;
      ico.rotation.x = t * 0.28;

      for (let i = 0; i < N; i++) {
        pos[i * 3] += vel[i * 3];
        pos[i * 3 + 1] += vel[i * 3 + 1];
        pos[i * 3 + 2] += vel[i * 3 + 2];

        if (pos[i * 3] > 6.8 || pos[i * 3] < -6.8) vel[i * 3] *= -1;
        if (pos[i * 3 + 1] > 4.4 || pos[i * 3 + 1] < -4.4) vel[i * 3 + 1] *= -1;
        if (pos[i * 3 + 2] > 2.2 || pos[i * 3 + 2] < -2.2) vel[i * 3 + 2] *= -1;
      }
      ptGeo.attributes.position.needsUpdate = true;

      let seg = 0;
      const linkD2 = LINK_DIST * LINK_DIST;
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = pos[i * 3] - pos[j * 3];
          const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
          const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
          if (dx * dx + dy * dy + dz * dz < linkD2) {
            const b = seg * 6;
            linePos[b] = pos[i * 3];
            linePos[b + 1] = pos[i * 3 + 1];
            linePos[b + 2] = pos[i * 3 + 2];
            linePos[b + 3] = pos[j * 3];
            linePos[b + 4] = pos[j * 3 + 1];
            linePos[b + 5] = pos[j * 3 + 2];
            seg++;
          }
        }
      }
      lineGeo.setDrawRange(0, seg * 2);
      lineGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };
    tick();

    const onResize = () => {
      const nw = canvas.offsetWidth;
      const nh = canvas.offsetHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      ptGeo.dispose();
      ptMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      icoGeo.dispose();
      icoMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    />
  );
}
