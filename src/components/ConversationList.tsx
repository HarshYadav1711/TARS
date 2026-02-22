"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Link from "next/link";

type ConversationItem = {
  _id: string;
  otherUser: { clerkId: string; name: string; imageUrl?: string };
  lastMessageText?: string;
  lastMessageAt: number;
};

function formatTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (sameDay) {
    return d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function ConversationList() {
  const conversations = useQuery(api.conversations.listForCurrentUser);

  if (conversations === undefined) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-12 text-muted-foreground">
        <span className="text-sm">Loading…</span>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12 text-center">
        <span className="text-sm text-muted-foreground">
          No conversations yet.
        </span>
        <Link
          href="/users"
          className="text-sm font-medium text-primary hover:underline"
        >
          Start a chat
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-border px-4 py-2">
        <Link
          href="/users"
          className="inline-block rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          New chat
        </Link>
      </div>
      <ul className="flex-1 overflow-y-auto">
        {(conversations as ConversationItem[]).map((conv) => (
          <li key={conv._id}>
            <Link
              href={`/chat/${conv._id}`}
              className="flex flex-col gap-0.5 border-b border-border px-4 py-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium text-foreground">
                  {conv.otherUser.name}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatTime(conv.lastMessageAt)}
                </span>
              </div>
              {conv.lastMessageText ? (
                <span className="truncate text-xs text-muted-foreground">
                  {conv.lastMessageText}
                </span>
              ) : (
                <span className="text-xs italic text-muted-foreground">
                  No messages yet
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
