"use client";

import { useEffect, useRef, useState } from "react";
import InfiniteMenu from "./infinite-menu";
import { ICON_MAP } from "./icons";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import { Starfield } from "./starfield";

export interface GlobeItem {
  name: string;
  note: string;
  category: string;
}

type GlobeMenuItem = GlobeItem & { image: string };

const VISIBLE = { landscape: 0.62, portrait: 0.9 };
// The planet under the discs: a touch above the page black, lifting at the limb.
const BODY = { color: "#0b0b0b", rim: "#242424", radius: 0.7 };
const TILE = 256;
const ICON = 112;

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** One atlas cell: a disc in the card colour with the tool's icon inked on it. */
async function drawTile(svg: SVGElement | null, name: string, ink: string, disc: string) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = TILE;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = disc;
  ctx.fillRect(0, 0, TILE, TILE);

  ctx.strokeStyle = ink;
  ctx.globalAlpha = 0.14;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(TILE / 2, TILE / 2, TILE / 2 - 4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;

  if (svg) {
    const clone = svg.cloneNode(true) as SVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", String(ICON));
    clone.setAttribute("height", String(ICON));
    clone.removeAttribute("class");
    const markup = new XMLSerializer().serializeToString(clone).replaceAll("currentColor", ink);
    const img = await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`);
    if (img) {
      ctx.drawImage(img, (TILE - ICON) / 2, (TILE - ICON) / 2, ICON, ICON);
      return canvas.toDataURL("image/png");
    }
  }

  // No icon for this tool: fall back to its initial.
  ctx.fillStyle = ink;
  ctx.font = `600 ${ICON}px ${getComputedStyle(document.documentElement).getPropertyValue("--font-display") || "sans-serif"}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(name[0].toUpperCase(), TILE / 2, TILE / 2 + 6);
  return canvas.toDataURL("image/png");
}

export function StackGlobe({ items, className }: { items: GlobeItem[]; className?: string }) {
  const iconsRef = useRef<HTMLDivElement>(null);
  const [menuItems, setMenuItems] = useState<GlobeMenuItem[] | null>(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    const root = iconsRef.current;
    if (!root) return;
    let cancelled = false;

    const styles = getComputedStyle(document.documentElement);
    const ink = styles.getPropertyValue("--foreground").trim() || "#f2efe8";
    const disc = styles.getPropertyValue("--secondary").trim() || "#141414";
    const slots = Array.from(root.querySelectorAll<HTMLElement>("[data-icon]"));

    Promise.all(items.map((item, i) => drawTile(slots[i]?.querySelector("svg") ?? null, item.name, ink, disc))).then(
      (images) => {
        if (cancelled) return;
        setMenuItems(items.map((item, i) => ({ ...item, image: images[i] })));
      },
    ).catch(() => setMenuItems(null));

    return () => {
      cancelled = true;
    };
  }, [items]);

  return (
    <div className={cn("stack-globe", className)} onPointerDown={() => setTouched(true)}>
      <Starfield className="stack-globe__stars" />
      {/* Icons rendered once so their SVG markup can be rasterised into the atlas */}
      <div ref={iconsRef} aria-hidden="true" className="stack-globe__icons">
        {items.map((item) => {
          const Icon = ICON_MAP[item.name];
          return (
            <span key={item.name} data-icon>
              {Icon ? <Icon /> : null}
            </span>
          );
        })}
      </div>

      {menuItems && (
        <InfiniteMenu
          items={menuItems}
          visible={VISIBLE}
          body={BODY}
          renderCaption={(item, moving, controls) => (
            <div className="infinite-menu__caption">
              <button
                type="button"
                className="infinite-menu__arrow"
                aria-label="Previous tool"
                onClick={controls.prev}
              >
                <ArrowLeft size={18} strokeWidth={1.75} />
              </button>
              <div className={cn("infinite-menu__text", moving && "is-moving")}>
                <span className="infinite-menu__category">{item.category}</span>
                <span className="infinite-menu__title">{item.name}</span>
                <span className="infinite-menu__note">{item.note}</span>
              </div>
              <button
                type="button"
                className="infinite-menu__arrow"
                aria-label="Next tool"
                onClick={controls.next}
              >
                <ArrowRight size={18} strokeWidth={1.75} />
              </button>
            </div>
          )}
        />
      )}

      <span className={cn("stack-globe__hint", touched && "is-hidden")}>Drag to spin</span>
      <a href="#stack-list" className="stack-globe__scroll">
        Scroll
        <ArrowDown size={14} strokeWidth={1.75} aria-hidden="true" />
      </a>
    </div>
  );
}
