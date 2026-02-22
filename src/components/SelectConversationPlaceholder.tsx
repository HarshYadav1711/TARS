"use client";

import Link from "next/link";

export function SelectConversationPlaceholder() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
      <div className="flex max-w-sm flex-col gap-2 rounded-lg border border-border bg-muted/30 px-6 py-8">
        <p className="text-sm font-medium text-foreground">
          Select a conversation
        </p>
        <p className="text-sm text-muted-foreground">
          Choose one from the list or start a new chat.
        </p>
        <Link
          href="/users"
          className="mt-2 inline-flex justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          New chat
        </Link>
      </div>
    </div>
  );
}
