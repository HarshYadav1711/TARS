"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function ChatPage() {
  const params = useParams();
  const conversationId = params.conversationId as string;
  const conversation = useQuery(
    api.conversations.get,
    conversationId ? { conversationId } : "skip"
  );

  if (conversation === undefined) {
    return (
      <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <span className="text-sm text-muted-foreground">Loading…</span>
      </main>
    );
  }

  if (conversation === null) {
    return (
      <main className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center gap-4 p-8">
        <p className="text-muted-foreground">Conversation not found.</p>
        <Link href="/" className="text-sm text-primary hover:underline">
          Back to users
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      <div className="border-b border-border px-4 py-3">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to users
        </Link>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-muted-foreground">
        <p className="text-sm">Conversation (messages coming next)</p>
      </div>
    </main>
  );
}
