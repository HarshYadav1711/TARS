"use client";

import { SignedIn, SignedOut, SignIn, useAuth } from "@clerk/nextjs";
import { useEffect } from "react";

export default function Page() {
  const { getToken } = useAuth();

  useEffect(() => {
    const run = async () => {
      const token = await getToken({ template: "convex" });
      if (!token) return;
      console.log("JWT PAYLOAD:", JSON.parse(atob(token.split(".")[1])));
    };

    run();
  }, [getToken]);

  return (
    <>
      <SignedOut>
        <SignIn />
      </SignedOut>

      <SignedIn>
        <div>You are signed in. Check console.</div>
      </SignedIn>
    </>
  );
}
