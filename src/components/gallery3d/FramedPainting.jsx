"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";

const MAX_H = 1.5;
const MAX_W = 2.1;

/**
 * Museums frame by period rather than hanging everything in matching gilt.
 * Older works get wide ornate gold; the 19th century gets walnut; modern
 * works get a narrow ebonised or pewter profile.
 */
function frameForYear(year) {
  if (year < 1700) {
    return {
      color: "#a9885a",
      metalness: 0.95,
      roughness: 0.3,
      widthScale: 1.25,
      liner: "#3a2c18",
    };
  }
  if (year < 1850) {
    return {
      color: "#b8a07a",
      metalness: 0.9,
      roughness: 0.36,
      widthScale: 1.1,
      liner: "#33291a",
    };
  }
  if (year < 1900) {
    return {
      color: "#5a4230",
      metalness: 0.18,
      roughness: 0.62,
      widthScale: 0.95,
      liner: "#2a2018",
    };
  }
  return {
    color: "#8e8b84",
    metalness: 0.55,
    roughness: 0.45,
    widthScale: 0.75,
    liner: "#15130f",
  };
}

/**
 * Builds a mitred picture-frame profile as an extruded ring: an outer
 * rectangle with a rectangular hole, bevelled so the moulding catches light
 * along its edges the way real gilded wood does.
 */
function useFrameGeometry(width, height, moulding, depth) {
  return useMemo(() => {
    const ow = width + moulding * 2;
    const oh = height + moulding * 2;

    const shape = new THREE.Shape();
    shape.moveTo(-ow / 2, -oh / 2);
    shape.lineTo(ow / 2, -oh / 2);
    shape.lineTo(ow / 2, oh / 2);
    shape.lineTo(-ow / 2, oh / 2);
    shape.closePath();

    const hole = new THREE.Path();
    hole.moveTo(-width / 2, -height / 2);
    hole.lineTo(-width / 2, height / 2);
    hole.lineTo(width / 2, height / 2);
    hole.lineTo(width / 2, -height / 2);
    hole.closePath();
    shape.holes.push(hole);

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelThickness: moulding * 0.32,
      bevelSize: moulding * 0.3,
      bevelOffset: 0,
      bevelSegments: 4,
      curveSegments: 1,
    });
    geo.computeVertexNormals();
    return geo;
  }, [width, height, moulding, depth]);
}

/** Fits a work to the hang, capped by MAX_W/MAX_H. Shared so the wall text
 *  can place itself flush against whatever width this returns. */
export function paintingSize(painting) {
  const { width, height } = painting.images.hero.large;
  const aspect = width / height;
  let h = MAX_H;
  let w = h * aspect;
  if (w > MAX_W) {
    w = MAX_W;
    h = w / aspect;
  }
  const moulding = Math.max(0.075, Math.min(w, h) * 0.085) * frameForYear(painting.year).widthScale;
  return { w, h, moulding };
}

export default function FramedPainting({ painting, position, onSelect }) {
  const texture = useTexture(painting.images.hero.large.src);
  const groupRef = useRef(null);

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  const profile = useMemo(() => frameForYear(painting.year), [painting.year]);
  const { w, h, moulding } = useMemo(() => paintingSize(painting), [painting]);
  const matWidth = moulding * 0.42;

  const frameGeo = useFrameGeometry(w, h, moulding, 0.11);
  const linerGeo = useFrameGeometry(
    w - matWidth * 2,
    h - matWidth * 2,
    matWidth,
    0.03
  );

  return (
    <group ref={groupRef} position={position}>
      {/* Gilded outer moulding */}
      <mesh geometry={frameGeo} position={[0, 0, 0.02]} castShadow receiveShadow>
        <meshStandardMaterial
          color={profile.color}
          metalness={profile.metalness}
          roughness={profile.roughness}
          envMapIntensity={1.15}
        />
      </mesh>

      {/* Ivory mat board, recessed behind the moulding */}
      <mesh position={[0, 0, 0.012]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color="#efece4" roughness={0.94} metalness={0} />
      </mesh>

      {/* Thin dark liner where the mat meets the canvas */}
      <mesh geometry={linerGeo} position={[0, 0, 0.014]}>
        <meshStandardMaterial color={profile.liner} roughness={0.7} metalness={0.25} />
      </mesh>

      {/* The painting itself */}
      <mesh
        position={[0, 0, 0.02]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.();
        }}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "auto")}
      >
        <planeGeometry args={[w - matWidth * 2, h - matWidth * 2]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.82}
          metalness={0.02}
          envMapIntensity={0.35}
          toneMapped
        />
      </mesh>

      {/* Backing board, gives the frame visible thickness against the wall */}
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[w + moulding, h + moulding, 0.04]} />
        <meshStandardMaterial color="#161310" roughness={0.9} />
      </mesh>

    </group>
  );
}
