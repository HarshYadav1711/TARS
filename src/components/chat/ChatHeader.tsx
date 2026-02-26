"use client";

import Link from "next/link";
import { OnlineIndicator } from "@/components/OnlineIndicator";

type ChatHeaderProps = {
  participantName: string;
  isOnline?: boolean;
  lastSeenAt?: number;
};

export function ChatHeader({
  participantName,
  isOnline,
  lastSeenAt,
}: ChatHeaderProps) {
  return (
    <div className="flex items-center gap-3 border-b border-border px-4 py-3">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground md:hidden"
      >
        ← Back
      </Link>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <OnlineIndicator isOnlineValue={isOnline} lastSeenAt={lastSeenAt} />
          <span className="truncate text-sm font-medium">{participantName}</span>
        </span>
      </span>
    </div>
  );
}
