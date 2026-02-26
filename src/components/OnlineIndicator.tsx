"use client";

import { isOnline } from "@/lib/presence";
import { useEffect, useState } from "react";

const RECHECK_MS = 15_000;

type Props = {
  isOnlineValue?: boolean;
  lastSeenAt: number | undefined;
  className?: string;
};

export function OnlineIndicator({
  isOnlineValue,
  lastSeenAt,
  className = "",
}: Props) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), RECHECK_MS);
    return () => clearInterval(id);
  }, []);
  const online = isOnlineValue ?? isOnline(lastSeenAt);
  return (
    <span
      className={`inline-block h-2 w-2 shrink-0 rounded-full ${
        online ? "bg-green-500" : "bg-gray-400"
      } ${className}`}
      title={online ? "Online" : "Offline"}
      aria-hidden
    />
  );
}
