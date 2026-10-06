"use client";

import { useEffect, useState } from "react";

const format = (timeZone: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit" }).format(new Date());

/**
 * Current local time ("14:05") in an IANA time zone, ticking every few
 * seconds. Renders "--:--" on the server so markup never mismatches.
 */
export function LiveClock({ timeZone, className }: { timeZone: string; className?: string }) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setTime(format(timeZone));
    tick();
    const id = setInterval(tick, 5000);
    return () => clearInterval(id);
  }, [timeZone]);

  return (
    <time className={className}>{time ?? "--:--"}</time>
  );
}
