"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatTimestamp } from "@/lib/formatTimestamp";

type Message = {
  _id: Id<"messages">;
  authorClerkId: string;
  body: string;
  createdAt: number;
};

type ChatMessagesProps = {
  conversationId: Id<"conversations">;
  currentUserId?: string;
  participantName: string;
};

function isNearBottom(el: HTMLDivElement): boolean {
  const thresholdPx = 72;
  return el.scrollHeight - el.scrollTop - el.clientHeight < thresholdPx;
}

export function ChatMessages({
  conversationId,
  currentUserId,
  participantName,
}: ChatMessagesProps) {
  const conversation = useQuery(api.conversations.getWithOtherUser, {
    conversationId,
  });
  const messages = useQuery(api.messages.list, { conversationId }) as
    | Message[]
    | undefined;
  const markRead = useMutation(api.reads.markRead);

  const [showNewMessages, setShowNewMessages] = useState(false);
  const [loadError, setLoadError] = useState("");

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const nearBottomRef = useRef(true);
  const lastMessageIdRef = useRef<string | null>(null);

  const scrollToBottom = useCallback((smooth: boolean) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    nearBottomRef.current = true;
    setShowNewMessages(false);
  }, []);

  useEffect(() => {
    if (!conversationId || !messages) return;
    setLoadError("");
    markRead({ conversationId }).catch(() => {
      setLoadError("Couldn't update read status.");
    });
  }, [conversationId, messages, markRead]);

  useEffect(() => {
    if (!messages || messages.length === 0) return;
    const latest = messages[messages.length - 1];
    const previous = lastMessageIdRef.current;
    const hasNewMessage = previous !== null && previous !== latest._id;

    if (!hasNewMessage) {
      lastMessageIdRef.current = latest._id;
      return;
    }

    if (nearBottomRef.current) {
      scrollToBottom(true);
    } else {
      setShowNewMessages(true);
    }
    lastMessageIdRef.current = latest._id;
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!messages || messages.length === 0) return;
    if (lastMessageIdRef.current === null) {
      lastMessageIdRef.current = messages[messages.length - 1]._id;
      scrollToBottom(false);
    }
  }, [messages, scrollToBottom]);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    nearBottomRef.current = isNearBottom(el);
    if (nearBottomRef.current) setShowNewMessages(false);
  }

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="relative flex-1 overflow-y-auto px-4 py-4"
    >
      {!messages || !conversation ? (
        <div className="space-y-3">
          <div className="h-16 animate-pulse rounded-lg bg-muted" />
          <div className="h-16 animate-pulse rounded-lg bg-muted" />
          <p className="text-xs text-muted-foreground">Loading messages...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <div className="rounded-lg border border-border bg-muted/30 px-6 py-5 text-center">
            <p className="text-sm font-medium">Send your first message</p>
            <p className="text-xs text-muted-foreground">
              Start the conversation with {participantName}.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => {
            const mine = message.authorClerkId === currentUserId;
            return (
              <div
                key={message._id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                    mine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.body}</p>
                  <p
                    className={`mt-1 text-[11px] ${
                      mine ? "text-primary-foreground/80" : "text-muted-foreground"
                    }`}
                  >
                    {formatTimestamp(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showNewMessages && (
        <button
          type="button"
          onClick={() => scrollToBottom(true)}
          className="sticky bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow"
        >
          New messages
        </button>
      )}

      {loadError ? <p className="mt-2 text-xs text-destructive">{loadError}</p> : null}
    </div>
  );
}
