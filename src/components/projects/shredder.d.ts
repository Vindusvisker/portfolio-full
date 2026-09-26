import type { ReactNode } from "react";

export interface ShredderProps<T extends { id: string | number }> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  onShred?: (item: T) => void;
  onReorder?: (items: T[]) => void;
  width?: number;
  height?: number;
  inset?: number;
  gap?: number;
  slitHeight?: number;
  fallHeight?: number;
  feedSpeed?: number;
  bite?: number;
  autoFeed?: boolean;
  stripWidth?: number;
  curl?: number;
  autoAnimate?: boolean;
  loop?: boolean;
  loopAfterDelete?: boolean;
  dragTilt?: number;
  lift?: number;
  slitColor?: string;
  color?: string;
  disabled?: boolean;
  /** Controlled: how many rows should be shredded right now, bottom row first. */
  shredCount?: number;
  className?: string;
}

declare function Shredder<T extends { id: string | number }>(props: ShredderProps<T>): React.JSX.Element;
export default Shredder;
