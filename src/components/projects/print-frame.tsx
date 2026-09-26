"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// ogl only loads on the client, and only for devices with a hover pointer.
const DitherVeil = dynamic(() => import("./dither-veil"), { ssr: false });

/**
 * A project screenshot as a dithered ink-on-paper print. On devices with a
 * mouse, the real screenshot shows in full colour around the cursor and the
 * trail knits back into dots behind it. Touch devices get the plain image.
 */
export function PrintFrame({
  src,
  print,
  alt,
  sizes,
  ink,
  brightness = 0,
  fit = "cover",
}: {
  /** The screenshot: shown in colour under the cursor, and as the plain fallback. */
  src: string;
  /** The image that gets dithered. Defaults to the screenshot. */
  print?: string;
  alt: string;
  sizes: string;
  /** Ink colour of the print. Matching the plate behind it hides the frame. */
  ink: string;
  /** Lift for dark screenshots so they keep some dots. */
  brightness?: number;
  /** contain floats a subject on a flat background; cover fills the frame. */
  fit?: "contain" | "cover";
}) {
  const [veil, setVeil] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const apply = () => setVeil(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  if (!veil) {
    return <Image src={src} alt={alt} fill sizes={sizes} className="object-cover object-top" />;
  }

  return (
    <div className="absolute inset-0" role="img" aria-label={alt}>
      <DitherVeil
        src={print ?? src}
        revealSrc={print ? src : undefined}
        fit={fit}
        pattern="atkinson"
        pixelSize={2}
        inkColor={ink}
        paperColor="#fbf9f4"
        contrast={1.1}
        brightness={brightness}
        revealRadius={240}
        softness={0.65}
        linger={1.2}
        clickBurst
      />
    </div>
  );
}
