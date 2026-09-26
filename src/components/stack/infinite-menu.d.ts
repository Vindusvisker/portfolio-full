import type { ReactNode } from "react";

export interface InfiniteMenuItem {
  /** Any image URL the browser can load into an <img>, data URLs included. */
  image: string;
}

export interface InfiniteMenuProps<T extends InfiniteMenuItem> {
  items: T[];
  /** Camera zoom, 1 = the React Bits default. */
  scale?: number;
  /** Icosahedron subdivisions: 1 gives 42 discs, 2 gives 162, 3 gives 642. */
  subdivisions?: number;
  /** Pixel size of each atlas cell. */
  cellSize?: number;
  /** Fraction of the sphere radius that fits in the canvas height; 0.35 is the React Bits framing. */
  visible?: number | { landscape: number; portrait: number };
  /** Opaque sphere inside the disc shell, so a background behind the canvas cannot show through the gaps. */
  body?: { color?: string; rim?: string; radius?: number } | null;
  className?: string;
  /** Rendered over the canvas for the disc currently facing the viewer. `controls` steps to a neighbouring disc. */
  renderCaption?: (item: T, moving: boolean, controls: { prev: () => void; next: () => void }) => ReactNode;
}

declare function InfiniteMenu<T extends InfiniteMenuItem>(props: InfiniteMenuProps<T>): React.JSX.Element | null;
export default InfiniteMenu;
