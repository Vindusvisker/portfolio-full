"use client";

/* eslint-disable react/no-unknown-property */
import { Canvas, extend, useFrame, useThree, type ThreeElement } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF, useTexture } from "@react-three/drei";
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  type RapierRigidBody,
} from "@react-three/rapier";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

extend({ MeshLineGeometry, MeshLineMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    meshLineGeometry: ThreeElement<typeof MeshLineGeometry>;
    meshLineMaterial: ThreeElement<typeof MeshLineMaterial>;
  }
}

const CARD_URL = "/lanyard/card.glb";
const DEFAULT_BAND_URL = "/lanyard/band.png";
const BLANK_PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

// The card model's front face maps to the left half of its texture atlas,
// the back face to the right half.
const FRONT_UV_RECT = { x: 0, y: 0, w: 0.5, h: 0.755 };
const BACK_UV_RECT = { x: 0.5, y: 0, w: 0.5, h: 0.757 };

interface LanyardProps {
  position?: [number, number, number];
  /** Height of the point the band hangs from; raise it when the camera is close */
  hangAt?: number;
  gravity?: [number, number, number];
  fov?: number;
  frontImage?: string | null;
  backImage?: string | null;
  imageFit?: "cover" | "contain";
  lanyardImage?: string;
  lanyardWidth?: number;
  /**
   * Element that receives pointer events for the scene, instead of the canvas.
   * Lets the canvas be pointer-transparent so what's under it stays usable.
   */
  eventSource?: HTMLElement;
  /** Called once the model and textures are loaded and the first frame can render. */
  onReady?: () => void;
}

/**
 * With events coming from another element, map the pointer through the
 * canvas's on-screen box (transforms included) instead of the event target.
 */
function PointerFromCanvas() {
  const setEvents = useThree((s) => s.setEvents);
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    setEvents({
      compute: (event, state) => {
        const rect = gl.domElement.getBoundingClientRect();
        state.pointer.set(
          ((event.clientX - rect.left) / rect.width) * 2 - 1,
          -((event.clientY - rect.top) / rect.height) * 2 + 1
        );
        state.raycaster.setFromCamera(state.pointer, state.camera);
      },
    });
  }, [setEvents, gl]);
  return null;
}

/**
 * A badge on a lanyard, hung from the top of its container, with real physics.
 * Ported to TypeScript from the React Bits Lanyard; assets load from /public.
 */
export default function Lanyard({
  position = [0, 0, 30],
  gravity = [0, -40, 0],
  fov = 20,
  hangAt = 4,
  frontImage = null,
  backImage = null,
  imageFit = "cover",
  lanyardImage = DEFAULT_BAND_URL,
  lanyardWidth = 1,
  eventSource,
  onReady,
}: LanyardProps) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="relative h-full w-full">
      <Canvas
        camera={{ position, fov }}
        // The board scales this element with a CSS transform; measure the
        // layout size, not the transformed one, or the canvas renders tiny.
        resize={{ offsetSize: true, scroll: false, debounce: { scroll: 50, resize: 0 } }}
        dpr={[1, 1.5]}
        gl={{ alpha: true }}
        eventSource={eventSource}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), 0)}
      >
        {eventSource && <PointerFromCanvas />}
        <ambientLight intensity={Math.PI} />
        <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Band
            onReady={onReady}
            isMobile={isMobile}
            hangAt={hangAt}
            frontImage={frontImage}
            backImage={backImage}
            imageFit={imageFit}
            lanyardImage={lanyardImage}
            lanyardWidth={lanyardWidth}
          />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
        </Environment>
      </Canvas>
    </div>
  );
}

interface BandProps {
  maxSpeed?: number;
  minSpeed?: number;
  isMobile: boolean;
  hangAt: number;
  frontImage: string | null;
  backImage: string | null;
  imageFit: "cover" | "contain";
  lanyardImage: string;
  lanyardWidth: number;
  onReady?: () => void;
}

type BandMesh = THREE.Mesh & { geometry: MeshLineGeometry };

