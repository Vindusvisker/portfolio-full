"use client";

import dynamic from "next/dynamic";
import { useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";

// three.js only loads when this page renders on the client.
const PaperCrumple = dynamic(() => import("./paper-crumple"), { ssr: false });

/**
 * The open source inventory, printed on a sheet that crumples as you scroll
 * past it: flat while it comes in and sits centred, balled up as it leaves.
 */
export function Graveyard({ src }: { src: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [crumple, setCrumple] = useState(0);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const fold = useTransform(scrollYProgress, [0.3, 0.7], [0, 1]);
  useMotionValueEvent(fold, "change", (v) => {
    const next = Math.round(Math.min(1, Math.max(0, v)) * 100) / 100;
    setCrumple((c) => (c === next ? c : next));
  });

  return (
    <div ref={ref} className="mx-auto max-w-5xl">
      <PaperCrumple
        src={src}
        alt="A printed list of my open source repos"
        width={560}
        height={758}
        sceneHeight={860}
        crumple={crumple}
        crumpleDuration={0.35}
        foldCount={7}
        wrinkleDepth={0.8}
        paperColor="#ece6da"
        shadowOpacity={0.28}
        lightAngle={-30}
        draggable={false}
        disabled
        seed={11}
      />
    </div>
  );
}
