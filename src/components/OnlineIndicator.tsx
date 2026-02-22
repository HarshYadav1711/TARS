"use client";

import { isOnline } from "@/lib/presence";
import { useEffect, useState } from "react";

const RECHECK_MS = 15_000;

type Props = {
  lastSeenAt: number | undefined;
  className?: string;
};

export function OnlineIndicator({ lastSeenAt, className = "" }: Props) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), RECHECK_MS);
    return () => clearInterval(id);
  }, []);
  if (!isOnline(lastSeenAt)) return null;
  return (
    <span
      className={`inline-block h-2 w-2 shrink-0 rounded-full bg-green-500 ${className}`}
      title="Online"
      aria-hidden
    />
  );
}
