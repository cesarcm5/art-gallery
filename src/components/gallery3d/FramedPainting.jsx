"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import { paintingSize, frameForYear, canvasImage } from "./sizing";

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

export default function FramedPainting({ painting, position, onSelect }) {
  const texture = useTexture(canvasImage(painting).src);
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
