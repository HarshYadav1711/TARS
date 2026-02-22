"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import Link from "next/link";
import { SelectConversationPlaceholder } from "@/components/SelectConversationPlaceholder";

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      <Authenticated>
        <SelectConversationPlaceholder />
      </Authenticated>
      <Unauthenticated>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
          <h1 className="text-2xl font-semibold">TARS Chat</h1>
          <p className="text-muted-foreground">
            Sign in to see users and start a conversation.
          </p>
          <div className="flex gap-3">
            <Link
              href="/sign-in"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Sign up
            </Link>
          </div>
        </div>
      </Unauthenticated>
    </div>
  );
}
