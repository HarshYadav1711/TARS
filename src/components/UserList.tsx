"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { OnlineIndicator } from "./OnlineIndicator";

type User = {
  _id: string;
  _creationTime: number;
  clerkId: string;
  name: string;
  imageUrl?: string;
  updatedAt: number;
  lastSeenAt?: number;
};

function filterUsers(users: User[], search: string): User[] {
  const term = search.trim().toLowerCase();
  if (!term) return users;
  return users.filter((u) => u.name.toLowerCase().includes(term));
}

export function UserList() {
  const router = useRouter();
  const users = useQuery(api.users.listExceptCurrent);
  const getOrCreate = useMutation(api.conversations.getOrCreate);
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = useMemo(
    () => (users ? filterUsers(users as User[], search) : []),
    [users, search]
  );

  async function handleUserClick(user: User) {
    if (loadingId) return;
    setLoadingId(user.clerkId);
    try {
      const conversationId = await getOrCreate({
        otherUserClerkId: user.clerkId,
      });
      router.push(`/chat/${conversationId}`);
    } finally {
      setLoadingId(null);
    }
  }

  if (users === undefined) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="border-b border-border px-4 py-2">
          <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
        </div>
        <ul className="flex-1 space-y-1 p-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <li key={i} className="flex gap-3 px-2 py-3">
              <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-muted" />
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
        <div className="flex max-w-sm flex-col gap-2 rounded-lg border border-border bg-muted/30 px-6 py-8">
          <p className="text-sm font-medium text-foreground">
            No other users yet
          </p>
          <p className="text-sm text-muted-foreground">
            You’re the only one here so far. Invite others to sign up, or check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-border px-4 py-2">
        <input
          type="search"
          placeholder="Search by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          aria-label="Search users by name"
        />
      </div>
      <ul className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <li className="flex flex-col items-center justify-center px-4 py-12">
            <div className="flex max-w-sm flex-col gap-2 rounded-lg border border-border bg-muted/30 px-6 py-8 text-center">
              <p className="text-sm font-medium text-foreground">
                No users match your search
              </p>
              <p className="text-sm text-muted-foreground">
                Try a different name, or clear the search box to see everyone.
              </p>
            </div>
          </li>
        ) : (
          filtered.map((user) => (
            <li key={user._id}>
              <button
                type="button"
                onClick={() => handleUserClick(user)}
                disabled={loadingId !== null}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 disabled:opacity-50"
              >
                {user.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.imageUrl}
                    alt=""
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground"
                    aria-hidden
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="flex min-w-0 items-center gap-1.5">
                  <OnlineIndicator lastSeenAt={user.lastSeenAt} />
                  <span className="truncate text-sm font-medium text-foreground">
                    {user.name}
                  </span>
                </span>
                {loadingId === user.clerkId && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    Opening…
                  </span>
                )}
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
