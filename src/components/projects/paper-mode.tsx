"use client";

import { useEffect } from "react";

/**
 * Keeps the page in paper mode (cream page, ink text) for as long as it is
 * mounted, and hands the dark theme back on unmount so other routes stay
 * dark. The first paint on a hard load is handled by an inline script in the
 * page, so this only matters for client-side navigation.
 */
export function PaperMode() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("paper");
    return () => root.classList.remove("paper");
  }, []);
  return null;
}
