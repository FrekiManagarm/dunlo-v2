"use client";

import { memo, useEffect, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

const SURFACE = new THREE.Color("rgb(13, 13, 15)");
const GRAPHITE = new THREE.Color("rgb(31, 31, 34)");
const MUTED = new THREE.Color("rgb(82, 82, 91)");

function disposeMaterial(material: THREE.Material | THREE.Material[]) {
  if (Array.isArray(material)) {
    material.forEach((item) => item.dispose());
    return;
  }
  material.dispose();
}

function seededRandom(seed: number) {
  const next = Math.sin(seed) * 10000;
  return next - Math.floor(next);
}

function makeCardTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 320;
  const context = canvas.getContext("2d");
  if (!context) return null;

  context.fillStyle = "rgb(13, 13, 15)";
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 24; y < canvas.height; y += 18) {
    context.strokeStyle = y % 36 === 0 ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.025)";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(28, y);
    context.lineTo(canvas.width - 28, y);
    context.stroke();
  }

  for (let index = 0; index < 900; index += 1) {
    const shade = 20 + seededRandom(index * 4.91) * 36;
    context.fillStyle = `rgba(${shade},${shade},${shade + 2},0.16)`;
    context.fillRect(
      seededRandom(index * 2.17) * canvas.width,
      seededRandom(index * 3.43) * canvas.height,
      1,
      1,
    );
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function makeLine(
  width: number,
  x: number,
  y: number,
  material: THREE.Material,
  z = 0.145,
) {
  const mesh = new THREE.Mesh(
    new RoundedBoxGeometry(width, 0.035, 0.028, 3, 0.018),
    material,
  );
  mesh.position.set(x, y, z);
  return mesh;
}

function RecoveryOrbSceneComponent() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0x09090b, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 80);
    camera.position.set(0.15, 0.12, 9.6);

    const accent = new THREE.Color(
      getComputedStyle(document.documentElement)
        .getPropertyValue("--dunlo-accent")
        .trim(),
    );

    const root = new THREE.Group();
    root.position.set(0.32, 0.02, 0);
    root.rotation.set(-0.42, -0.52, 0.1);
    root.scale.setScalar(1.02);
    scene.add(root);

    scene.add(new THREE.AmbientLight(0xffffff, 0.58));

    const keyLight = new THREE.DirectionalLight(0xffffff, 4.2);
    keyLight.position.set(-3.4, 4.8, 5.8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.65);
    rimLight.position.set(4.8, 0.2, -3.8);
    scene.add(rimLight);

    const accentLight = new THREE.PointLight(accent, 1.7, 16);
    accentLight.position.set(-1.8, -1.6, 3.8);
    scene.add(accentLight);

    const cardTexture = makeCardTexture();
    const cardMaterial = new THREE.MeshPhysicalMaterial({
      color: SURFACE,
      map: cardTexture,
      roughness: 0.64,
      metalness: 0.18,
      clearcoat: 0.78,
      clearcoatRoughness: 0.42,
    });
    const backCardMaterial = new THREE.MeshPhysicalMaterial({
      color: GRAPHITE,
      roughness: 0.74,
      metalness: 0.12,
      clearcoat: 0.3,
      transparent: true,
      opacity: 0.82,
    });
    const edgeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.06,
      wireframe: true,
    });
    const mutedMaterial = new THREE.MeshPhysicalMaterial({
      color: MUTED,
      roughness: 0.72,
      metalness: 0.18,
      transparent: true,
      opacity: 0.46,
    });
    const accentMaterial = new THREE.MeshPhysicalMaterial({
      color: accent,
      emissive: accent,
      emissiveIntensity: 0.55,
      roughness: 0.36,
      metalness: 0.2,
      clearcoat: 0.45,
    });
    const glassAccentMaterial = new THREE.MeshPhysicalMaterial({
      color: accent,
      emissive: accent,
      emissiveIntensity: 0.38,
      roughness: 0.3,
      metalness: 0.16,
      transparent: true,
      opacity: 0.7,
    });

    const cardGroup = new THREE.Group();
    root.add(cardGroup);

    const cardGeometry = new RoundedBoxGeometry(3.72, 2.26, 0.2, 9, 0.14);
    const edgeGeometry = new RoundedBoxGeometry(3.77, 2.31, 0.205, 7, 0.15);

    [
      { position: new THREE.Vector3(-0.22, -0.24, -0.26), rotation: 0.08 },
      { position: new THREE.Vector3(0.18, 0.2, -0.14), rotation: -0.08 },
    ].forEach(({ position, rotation }) => {
      const backCard = new THREE.Mesh(cardGeometry, backCardMaterial);
      backCard.position.copy(position);
      backCard.rotation.z = rotation;
      backCard.castShadow = true;
      backCard.receiveShadow = true;
      cardGroup.add(backCard);
    });

    const mainCard = new THREE.Mesh(cardGeometry, cardMaterial);
    mainCard.position.set(0, 0, 0.04);
    mainCard.castShadow = true;
    mainCard.receiveShadow = true;
    cardGroup.add(mainCard);

    const mainEdge = new THREE.Mesh(edgeGeometry, edgeMaterial);
    mainEdge.position.copy(mainCard.position);
    cardGroup.add(mainEdge);

    const chip = new THREE.Mesh(
      new RoundedBoxGeometry(0.48, 0.36, 0.045, 4, 0.045),
      mutedMaterial,
    );
    chip.position.set(-1.24, 0.58, 0.18);
    cardGroup.add(chip);

    [-0.1, 0.1].forEach((offset) => {
      const chipLine = new THREE.Mesh(
        new RoundedBoxGeometry(0.36, 0.025, 0.02, 2, 0.012),
        edgeMaterial,
      );
      chipLine.position.set(-1.24, 0.58 + offset, 0.215);
      cardGroup.add(chipLine);
    });

    const lineGroup = new THREE.Group();
    cardGroup.add(lineGroup);
    [
      makeLine(1.35, 0.48, 0.66, mutedMaterial),
      makeLine(1.06, 0.34, 0.42, mutedMaterial),
      makeLine(1.52, 0.55, 0.18, mutedMaterial),
      makeLine(0.92, -0.72, -0.44, mutedMaterial),
      makeLine(1.28, 0.5, -0.68, glassAccentMaterial, 0.15),
    ].forEach((line) => lineGroup.add(line));

    const envelope = new THREE.Group();
    envelope.position.set(-1.18, -0.58, 0.2);
    cardGroup.add(envelope);

    const envelopeBase = new THREE.Mesh(
      new RoundedBoxGeometry(0.78, 0.48, 0.04, 4, 0.05),
      mutedMaterial,
    );
    envelope.add(envelopeBase);

    const foldGeometry = new RoundedBoxGeometry(0.48, 0.025, 0.018, 2, 0.012);
    [
      { x: -0.16, y: 0.04, rotation: 0.5 },
      { x: 0.16, y: 0.04, rotation: -0.5 },
      { x: -0.16, y: -0.08, rotation: -0.5 },
      { x: 0.16, y: -0.08, rotation: 0.5 },
    ].forEach(({ x, y, rotation }) => {
      const fold = new THREE.Mesh(foldGeometry, edgeMaterial);
      fold.position.set(x, y, 0.04);
      fold.rotation.z = rotation;
      envelope.add(fold);
    });

    const orbitGroup = new THREE.Group();
    orbitGroup.position.set(0.1, 0, 0.1);
    root.add(orbitGroup);

    const orbit = new THREE.Mesh(
      new THREE.TorusGeometry(2.26, 0.012, 10, 140),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.12,
      }),
    );
    orbit.rotation.z = -0.25;
    orbitGroup.add(orbit);

    const recoveryArc = new THREE.Mesh(
      new THREE.TorusGeometry(2.28, 0.026, 12, 96, Math.PI * 1.34),
      accentMaterial,
    );
    recoveryArc.rotation.z = 0.38;
    orbitGroup.add(recoveryArc);

    const movingSignal = new THREE.Mesh(
      new THREE.SphereGeometry(0.095, 32, 16),
      accentMaterial,
    );
    orbitGroup.add(movingSignal);

    const beaconGeometry = new THREE.SphereGeometry(0.055, 24, 12);
    const beacons = [
      new THREE.Vector3(-1.95, 0.72, 0.12),
      new THREE.Vector3(1.84, -0.52, 0.12),
      new THREE.Vector3(0.32, -1.54, 0.12),
    ].map((position) => {
      const beacon = new THREE.Mesh(beaconGeometry, glassAccentMaterial);
      beacon.position.copy(position);
      orbitGroup.add(beacon);
      return beacon;
    });

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 4.4),
      new THREE.ShadowMaterial({ color: 0x09090b, opacity: 0.28 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0.2, -2.16, 0.45);
    floor.receiveShadow = true;
    scene.add(floor);

    const dustGeometry = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(150 * 3);
    for (let index = 0; index < dustPositions.length; index += 3) {
      dustPositions[index] = (seededRandom(index * 1.71) - 0.5) * 5.8;
      dustPositions[index + 1] = (seededRandom(index * 2.63) - 0.5) * 3.6;
      dustPositions[index + 2] = (seededRandom(index * 3.89) - 0.5) * 3.2;
    }
    dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    const dust = new THREE.Points(
      dustGeometry,
      new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.01,
        transparent: true,
        opacity: 0.1,
      }),
    );
    root.add(dust);

    const pointer = new THREE.Vector2(0, 0);
    const easedPointer = new THREE.Vector2(0, 0);

    const resize = () => {
      const { width, height } = parent.getBoundingClientRect();
      const safeHeight = Math.max(height, 420);
      const isNarrow = width < 640;
      root.position.set(isNarrow ? 0.18 : 0.32, isNarrow ? 0.7 : 0.02, 0);
      root.scale.setScalar(isNarrow ? 0.82 : 1.02);
      camera.position.z = isNarrow ? 10.4 : 9.6;
      renderer.setSize(width, safeHeight, false);
      camera.aspect = width / safeHeight;
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(parent);
    resize();

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * -2;
    };
    canvas.addEventListener("pointermove", onPointerMove, { passive: true });

    let raf = 0;
    let time = 0;
    let reducedMotion = false;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionPreference = () => {
      reducedMotion = motionQuery.matches;
    };
    handleMotionPreference();
    motionQuery.addEventListener("change", handleMotionPreference);

    const render = () => {
      raf = requestAnimationFrame(render);
      time += reducedMotion ? 0.001 : 0.008;

      easedPointer.lerp(pointer, 0.04);
      root.rotation.y = -0.52 + easedPointer.x * 0.14 + Math.sin(time * 0.3) * 0.026;
      root.rotation.x = -0.42 + easedPointer.y * 0.09 + Math.cos(time * 0.24) * 0.02;
      root.rotation.z = 0.1 + Math.sin(time * 0.22) * 0.014;
      cardGroup.position.y = Math.sin(time * 0.5) * 0.04;
      orbitGroup.rotation.z = Math.sin(time * 0.32) * 0.04;

      const signalAngle = time * 1.12 + 0.45;
      movingSignal.position.set(
        Math.cos(signalAngle) * 2.28,
        Math.sin(signalAngle) * 2.28,
        0.13,
      );

      beacons.forEach((beacon, index) => {
        const pulse = 1 + Math.sin(time * 1.4 + index * 1.7) * 0.18;
        beacon.scale.setScalar(pulse);
      });

      dust.rotation.y -= reducedMotion ? 0.0001 : 0.0005;
      renderer.render(scene, camera);
    };

    render();

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointermove", onPointerMove);
      resizeObserver.disconnect();
      motionQuery.removeEventListener("change", handleMotionPreference);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
          object.geometry.dispose();
          disposeMaterial(object.material);
        }
      });
      cardTexture?.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 h-full w-full touch-none"
    />
  );
}

export const RecoveryOrbScene = memo(RecoveryOrbSceneComponent);
