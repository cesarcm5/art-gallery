"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { HANG_HEIGHT, xForIndex } from "./constants";
import { paintingSize } from "./sizing";
import { makeWallTextTexture } from "./wallTextTexture";
import { closeUpLayout } from "./closeUpLayout";

/**
 * The didactic for whichever work is in close-up, lettered onto the wall to
 * its left.
 *
 * One mesh, retextured as the active work changes, rather than fifteen: a
 * 900x1200 canvas per painting would run to tens of megabytes of texture for
 * panels that are only ever read one at a time.
 */
export default function WallText({ paintings, indexRef, closeUpRef }) {
  const groupRef = useRef(null);
  const meshRef = useRef(null);
  const drawnFor = useRef(-1);
  const drawnBeside = useRef(null);
  const geomRef = useRef(null);

  // The texture is owned here, so the previous one is disposed on every swap
  // and on unmount — canvas textures are not garbage collected on their own.
  useEffect(() => {
    const mesh = meshRef.current;
    return () => {
      const map = mesh?.material?.map;
      if (map) map.dispose();
    };
  }, []);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    const group = groupRef.current;
    if (!mesh || !group) return;

    const index = THREE.MathUtils.clamp(
      Math.round(indexRef.current),
      0,
      paintings.length - 1
    );
    const painting = paintings[index];

    const aspect = state.size.width / Math.max(state.size.height, 1);
    const layout = closeUpLayout(
      paintingSize(painting),
      state.camera.fov,
      aspect
    );

    // Re-letter the wall when the work changes, or when the viewport flips
    // between the beside and beneath arrangements.
    if (drawnFor.current !== index || drawnBeside.current !== layout.beside) {
      const previous = mesh.material.map;
      mesh.material.map = makeWallTextTexture(
        painting,
        layout.beside ? "beside" : "below"
      );
      mesh.material.needsUpdate = true;
      if (previous) previous.dispose();

      drawnFor.current = index;
      drawnBeside.current = layout.beside;

      if (geomRef.current) {
        geomRef.current.dispose();
        geomRef.current = new THREE.PlaneGeometry(layout.panelW, layout.panelH);
        mesh.geometry = geomRef.current;
      }
    }

    group.position.x = xForIndex(index) + layout.panelX;
    group.position.y = HANG_HEIGHT + layout.panelY;

    const wanted = closeUpRef?.current ? 1 : 0;
    mesh.material.opacity = THREE.MathUtils.damp(
      mesh.material.opacity,
      wanted,
      4,
      delta
    );
    mesh.visible = mesh.material.opacity > 0.01;
  });

  return (
    <group ref={groupRef} position={[0, HANG_HEIGHT, 0]}>
      <mesh
        ref={(m) => {
          meshRef.current = m;
          if (m && !geomRef.current) geomRef.current = m.geometry;
        }}
        position={[0, 0, 0.008]}
        visible={false}
      >
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial
          transparent
          opacity={0}
          roughness={0.95}
          metalness={0}
          depthWrite={false}
        />
      </mesh>

    </group>
  );
}
