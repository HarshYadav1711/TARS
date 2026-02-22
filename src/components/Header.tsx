"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import Link from "next/link";
import { SyncProfile } from "./SyncProfile";

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

function HeaderSignedIn() {
  const { user } = useUser();
  const name =
    user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "User";
  return (
    <>
      <SyncProfile />
      <div className="flex items-center gap-3">
        <span className="text-sm text-foreground">{name}</span>
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "h-8 w-8",
            },
          }}
        />
      </div>
    </>
  );
}

function AuthNav() {
  return (
    <>
      <AuthLoading>
        <span className="text-sm text-muted-foreground">Loading…</span>
      </AuthLoading>
      <Unauthenticated>
        <Link
          href="/sign-in"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Sign up
        </Link>
      </Unauthenticated>
      <Authenticated>
        <HeaderSignedIn />
      </Authenticated>
    </>
  );
}

export function Header() {
  return (
    <header className="border-b border-border bg-background">
      <nav className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold text-foreground">
          TARS Chat
        </Link>
        <div className="flex items-center gap-4">
          {clerkEnabled ? (
            <AuthNav />
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
