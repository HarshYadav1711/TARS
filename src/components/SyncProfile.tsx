"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useRef } from "react";

export function SyncProfile() {
  const { user, isLoaded } = useUser();
  const updateOrCreate = useMutation(api.users.updateOrCreate);
  const synced = useRef(false);

  useEffect(() => {
    if (!isLoaded || !user || synced.current) return;
    synced.current = true;
    const name = user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "User";
    const imageUrl = user.imageUrl ?? undefined;
    updateOrCreate({ name, imageUrl }).catch(() => {
      synced.current = false;
    });
  }, [isLoaded, user, updateOrCreate]);

  return null;
}
