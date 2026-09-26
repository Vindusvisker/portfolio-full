import type { CSSProperties } from "react";

export interface PixelBlastProps {
  variant?: "square" | "circle" | "triangle" | "diamond";
  pixelSize?: number;
  color?: string;
  className?: string;
  style?: CSSProperties;
  antialias?: boolean;
  patternScale?: number;
  patternDensity?: number;
  liquid?: boolean;
  liquidStrength?: number;
  liquidRadius?: number;
  pixelSizeJitter?: number;
  enableRipples?: boolean;
  rippleIntensityScale?: number;
  rippleThickness?: number;
  rippleSpeed?: number;
  liquidWobbleSpeed?: number;
  autoPauseOffscreen?: boolean;
  speed?: number;
  transparent?: boolean;
  edgeFade?: number;
  noiseAmount?: number;
  /** Element (or selector) whose pointer events drive ripples and the liquid trail. Defaults to the canvas. */
  eventSource?: HTMLElement | string | null;
  /** Cap on the renderer's device pixel ratio. The look is identical at any cap; lower is cheaper. */
  maxPixelRatio?: number;
}

declare const PixelBlast: (props: PixelBlastProps) => React.JSX.Element;
export default PixelBlast;
