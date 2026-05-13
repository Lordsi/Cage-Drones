"use client";

import { Suspense, useRef, useState, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";

function DroneModel({ hovered }: { hovered: boolean }) {
  const { scene } = useGLTF("/models/drone.glb");
  const groupRef = useRef<THREE.Group>(null);
  const clock = useRef(0);
  const tiltTarget = useRef({ x: 0, z: 0 });
  const currentTilt = useRef({ x: 0, z: 0 });

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 3 / maxDim;
    scene.scale.setScalar(scale);

    const center = box.getCenter(new THREE.Vector3());
    scene.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }, [scene]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    clock.current += delta;

    const rotSpeed = hovered ? 0.5 : 0.2;
    groupRef.current.rotation.y += delta * rotSpeed;

    const floatAmp = hovered ? 0.15 : 0.06;
    const floatFreq = hovered ? 2.5 : 1.4;
    groupRef.current.position.y = Math.sin(clock.current * floatFreq) * floatAmp;

    if (hovered) {
      const mx = (state.mouse.x * Math.PI) / 16;
      const mz = (state.mouse.y * Math.PI) / 16;
      tiltTarget.current = { x: -mz, z: mx };
    } else {
      tiltTarget.current = { x: 0, z: 0 };
    }

    currentTilt.current.x = THREE.MathUtils.lerp(
      currentTilt.current.x,
      tiltTarget.current.x,
      0.04
    );
    currentTilt.current.z = THREE.MathUtils.lerp(
      currentTilt.current.z,
      tiltTarget.current.z,
      0.04
    );
    groupRef.current.rotation.x = currentTilt.current.x;
    groupRef.current.rotation.z = currentTilt.current.z;
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

function Lights({ hovered }: { hovered: boolean }) {
  const keyRef = useRef<THREE.SpotLight>(null);
  const rimRef = useRef<THREE.SpotLight>(null);

  useFrame(() => {
    if (keyRef.current) {
      keyRef.current.intensity = THREE.MathUtils.lerp(
        keyRef.current.intensity,
        hovered ? 2.2 : 1.2,
        0.05
      );
    }
    if (rimRef.current) {
      rimRef.current.intensity = THREE.MathUtils.lerp(
        rimRef.current.intensity,
        hovered ? 1.0 : 0.4,
        0.05
      );
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <spotLight
        ref={keyRef}
        position={[5, 8, 5]}
        intensity={1.2}
        angle={0.5}
        penumbra={0.8}
        color="#00adef"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <spotLight
        ref={rimRef}
        position={[-5, 4, -4]}
        intensity={0.4}
        angle={0.6}
        penumbra={1}
        color="#6699ff"
      />
      <directionalLight position={[0, 6, 2]} intensity={0.5} color="#fff8ee" />
      <pointLight position={[3, -1, 3]} intensity={0.2} color="#00adef" />
    </>
  );
}

function Loader() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 2;
      ref.current.rotation.x += delta * 0.5;
    }
  });
  return (
    <mesh ref={ref}>
      <octahedronGeometry args={[0.35, 0]} />
      <meshStandardMaterial color="#00adef" wireframe />
    </mesh>
  );
}

function SceneContent({ hovered }: { hovered: boolean }) {
  const { gl } = useThree();

  useEffect(() => {
    gl.domElement.style.cursor = hovered ? "grab" : "default";
  }, [hovered, gl.domElement.style]);

  return (
    <>
      <Lights hovered={hovered} />

      <Suspense fallback={<Loader />}>
        <DroneModel hovered={hovered} />
      </Suspense>

      <ContactShadows
        position={[0, -1.3, 0]}
        opacity={0.3}
        scale={10}
        blur={2.5}
        far={5}
      />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 2.1}
        rotateSpeed={0.6}
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
      onTouchStart={onEnter}
      onTouchEnd={onLeave}
    >
      <Canvas
        camera={{ position: [4.5, 2.5, 4.5], fov: 38 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
        dpr={[1, 2]}
        shadows
      >
        <SceneContent hovered={hovered} />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/models/drone.glb");
