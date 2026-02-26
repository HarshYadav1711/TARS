"use client";

import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Authenticated } from "convex/react";
import { useEffect, useRef } from "react";

const HEARTBEAT_INTERVAL_MS = 30_000;
const INACTIVITY_TIMEOUT_MS = 120_000;

export function Heartbeat() {
  const heartbeat = useMutation(api.users.heartbeat);
  const setOffline = useMutation(api.users.setOffline);
  const pingPresence = useMutation(api.presence.ping);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastActivityAtRef = useRef(Date.now());
  const isOfflineRef = useRef(false);

  useEffect(() => {
    function markActivity() {
      lastActivityAtRef.current = Date.now();
      if (isOfflineRef.current) {
        isOfflineRef.current = false;
        heartbeat().catch(() => {});
        pingPresence().catch(() => {});
      }
    }

    function tick() {
      const now = Date.now();
      const inactiveFor = now - lastActivityAtRef.current;
      const hidden = document.visibilityState === "hidden";

      if (hidden || inactiveFor > INACTIVITY_TIMEOUT_MS) {
        if (!isOfflineRef.current) {
          isOfflineRef.current = true;
          setOffline().catch(() => {});
        }
        return;
      }

      isOfflineRef.current = false;
      heartbeat().catch(() => {});
      pingPresence().catch(() => {});
    }

    tick();
    intervalRef.current = setInterval(tick, HEARTBEAT_INTERVAL_MS);
    const onHide = () => {
      isOfflineRef.current = true;
      setOffline().catch(() => {});
    };
    window.addEventListener("beforeunload", onHide);
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        onHide();
      } else {
        markActivity();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    const activityEvents: Array<keyof WindowEventMap> = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "focus",
    ];
    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, markActivity);
    });
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener("beforeunload", onHide);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, markActivity);
      });
      setOffline().catch(() => {});
    };
  }, [heartbeat, pingPresence, setOffline]);

  return null;
}

export function HeartbeatWhenAuthenticated() {
  return (
    <Authenticated>
      <Heartbeat />
    </Authenticated>
  );
}
