"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import Link from "next/link";
import { UserList } from "@/components/UserList";

export default function UsersPage() {
  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      <Authenticated>
        <div className="border-b border-border px-4 py-2">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to conversations
          </Link>
        </div>
        <UserList />
      </Authenticated>
      <Unauthenticated>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="text-muted-foreground">Sign in to see users.</p>
          <Link
            href="/sign-in"
            className="text-sm font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </div>
      </Unauthenticated>
    </main>
  );
}
