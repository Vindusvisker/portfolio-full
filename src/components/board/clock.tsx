"use client";

import { useEffect, useState } from "react";

function norwayTime() {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Oslo",
  }).format(new Date());
}

/** Local time in Norway, ticking once a minute. Renders a placeholder until mounted. */
export function NorwayClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    setTime(norwayTime());
    const id = window.setInterval(() => setTime(norwayTime()), 15_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className="tabular-nums" suppressHydrationWarning>
      {time ?? "--:--"} in Norway
    </span>
  );
}
