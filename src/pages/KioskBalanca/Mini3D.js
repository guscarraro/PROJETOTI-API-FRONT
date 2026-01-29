import React, { useEffect, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Line } from "@react-three/drei";
import * as THREE from "three";

function Box3D({ w, h, l }) {
  const ww = Math.max(0, Number(w || 0));
  const hh = Math.max(0, Number(h || 0));
  const ll = Math.max(0, Number(l || 0));

  const any = ww > 0 || hh > 0 || ll > 0;
  const safeW = any ? ww : 120;
  const safeH = any ? hh : 120;
  const safeL = any ? ll : 120;

  const max = Math.max(safeW, safeH, safeL, 1);
  const sx = safeW / max;
  const sy = safeH / max;
  const sz = safeL / max;

  // Tudo no positivo (0..sx, 0..sy, 0..sz)
  const posX = sx / 2;
  const posY = sy / 2;
  const posZ = sz / 2;

  return (
    <mesh position={[posX, posY, posZ]} castShadow receiveShadow>
      <boxGeometry args={[sx, sy, sz]} />
      <meshStandardMaterial metalness={0.35} roughness={0.35} color="#60a5fa" />
    </mesh>
  );
}

function AxesWithArrows({
  size = 1.6,
  lineWidth = 3.5,
  arrowRadius = 0.05,
  arrowHeight = 0.14,
}) {
  // cores
  const colX = "#f59e0b"; // laranja/amarelo
  const colY = "#22c55e"; // verde
  const colZ = "#3b82f6"; // azul

  // Sempre por cima do grid
  const renderOrder = 50;

  const matConeX = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: colX,
        depthTest: false,
        depthWrite: false,
      }),
    []
  );
  const matConeY = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: colY,
        depthTest: false,
        depthWrite: false,
      }),
    []
  );
  const matConeZ = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: colZ,
        depthTest: false,
        depthWrite: false,
      }),
    []
  );

  // geometrias (reutiliza)
  const coneGeom = useMemo(
    () => new THREE.ConeGeometry(arrowRadius, arrowHeight, 18),
    [arrowRadius, arrowHeight]
  );

  // posição das setas (na ponta)
  const xTip = [size, 0, 0];
  const yTip = [0, size, 0];
  const zTip = [0, 0, size];

  return (
    <>
      {/* Linhas grossas (sempre por cima do grid) */}
      <Line
        points={[
          [0, 0, 0],
          [size, 0, 0],
        ]}
        color={colX}
        lineWidth={lineWidth}
        depthTest={false}
        depthWrite={false}
        renderOrder={renderOrder}
      />
      <Line
        points={[
          [0, 0, 0],
          [0, size, 0],
        ]}
        color={colY}
        lineWidth={lineWidth}
        depthTest={false}
        depthWrite={false}
        renderOrder={renderOrder}
      />
      <Line
        points={[
          [0, 0, 0],
          [0, 0, size],
        ]}
        color={colZ}
        lineWidth={lineWidth}
        depthTest={false}
        depthWrite={false}
        renderOrder={renderOrder}
      />

      {/* Setas (cones) - sempre por cima */}
      {/* X: cone aponta em +X => gira -90° no Z */}
      <mesh
        geometry={coneGeom}
        material={matConeX}
        position={xTip}
        rotation={[0, 0, -Math.PI / 2]}
        renderOrder={renderOrder}
      />

      {/* Y: cone já aponta em +Y por padrão */}
      <mesh
        geometry={coneGeom}
        material={matConeY}
        position={yTip}
        rotation={[0, 0, 0]}
        renderOrder={renderOrder}
      />

      {/* Z: cone aponta em +Z => gira +90° no X */}
      <mesh
        geometry={coneGeom}
        material={matConeZ}
        position={zTip}
        rotation={[Math.PI / 2, 0, 0]}
        renderOrder={renderOrder}
      />
    </>
  );
}

export default function Mini3D({ w, h, l }) {
  const controlsRef = useRef(null);

  const { sx, sy, sz } = useMemo(() => {
    const ww = Math.max(0, Number(w || 0));
    const hh = Math.max(0, Number(h || 0));
    const ll = Math.max(0, Number(l || 0));

    const any = ww > 0 || hh > 0 || ll > 0;
    const safeW = any ? ww : 120;
    const safeH = any ? hh : 120;
    const safeL = any ? ll : 120;

    const max = Math.max(safeW, safeH, safeL, 1);
    return { sx: safeW / max, sy: safeH / max, sz: safeL / max };
  }, [w, h, l]);

  // centro do cubo (agora no positivo)
  const target = useMemo(() => [sx / 2, sy / 2, sz / 2], [sx, sy, sz]);

  useEffect(() => {
    if (!controlsRef.current) return;
    controlsRef.current.target.set(target[0], target[1], target[2]);
    controlsRef.current.update();
  }, [target]);

  return (
    <Canvas
      camera={{ position: [2.4, 1.8, 3.2], fov: 45 }}
      shadows
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <color attach="background" args={["#0b1020"]} />

      <ambientLight intensity={0.55} />
      <directionalLight
        position={[4, 6, 4]}
        intensity={1}
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
      />

      {/* Grid (fica “abaixo” dos eixos pelo depthTest/renderOrder) */}
      {/* size 4 => half 2; pos [2,0,2] => X/Z ficam em 0..4 */}
      <gridHelper args={[4, 16, "#1f2a44", "#152033"]} position={[2, 0, 2]} />

      {/* Eixos por cima, grossos, com setas */}
      <AxesWithArrows size={1.6} lineWidth={2} arrowRadius={0.06} arrowHeight={0.16} />

      <Box3D w={w} h={h} l={l} />

      <OrbitControls
        ref={controlsRef}
        enableZoom={false}
        enablePan={false}
        minAzimuthAngle={-Math.PI / 3}
        maxAzimuthAngle={Math.PI / 3}
        minPolarAngle={0.25}
        maxPolarAngle={1.25}
      />
    </Canvas>
  );
}
