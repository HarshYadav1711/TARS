"use client";

import { useMutation, useQuery, Authenticated, Unauthenticated } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { OnlineIndicator } from "@/components/OnlineIndicator";
import { formatTimestamp } from "@/lib/utils/formatTimestamp";

type Message = {
  _id: Id<"messages">;
  authorClerkId: string;
  body: string;
  createdAt: number;
};

function isNearBottom(el: HTMLDivElement): boolean {
  const thresholdPx = 72;
  return el.scrollHeight - el.scrollTop - el.clientHeight < thresholdPx;
}

export default function ConversationPage() {
  const params = useParams<{ conversationId: string }>();
  const conversationId = params.conversationId as Id<"conversations">;
  const { user } = useUser();

  const conversation = useQuery(api.conversations.getWithOtherUser, {
    conversationId,
  });
  const messages = useQuery(api.messages.list, { conversationId }) as Message[] | undefined;
  const typingUsers = useQuery(api.typing.list, { conversationId });

  const sendMessage = useMutation(api.messages.send);
  const setTyping = useMutation(api.typing.set);
  const stopTyping = useMutation(api.typing.stop);
  const markRead = useMutation(api.reads.markRead);

  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [showNewMessages, setShowNewMessages] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const nearBottomRef = useRef(true);
  const lastMessageIdRef = useRef<string | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingUpdateRef = useRef(0);

  const otherName = conversation?.otherUser?.name ?? "User";
  const typingLabel = useMemo(() => {
    if (!typingUsers || typingUsers.length === 0) return "";
    return `${otherName} is typing...`;
  }, [typingUsers, otherName]);

  const scrollToBottom = useCallback((smooth: boolean) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    nearBottomRef.current = true;
    setShowNewMessages(false);
  }, []);

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

  useEffect(() => {
    if (!conversationId || !messages) return;
    markRead({ conversationId }).catch(() => {});
  }, [conversationId, messages, markRead]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      stopTyping({ conversationId }).catch(() => {});
    };
  }, [conversationId, stopTyping]);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    nearBottomRef.current = isNearBottom(el);
    if (nearBottomRef.current) {
      setShowNewMessages(false);
    }
  }

  function handleInputChange(value: string) {
    setInput(value);
    if (!value.trim()) {
      stopTyping({ conversationId }).catch(() => {});
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      return;
    }

    const now = Date.now();
    if (now - lastTypingUpdateRef.current > 900) {
      lastTypingUpdateRef.current = now;
      setTyping({ conversationId }).catch(() => {});
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping({ conversationId }).catch(() => {});
    }, 1800);
  }

  async function handleSend() {
    const body = input.trim();
    if (!body || isSending) return;
    const previous = input;
    setSendError("");
    setIsSending(true);
    setInput("");
    try {
      await sendMessage({ conversationId, body });
      await stopTyping({ conversationId });
      scrollToBottom(true);
    } catch {
      setInput(previous);
      setSendError("Couldn't send. Try again.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] min-h-0 flex-col">
      <Authenticated>
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground md:hidden"
          >
            ← Back
          </Link>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5">
              <OnlineIndicator
                isOnlineValue={conversation?.otherUser?.isOnline}
                lastSeenAt={conversation?.otherUser?.lastSeenAt}
              />
              <span className="truncate text-sm font-medium">{otherName}</span>
            </span>
          </span>
        </div>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="relative flex-1 overflow-y-auto px-4 py-4"
        >
          {!messages || !conversation ? (
            <div className="space-y-3">
              <div className="h-16 animate-pulse rounded-lg bg-muted" />
              <div className="h-16 animate-pulse rounded-lg bg-muted" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="rounded-lg border border-border bg-muted/30 px-6 py-5 text-center">
                <p className="text-sm font-medium">Send your first message</p>
                <p className="text-xs text-muted-foreground">
                  Start the conversation with {otherName}.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => {
                const mine = message.authorClerkId === user?.id;
                return (
                  <div
                    key={message._id}
                    className={`flex ${mine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                        mine
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
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
        </div>

        <div className="border-t border-border px-3 py-2">
          {typingLabel ? (
            <p className="mb-1 text-xs text-muted-foreground">{typingLabel}</p>
          ) : (
            <div className="mb-1 h-4" />
          )}
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Type a message"
              rows={1}
              className="max-h-40 min-h-[40px] flex-1 resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend();
                }
              }}
            />
            <button
              type="button"
              onClick={() => void handleSend()}
              disabled={isSending || !input.trim()}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {isSending ? "Sending..." : "Send Message"}
            </button>
          </div>
          {sendError ? (
            <p className="mt-1 text-xs text-destructive">{sendError}</p>
          ) : null}
        </div>
      </Authenticated>

      <Unauthenticated>
        <div className="flex flex-1 items-center justify-center p-6 text-center">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Sign in to read and send messages.
            </p>
            <Link href="/sign-in" className="text-sm font-medium text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </Unauthenticated>
    </div>
  );
}