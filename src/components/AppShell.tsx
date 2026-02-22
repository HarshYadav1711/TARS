"use client";

import { usePathname } from "next/navigation";
import { ConversationList } from "./ConversationList";
import { HeartbeatWhenAuthenticated } from "./Heartbeat";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div className="flex h-[calc(100vh-3.5rem)] min-h-0">
      <HeartbeatWhenAuthenticated />
      <aside className="hidden w-80 shrink-0 flex-col border-r border-border md:flex">
        <ConversationList />
      </aside>
      <main className="min-h-0 flex-1 overflow-auto">
        {isHome ? (
          <>
            <div className="flex h-full min-h-[calc(100vh-3.5rem)] flex-col md:hidden">
              <ConversationList />
            </div>
            <div className="hidden h-full min-h-[calc(100vh-3.5rem)] md:flex">
              {children}
            </div>
          </>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
