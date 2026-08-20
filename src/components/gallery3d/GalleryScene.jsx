"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  MeshReflectorMaterial,
} from "@react-three/drei";
import FramedPainting from "./FramedPainting";
import TrackLamp from "./TrackLamp";
import WallText from "./WallText";
import { closeUpLayout } from "./closeUpLayout";
import { paintingSize } from "./FramedPainting";
import {
  SPACING,
  WALL_H,
  HALL_DEPTH,
  HANG_HEIGHT,
  LAMP_Y,
  LAMP_Z,
  xForIndex,
} from "./constants";

export { SPACING };

const CAM_Z = 4.15;
const EYE = 1.62;

/* -------------------------------------------------------------------------
   Camera rig — glides along the hall to centre the active work, the way a
   visitor walks the wall. Damped rather than tweened so that rapid input
   never fights an in-flight animation.
------------------------------------------------------------------------- */
/**
 * Two viewpoints on the same room:
 *
 *  front   — square on to the active work, as the slideshow shows it.
 *  profile — off to the side and near the wall plane, so the hang recedes in
 *            perspective. This is the preview that sits beside the index.
 *
 * The rig damps between whichever is asked for, so navigating between the two
 * routes reads as the camera walking into position rather than a hard cut.
 */
function poseFor(mode, x) {
  if (mode === "profile") {
    return {
      // The canvas renders the full viewport but the index only reveals its
      // left portion, so the aim is swung further down the wall to bring the
      // active work back to the centre of the visible panel.
      pos: new THREE.Vector3(x - 4.2, 1.78, 2.7),
      look: new THREE.Vector3(x + 4.6, HANG_HEIGHT - 0.05, 0),
    };
  }
  return {
    pos: new THREE.Vector3(x, EYE, CAM_Z),
    look: new THREE.Vector3(x, HANG_HEIGHT, 0),
  };
}

/**
 * three.js holds the *vertical* field of view constant, so a portrait viewport
 * narrows the horizontal one and crops the receding wall. Widen the lens as
 * the frame gets taller than it is wide.
 */
function ResponsiveLens() {
  const { camera, size } = useThree();

  useEffect(() => {
    const aspect = size.width / Math.max(size.height, 1);
    camera.fov = aspect < 0.75 ? 70 : aspect < 1.1 ? 58 : 46;
    camera.updateProjectionMatrix();
  }, [camera, size]);

  return null;
}

function CameraRig({ paintings, indexRef, modeRef, closeUpRef }) {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3(0, HANG_HEIGHT, 0));
  const started = useRef(false);

  useFrame((state, delta) => {
    const base = modeRef?.current ?? "front";
    // Close-up overrides the page's viewpoint while it is engaged.
    const mode = closeUpRef?.current && base === "front" ? "closeup" : base;
    const targetX = xForIndex(indexRef.current);

    let pos;
    let lookTarget;

    if (mode === "closeup") {
      // Derived from the work's own size and the live aspect ratio, so the
      // shot frames correctly on a phone and on a wide monitor alike.
      const index = THREE.MathUtils.clamp(
        Math.round(indexRef.current),
        0,
        paintings.length - 1
      );
      const aspect = state.size.width / Math.max(state.size.height, 1);
      const fit = closeUpLayout(
        paintingSize(paintings[index]),
        camera.fov,
        aspect
      );
      pos = new THREE.Vector3(targetX + fit.camX, fit.camY, fit.camZ);
      lookTarget = new THREE.Vector3(targetX + fit.camX, fit.camY, 0);
    } else {
      ({ pos, look: lookTarget } = poseFor(mode, targetX));
    }

    // On a phone the room is seen through a tall slot, so stand back a little
    // and aim less far down the wall — otherwise the run of frames is clipped.
    const narrow = state.size.width / Math.max(state.size.height, 1) < 1.1;
    if (narrow && mode === "profile") {
      pos.z += 1.15;
      pos.x += 0.9;
      lookTarget.x -= 1.4;
    }

    // Pointer parallax, kept subtle and only head-on.
    if (mode === "front") {
      pos.x += state.pointer.x * 0.28;
      pos.y += state.pointer.y * 0.12;
    }

    if (!started.current) {
      camera.position.copy(pos);
      look.current.copy(lookTarget);
      started.current = true;
    } else {
      const l = 2.4;
      camera.position.x = THREE.MathUtils.damp(camera.position.x, pos.x, l, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, pos.y, l, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, pos.z, l, delta);

      look.current.x = THREE.MathUtils.damp(look.current.x, lookTarget.x, l * 1.3, delta);
      look.current.y = THREE.MathUtils.damp(look.current.y, lookTarget.y, l * 1.3, delta);
      look.current.z = THREE.MathUtils.damp(look.current.z, lookTarget.z, l * 1.3, delta);
    }

    camera.lookAt(look.current);
  });

  return null;
}

