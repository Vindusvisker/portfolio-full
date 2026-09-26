"use client";

import { useEffect, useState } from "react";

/**
 * "you're the 2,635th visitor". Counts once per browser session. Renders
 * nothing until the store answers, and nothing at all when there is no store.
 */
export function VisitorCounter() {
  const [n, setN] = useState<number | null>(null);

  useEffect(() => {
    const counted = window.sessionStorage.getItem("mruud:counted");
    fetch("/api/visit", { method: counted ? "GET" : "POST" })
      .then((r) => r.json())
      .then((d: { n: number | null }) => {
        if (d.n == null) return;
        setN(d.n);
        try {
          window.sessionStorage.setItem("mruud:counted", "1");
        } catch {}
      })
      .catch(() => {});
  }, []);

  if (n == null) return null;
  return <>you&apos;re the {ordinal(n)} visitor</>;
}

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n.toLocaleString("en-US") + (s[(v - 20) % 10] || s[v] || s[0]);
}
