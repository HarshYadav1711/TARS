"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Link from "next/link";
import { OnlineIndicator } from "./OnlineIndicator";
import { formatTimestamp } from "@/lib/utils/formatTimestamp";

type ConversationItem = {
  _id: string;
  otherUser: {
    clerkId: string;
    name: string;
    imageUrl?: string;
    isOnline?: boolean;
    lastSeenAt?: number;
  };
  lastMessageText?: string;
  lastMessageAt: number;
  unreadCount: number;
};

export function ConversationList() {
  const conversations = useQuery(api.conversations.listForCurrentUser);

  if (conversations === undefined) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="border-b border-border px-4 py-2">
          <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
        </div>
        <ul className="flex-1 space-y-1 p-2">
          {[1, 2, 3, 4].map((i) => (
            <li key={i} className="flex gap-3 px-2 py-3">
              <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-muted" />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="h-3 w-32 animate-pulse rounded bg-muted" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
        <div className="flex max-w-sm flex-col gap-2 rounded-lg border border-border bg-muted/30 px-6 py-8">
          <p className="text-sm font-medium text-foreground">
            Start a conversation
          </p>
          <p className="text-sm text-muted-foreground">
            Choose someone from the user list to start your first chat.
          </p>
          <Link
            href="/users"
            className="mt-2 inline-flex justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Find someone to message
          </Link>
        </div>
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
                <span className="flex min-w-0 items-center gap-1.5">
                  <OnlineIndicator
                    isOnlineValue={conv.otherUser.isOnline}
                    lastSeenAt={conv.otherUser.lastSeenAt}
                  />
                  <span className="truncate text-sm font-medium text-foreground">
                    {conv.otherUser.name}
                  </span>
                  {conv.unreadCount > 0 && (
                    <span
                      className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground"
                      aria-label={`${conv.unreadCount} unread`}
                    >
                      {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatTimestamp(conv.lastMessageAt)}
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