/* -------------------------------------------------------------------------
   Picture lights — three fixtures covering the active work and its two
   neighbours, instead of one lamp per painting (which would mean 15 shadow
   maps for a scene that only ever shows three works at once). Slots are
   assigned by channel so a step along the wall retires only one lamp.
------------------------------------------------------------------------- */
function PictureLight({ channel, indexRef, count }) {
  const lightRef = useRef(null);
  const target = useMemo(() => new THREE.Object3D(), []);
  const slotRef = useRef(null);

  useEffect(() => {
    if (lightRef.current) lightRef.current.target = target;
  }, [target]);

  const placeAt = (slot) => {
    const x = xForIndex(THREE.MathUtils.clamp(slot, 0, count - 1));
    if (lightRef.current) lightRef.current.position.x = x;
    target.position.x = x;
    target.updateMatrixWorld();
    slotRef.current = slot;
  };

  useFrame((state, delta) => {
    const light = lightRef.current;
    if (!light) return;

    const centre = Math.round(indexRef.current);

    // Each fixture owns every third slot, so stepping one work along only
    // ever retires a single lamp — the other two are already where they
    // belong and simply stay lit.
    let desired = centre - 1;
    for (let s = centre - 1; s <= centre + 1; s += 1) {
      if (((s % 3) + 3) % 3 === channel) {
        desired = s;
        break;
      }
    }

    if (slotRef.current === null) placeAt(desired);

    const relocating = desired !== slotRef.current;
    const offWall = desired < 0 || desired > count - 1;

    const t = state.clock.elapsedTime;
    const phase = slotRef.current * 1.7;
    const breathe =
      1 +
      Math.sin(t * 0.6 + phase) * 0.035 +
      Math.sin(t * 0.23 + phase * 1.7) * 0.02;

    const peak = slotRef.current === centre ? 26 : 12;
    const wanted = relocating || offWall ? 0 : peak * breathe;

    light.intensity = THREE.MathUtils.damp(light.intensity, wanted, 8, delta);

    // Lamps do not travel along the wall. Once this one has dimmed out it
    // reappears above its new work, rather than dragging its pool across
    // everything in between.
    if (relocating && light.intensity < 0.4) placeAt(desired);
  });

  return (
    <>
      <primitive object={target} position={[0, HANG_HEIGHT, 0]} />
      <spotLight
        ref={lightRef}
        position={[0, LAMP_Y, LAMP_Z]}
        angle={0.58}
        penumbra={1}
        distance={8}
        decay={1.35}
        intensity={0}
        color="#ffe9c9"
        // All three cast: with slots assigned by channel, "channel 0" is not
        // reliably the centre work, and toggling castShadow at runtime forces
        // a shader recompile. Smaller maps keep the three affordable.
        castShadow
        shadow-mapSize={[768, 768]}
        shadow-bias={-0.0006}
      />
    </>
  );
}

