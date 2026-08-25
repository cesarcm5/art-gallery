"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { LAMP_Y, LAMP_Z, WALL_H, HANG_HEIGHT } from "./constants";
import { lampAim } from "./closeUpLayout";
import { paintingSize } from "./sizing";

/**
 * Minimalist ceiling track lamp: a thin drop rod, a slim cylindrical head
 * tilted at the canvas, and a warm lens on its underside. Positions come from
 * constants.js, so the emitted light always originates at the visible fixture.
 *
 * `warmth` gives each fixture a slightly different lamp age, and `phase`
 * offsets a very slow breathe so the room never looks digitally uniform.
 */
export default function TrackLamp({
  x = 0,
  index = 0,
  indexRef,
  closeUpRef,
  painting,
  warmth = 0,
  phase = 0,
}) {
  const lensRef = useRef(null);

  const tiltRef = useRef(null); // pitch: down and back toward the wall
  const swingRef = useRef(null); // yaw: sideways, along the wall

  /**
   * Aims the head at a point on the wall.
   *
   * The cylinder's face is its local -Y. Swinging by `a` about Z and then
   * tilting by `b` about X sends that face to
   * (sin a, -cos a cos b, -cos a sin b) — so the two angles fall straight out
   * of the direction we want. The groups are nested tilt-outside-swing so the
   * rotations compose in that order.
   */
  const anglesFor = (aimX, aimY) => {
    const dx = aimX;
    const dy = aimY - (LAMP_Y - HANG_HEIGHT);
    const dz = -LAMP_Z;
    const len = Math.hypot(dx, dy, dz) || 1;

    const a = Math.asin(THREE.MathUtils.clamp(dx / len, -1, 1));
    const cosA = Math.cos(a) || 1e-4;
    const b = Math.asin(THREE.MathUtils.clamp(-dz / len / cosA, -1, 1));
    return { a, b };
  };

  const rest = useMemo(() => anglesFor(0, 0), []);

  const lampColor = useMemo(
    () => new THREE.Color().setHSL(0.09, 0.42 + warmth * 0.1, 0.62),
    [warmth]
  );

  useFrame((state, delta) => {
    if (!lensRef.current) return;

    // The bulb matches its own light: only the work on screen is switched on.
    const lit = indexRef
      ? Math.round(indexRef.current) === index
      : true;

    // Swing the head over to the didactic while the work is in close-up.
    if (tiltRef.current && swingRef.current) {
      const aspect = state.size.width / Math.max(state.size.height, 1);
      const aim =
        painting && lit
          ? lampAim(
              paintingSize(painting),
              state.camera.fov,
              aspect,
              !!closeUpRef?.current
            )
          : { x: 0, y: 0 };

      const { a, b } = anglesFor(aim.x, aim.y);
      swingRef.current.rotation.z = THREE.MathUtils.damp(
        swingRef.current.rotation.z,
        a,
        3.2,
        delta
      );
      tiltRef.current.rotation.x = THREE.MathUtils.damp(
        tiltRef.current.rotation.x,
        b,
        3.2,
        delta
      );
    }

    // A slow, shallow drift — filament warmth rather than a flicker effect.
    const t = state.clock.elapsedTime;
    const breathe = 1 + Math.sin(t * 0.6 + phase) * 0.035 +
      Math.sin(t * 0.23 + phase * 1.7) * 0.02;

    lensRef.current.material.emissiveIntensity = THREE.MathUtils.damp(
      lensRef.current.material.emissiveIntensity,
      (lit ? 2.6 : 0.06) * breathe,
      6,
      delta
    );
  });

  return (
    <group position={[x, LAMP_Y, LAMP_Z]}>
      {/* Drop rod up to the ceiling */}
      <mesh position={[0, (WALL_H - LAMP_Y) / 2, 0]}>
        <cylinderGeometry args={[0.012, 0.012, WALL_H - LAMP_Y, 10]} />
        <meshStandardMaterial color="#1b1a17" roughness={0.5} metalness={0.7} />
      </mesh>

      {/* Ceiling rose */}
      <mesh position={[0, WALL_H - LAMP_Y - 0.01, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.02, 16]} />
        <meshStandardMaterial color="#1b1a17" roughness={0.55} metalness={0.6} />
      </mesh>

      {/* Head — a plain tube, aimed at whatever the lamp is lighting */}
      <group ref={tiltRef} rotation={[rest.b, 0, 0]}>
        <group ref={swingRef} rotation={[0, 0, rest.a]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.045, 0.052, 0.22, 20, 1, true]} />
          <meshStandardMaterial
            color="#232120"
            roughness={0.42}
            metalness={0.78}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Warm lens at the mouth */}
        <mesh ref={lensRef} position={[0, -0.108, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.043, 20]} />
          <meshStandardMaterial
            color={lampColor}
            emissive={lampColor}
            emissiveIntensity={2.6}
            toneMapped={false}
          />
        </mesh>

        {/* Cap */}
        <mesh position={[0, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.045, 20]} />
          <meshStandardMaterial color="#1b1a17" roughness={0.5} metalness={0.7} />
        </mesh>
        </group>
      </group>
    </group>
  );
}
