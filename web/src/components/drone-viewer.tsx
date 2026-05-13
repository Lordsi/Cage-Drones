"use client";

import { Suspense, useRef, useEffect, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useFBX, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

const GOLD = new THREE.Color("#c9a227");
const BLACK = new THREE.Color("#0a0a0a");

function DroneModel({ hovered }: { hovered: boolean }) {
  const fbx = useFBX("/models/drone.fbx");
  const groupRef = useRef<THREE.Group>(null);
  const clock = useRef(0);

  useEffect(() => {
    fbx.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const name = mesh.name.toLowerCase();

        const isAccent =
          name.includes("propel") ||
          name.includes("blade") ||
          name.includes("rotor") ||
          name.includes("motor") ||
          name.includes("arm") ||
          name.includes("leg") ||
          name.includes("land") ||
          name.includes("ring") ||
          name.includes("light") ||
          name.includes("trim") ||
          name.includes("detail");

        mesh.material = new THREE.MeshPhysicalMaterial({
          color: isAccent ? GOLD : BLACK,
          metalness: isAccent ? 0.9 : 0.5,
          roughness: isAccent ? 0.2 : 0.5,
          clearcoat: isAccent ? 0 : 0.3,
          clearcoatRoughness: 0.4,
        });

        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });

    const box = new THREE.Box3().setFromObject(fbx);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2.8 / maxDim;
    fbx.scale.setScalar(scale);

    const center = box.getCenter(new THREE.Vector3());
    fbx.position.set(
      -center.x * scale,
      -center.y * scale,
      -center.z * scale
    );
  }, [fbx]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    clock.current += delta;

    const rotSpeed = hovered ? 0.6 : 0.25;
    groupRef.current.rotation.y += delta * rotSpeed;

    const floatAmp = hovered ? 0.12 : 0.06;
    const floatSpeed = hovered ? 2.5 : 1.5;
    groupRef.current.position.y =
      Math.sin(clock.current * floatSpeed) * floatAmp;
  });

  return (
    <group ref={groupRef}>
      <primitive object={fbx} />
    </group>
  );
}

function GoldRimLight({ hovered }: { hovered: boolean }) {
  const ref = useRef<THREE.SpotLight>(null);

  useFrame(() => {
    if (ref.current) {
      ref.current.intensity = THREE.MathUtils.lerp(
        ref.current.intensity,
        hovered ? 2.0 : 1.2,
        0.05
      );
    }
  });

  return (
    <spotLight
      ref={ref}
      position={[5, 8, 5]}
      intensity={1.2}
      angle={0.5}
      penumbra={0.8}
      color="#c9a227"
      castShadow
    />
  );
}

function Loader() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 2;
  });
  return (
    <mesh ref={ref}>
      <octahedronGeometry args={[0.3, 0]} />
      <meshStandardMaterial color="#c9a227" wireframe />
    </mesh>
  );
}

function Scene({ hovered }: { hovered: boolean }) {
  const { gl } = useThree();

  useEffect(() => {
    gl.domElement.style.cursor = hovered ? "grab" : "default";
  }, [hovered, gl.domElement.style]);

  return (
    <>
      <ambientLight intensity={0.35} />
      <GoldRimLight hovered={hovered} />
      <spotLight
        position={[-4, 3, -3]}
        intensity={0.5}
        angle={0.6}
        penumbra={1}
        color="#4488ff"
      />
      <directionalLight position={[0, 5, 0]} intensity={0.4} color="#fff5e0" />

      <Suspense fallback={<Loader />}>
        <DroneModel hovered={hovered} />
      </Suspense>

      <ContactShadows
        position={[0, -1.2, 0]}
        opacity={0.35}
        scale={8}
        blur={2.5}
        far={4}
      />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.2}
        rotateSpeed={0.5}
        dampingFactor={0.08}
        enableDamping
      />
    </>
  );
}

export function DroneViewer() {
  const [hovered, setHovered] = useState(false);

  const onEnter = useCallback(() => setHovered(true), []);
  const onLeave = useCallback(() => setHovered(false), []);

  return (
    <div
      className="drone-canvas-wrap"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <Canvas
        camera={{ position: [4, 2.5, 4], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
        dpr={[1, 2]}
      >
        <Scene hovered={hovered} />
      </Canvas>
    </div>
  );
}
