import type { CSSProperties } from "react";

export type PaperCrumpleState = "holding" | "flat" | "crumpled" | "creased";

export interface PaperCrumpleProps {
  src: string;
  alt?: string;
  backSrc?: string;
  width?: number;
  height?: number;
  sceneHeight?: number;
  imageFit?: "cover" | "contain";
  releaseBehavior?: "stay" | "restore" | "creased";
  crumpleAmount?: number;
  crumpleDuration?: number;
  releaseDuration?: number;
  foldCount?: number;
  foldSharpness?: number;
  wrinkleDepth?: number;
  creaseStrength?: number;
  paperColor?: string;
  roughness?: number;
  paperTexture?: number;
  lightIntensity?: number;
  lightAngle?: number;
  shadow?: boolean;
  shadowOpacity?: number;
  draggable?: boolean;
  dragRotation?: number;
  dragRadius?: number;
  returnToOrigin?: boolean;
  rotation?: number;
  seed?: number;
  detail?: number;
  disabled?: boolean;
  /** Controlled fold amount, 0 flat to 1 crumpled. Overrides the pointer. */
  crumple?: number;
  resetKey?: number | string;
  onStateChange?: (state: PaperCrumpleState) => void;
  onError?: (error: Error) => void;
  className?: string;
  style?: CSSProperties;
}

declare const PaperCrumple: (props: PaperCrumpleProps) => React.JSX.Element;
export default PaperCrumple;
