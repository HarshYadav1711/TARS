"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";

export default function Page() {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isSignedIn) return;

    getToken({ template: "convex" }).then((token) => {
      if (!token) return;
      console.log(
        JSON.parse(atob(token.split(".")[1]))
      );
    });
  }, [isSignedIn, getToken]);

  return <div>Open browser console</div>;
}