/* -------------------------------------------------------------------------
   The room itself
------------------------------------------------------------------------- */
function Hall({ count }) {
  const length = count * SPACING + 12;
  const centerX = ((count - 1) * SPACING) / 2;

  return (
    <group>
      {/* Polished floor */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[centerX, 0, HALL_DEPTH / 2 - 2]}
        receiveShadow
      >
        <planeGeometry args={[length, HALL_DEPTH + 8]} />
        <MeshReflectorMaterial
          resolution={512}
          mixBlur={1}
          mixStrength={2.2}
          blur={[420, 110]}
          roughness={0.92}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.3}
          color="#141412"
          metalness={0.58}
          mirror={0.5}
        />
      </mesh>

      {/* Hanging wall */}
      <mesh position={[centerX, WALL_H / 2, -0.06]} receiveShadow>
        <boxGeometry args={[length, WALL_H, 0.12]} />
        <meshStandardMaterial color="#a9a496" roughness={0.97} metalness={0} />
      </mesh>

      {/* Skirting board */}
      <mesh position={[centerX, 0.07, 0.03]}>
        <boxGeometry args={[length, 0.14, 0.05]} />
        <meshStandardMaterial color="#8d8879" roughness={0.85} />
      </mesh>

      {/* Facing wall, behind the viewer — feeds the floor reflection */}
      <mesh
        position={[centerX, WALL_H / 2, HALL_DEPTH]}
        rotation={[0, Math.PI, 0]}
      >
        <planeGeometry args={[length, WALL_H]} />
        <meshStandardMaterial color="#a8a49b" roughness={0.98} />
      </mesh>

      {/* Ceiling */}
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        position={[centerX, WALL_H, HALL_DEPTH / 2 - 2]}
      >
        <planeGeometry args={[length, HALL_DEPTH + 8]} />
        <meshStandardMaterial color="#e6e3dc" roughness={1} />
      </mesh>

      {/* Cornice line where wall meets ceiling */}
      <mesh position={[centerX, WALL_H - 0.08, 0.06]}>
        <boxGeometry args={[length, 0.16, 0.08]} />
        <meshStandardMaterial color="#dedad2" roughness={0.9} />
      </mesh>
    </group>
  );
}

export default function GalleryScene({
  paintings,
  indexRef,
  modeRef,
  closeUpRef,
  onSelect,
}) {
  const count = paintings.length;

  return (
    <>
      <color attach="background" args={["#0f0f0f"]} />
      <fog attach="fog" args={["#12110f", 14, 42]} />

      <ResponsiveLens />
      <CameraRig
        paintings={paintings}
        indexRef={indexRef}
        modeRef={modeRef}
        closeUpRef={closeUpRef}
      />

      {/* Low ambient wash; the spots do the modelling */}
      <ambientLight intensity={0.11} color="#f0e2cc" />
      <hemisphereLight
        args={["#f3e8d6", "#141109", 0.2]}
        position={[0, WALL_H, 0]}
      />

      <PictureLight channel={0} indexRef={indexRef} count={count} />
      <PictureLight channel={1} indexRef={indexRef} count={count} />
      <PictureLight channel={2} indexRef={indexRef} count={count} />

      <Suspense fallback={null}>
        <Hall count={count} />

        {paintings.map((painting, i) => (
          <FramedPainting
            key={painting.slug}
            painting={painting}
            position={[xForIndex(i), HANG_HEIGHT, 0]}
            onSelect={() => onSelect?.(i)}
          />
        ))}

        <WallText
          paintings={paintings}
          indexRef={indexRef}
          closeUpRef={closeUpRef}
        />

        {/* One luminaire per work — these are what the room is lit by */}
        {paintings.map((painting, i) => (
          <TrackLamp
            key={`lamp-${painting.slug}`}
            x={xForIndex(i)}
            warmth={((i * 37) % 10) / 10}
            phase={i * 1.7}
          />
        ))}

        {/* Soft studio reflections for the gilding — built inline so the
            scene never fetches an external HDR. */}
        <Environment resolution={256}>
          <Lightformer
            intensity={1.6}
            color="#fff4e2"
            position={[0, 4, 2]}
            scale={[12, 3, 1]}
          />
          <Lightformer
            intensity={0.7}
            color="#cddcff"
            position={[-6, 2, 4]}
            scale={[6, 4, 1]}
          />
          <Lightformer
            intensity={0.7}
            color="#cddcff"
            position={[6, 2, 4]}
            scale={[6, 4, 1]}
          />
        </Environment>
      </Suspense>
    </>
  );
}
