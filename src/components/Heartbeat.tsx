"use client";

import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Authenticated } from "convex/react";
import { useEffect, useRef } from "react";

const HEARTBEAT_INTERVAL_MS = 30_000;

export function Heartbeat() {
  const heartbeat = useMutation(api.users.heartbeat);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    function tick() {
      heartbeat().catch(() => {});
    }
    tick();
    intervalRef.current = setInterval(tick, HEARTBEAT_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [heartbeat]);

  return null;
}

export function HeartbeatWhenAuthenticated() {
  return (
    <Authenticated>
      <Heartbeat />
    </Authenticated>
  );
}