function Band({ maxSpeed = 50, minSpeed = 0, isMobile, hangAt, frontImage, backImage, imageFit, lanyardImage, lanyardWidth, onReady }: BandProps) {
  const band = useRef<BandMesh>(null);
  const fixed = useRef<RapierRigidBody>(null);
  const j1 = useRef<RapierRigidBody>(null);
  const j2 = useRef<RapierRigidBody>(null);
  const j3 = useRef<RapierRigidBody>(null);
  const card = useRef<RapierRigidBody>(null);
  // Smoothed positions for the middle joints, so the band doesn't jitter.
  const lerped = useRef(new WeakMap<RapierRigidBody, THREE.Vector3>());

  const vec = useMemo(() => new THREE.Vector3(), []);
  const ang = useMemo(() => new THREE.Vector3(), []);
  const rot = useMemo(() => new THREE.Vector3(), []);
  const dir = useMemo(() => new THREE.Vector3(), []);

  const segmentProps = { type: "dynamic" as const, canSleep: true, colliders: false as const, angularDamping: 4, linearDamping: 4 };
  const { nodes, materials } = useGLTF(CARD_URL);
  const texture = useTexture(lanyardImage);
  const frontTex = useTexture(frontImage || BLANK_PIXEL);
  const backTex = useTexture(backImage || BLANK_PIXEL);

  const baseMaterial = materials.base as THREE.MeshStandardMaterial;

  const cardMap = useMemo(() => {
    const baseMap = baseMaterial.map;
    if (!baseMap || (!frontImage && !backImage)) return baseMap;
    const baseImg = baseMap.image as HTMLImageElement | ImageBitmap;
    const W = baseImg.width;
    const H = baseImg.height;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return baseMap;
    ctx.drawImage(baseImg, 0, 0, W, H);

    const drawFitted = (img: HTMLImageElement | ImageBitmap, rect: typeof FRONT_UV_RECT) => {
      const rx = rect.x * W;
      const ry = rect.y * H;
      const rw = rect.w * W;
      const rh = rect.h * H;
      const pick = imageFit === "contain" ? Math.min : Math.max;
      const s = pick(rw / img.width, rh / img.height);
      const dw = img.width * s;
      const dh = img.height * s;
      ctx.save();
      ctx.beginPath();
      ctx.rect(rx, ry, rw, rh);
      ctx.clip();
      ctx.drawImage(img, rx + (rw - dw) / 2, ry + (rh - dh) / 2, dw, dh);
      ctx.restore();
    };

    if (frontImage && frontTex.image) drawFitted(frontTex.image as HTMLImageElement, FRONT_UV_RECT);
    if (backImage && backTex.image) drawFitted(backTex.image as HTMLImageElement, BACK_UV_RECT);

    const composite = new THREE.CanvasTexture(canvas);
    composite.colorSpace = THREE.SRGBColorSpace;
    composite.flipY = baseMap.flipY;
    composite.anisotropy = 16;
    composite.needsUpdate = true;
    return composite;
  }, [frontImage, backImage, imageFit, frontTex, backTex, baseMaterial.map]);

  const [curve] = useState(
    () => new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()])
  );
  const [dragged, setDragged] = useState<THREE.Vector3 | false>(false);
  const [hovered, setHovered] = useState(false);

  // Band only mounts once useGLTF/useTexture have resolved, so this is "assets ready".
  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rapier types its joint refs as non-null; ours start null until mount.
  type BodyRef = React.RefObject<RapierRigidBody>;
  useRopeJoint(fixed as BodyRef, j1 as BodyRef, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1 as BodyRef, j2 as BodyRef, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2 as BodyRef, j3 as BodyRef, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3 as BodyRef, card as BodyRef, [
    [0, 0, 0],
    [0, 1.5, 0],
  ]);

  useEffect(() => {
    if (!hovered) return;
    document.body.style.cursor = dragged ? "grabbing" : "grab";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged && card.current) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
      card.current.setNextKinematicTranslation({ x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z });
    }
    if (fixed.current && j1.current && j2.current && j3.current && card.current && band.current) {
      for (const ref of [j1, j2]) {
        const body = ref.current!;
        let l = lerped.current.get(body);
        if (!l) {
          l = new THREE.Vector3().copy(body.translation());
          lerped.current.set(body, l);
        }
        const clamped = Math.max(0.1, Math.min(1, l.distanceTo(body.translation())));
        l.lerp(body.translation(), delta * (minSpeed + clamped * (maxSpeed - minSpeed)));
      }
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(lerped.current.get(j2.current)!);
      curve.points[2].copy(lerped.current.get(j1.current)!);
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z }, true);
    }
  });

  curve.curveType = "chordal";
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  const cardNode = nodes.card as THREE.Mesh;
  const clipNode = nodes.clip as THREE.Mesh;
  const clampNode = nodes.clamp as THREE.Mesh;

  return (
    <>
      <group position={[0, hangAt, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[2, 0, 0]} ref={card} {...segmentProps} type={dragged ? "kinematicPosition" : "dynamic"}>
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            onPointerUp={(e) => {
              (e.target as HTMLElement).releasePointerCapture(e.pointerId);
              setDragged(false);
            }}
            onPointerDown={(e) => {
              // Grabbing the badge should swing it, not pan the board behind it.
              e.nativeEvent.stopPropagation();
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
              if (card.current) setDragged(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())));
            }}
          >
            <mesh geometry={cardNode.geometry}>
              <meshPhysicalMaterial
                map={cardMap}
                map-anisotropy={16}
                clearcoat={isMobile ? 0 : 1}
                clearcoatRoughness={0.15}
                roughness={0.9}
                metalness={0.8}
              />
            </mesh>
            <mesh geometry={clipNode.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={clampNode.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          args={[{ resolution: new THREE.Vector2(1000, 1000) }]}
          color="white"
          depthTest={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap={1}
          map={texture}
          repeat={[-4, 1]}
          lineWidth={lanyardWidth}
        />
      </mesh>
    </>
  );
}

useGLTF.preload(CARD_URL);
