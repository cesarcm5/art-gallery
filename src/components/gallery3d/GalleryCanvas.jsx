"use client";

import { useEffect } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { AdaptiveDpr, Preload } from "@react-three/drei";
import GalleryScene from "./GalleryScene";

/**
 * A dropped GPU context (driver reset, long-backgrounded tab, too many live
 * contexts) leaves the room permanently blank, because the browser only fires
 * `webglcontextrestored` if something called preventDefault on the loss.
 * Without this the gallery just goes white and never comes back.
 */
function ContextGuard() {
  const { gl, invalidate } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;
    const onLost = (event) => event.preventDefault();
    const onRestored = () => invalidate();

    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);
    return () => {
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
    };
  }, [gl, invalidate]);

  return null;
}

export default function GalleryCanvas({
  paintings,
  indexRef,
  modeRef,
  closeUpRef,
  onSelect,
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ fov: 46, near: 0.1, far: 120, position: [0, 1.62, 4.15] }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.15,
      }}
      style={{ position: "absolute", inset: 0 }}
    >
      <GalleryScene
        paintings={paintings}
        indexRef={indexRef}
        modeRef={modeRef}
        closeUpRef={closeUpRef}
        onSelect={onSelect}
      />
      <ContextGuard />
      <AdaptiveDpr pixelated />
      <Preload all />
    </Canvas>
  );
}
