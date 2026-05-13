"use client";

import { Suspense, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useFBX, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

const GOLD = new THREE.Color("#c9a227");
const BLACK = new THREE.Color("#0a0a0a");

function DroneModel() {
  const fbx = useFBX("/models/drone.fbx");
  const groupRef = useRef<THREE.Group>(null);

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

        mesh.material = new THREE.MeshStandardMaterial({
          color: isAccent ? GOLD : BLACK,
          metalness: isAccent ? 0.85 : 0.4,
          roughness: isAccent ? 0.25 : 0.6,
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
      -center.y * scale + 0.2,
      -center.z * scale
    );
  }, [fbx]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={fbx} />
    </group>
  );
}

function Loader() {
  return (
    <mesh>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshStandardMaterial color="#c9a227" wireframe />
    </mesh>
  );
}

export function DroneViewer() {
  return (
    <div className="drone-canvas-wrap">
      <Canvas
        camera={{ position: [4, 2.5, 4], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.3} />
        <spotLight
          position={[5, 8, 5]}
          intensity={1.2}
          angle={0.5}
          penumbra={0.8}
          color="#c9a227"
          castShadow
        />
        <spotLight
          position={[-4, 3, -3]}
          intensity={0.6}
          angle={0.6}
          penumbra={1}
          color="#4488ff"
        />
        <directionalLight position={[0, 5, 0]} intensity={0.4} color="#fff5e0" />

        <Suspense fallback={<Loader />}>
          <DroneModel />
        </Suspense>

        <ContactShadows
          position={[0, -1.2, 0]}
          opacity={0.4}
          scale={8}
          blur={2.5}
          far={4}
        />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2.2}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
}
