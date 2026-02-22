"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useRef, useEffect, useState } from "react";
import { formatMessageTimestamp } from "@/lib/format";
import { OnlineIndicator } from "@/components/OnlineIndicator";

export default function ChatPage() {
  const params = useParams();
  const conversationId = params.conversationId as string;
  const { user } = useUser();
  const myClerkId = user?.id ?? null;

  const data = useQuery(
    api.conversations.getWithOtherUser,
    conversationId ? { conversationId } : "skip"
  );
  const messages = useQuery(
    api.messages.list,
    conversationId ? { conversationId } : "skip"
  );
  const sendMessage = useMutation(api.messages.send);
  const markRead = useMutation(api.reads.markRead);
  const setTyping = useMutation(api.typing.set);
  const stopTyping = useMutation(api.typing.stop);
  const typingUserIds = useQuery(
    api.typing.list,
    conversationId ? { conversationId } : "skip"
  );
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const listEndRef = useRef<HTMLLIElement>(null);
  const scrollContainerRef = useRef<HTMLUListElement>(null);
  const stopTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const NEAR_BOTTOM_THRESHOLD_PX = 80;

  function checkNearBottom() {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const near = scrollHeight - scrollTop - clientHeight <= NEAR_BOTTOM_THRESHOLD_PX;
    setIsNearBottom(near);
  }

  function scrollToBottom() {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setIsNearBottom(true);
  }

  useEffect(() => {
    if (conversationId) markRead({ conversationId }).catch(() => {});
  }, [conversationId, markRead]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkNearBottom, { passive: true });
    return () => el.removeEventListener("scroll", checkNearBottom);
  }, []);

  useEffect(() => {
    if (messages === undefined) return;
    if (isNearBottom) {
      listEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages?.length, isNearBottom]);

  useEffect(() => {
    if (!conversationId) return;
    if (setTypingTimeoutRef.current) clearTimeout(setTypingTimeoutRef.current);
    if (stopTypingTimeoutRef.current) {
      clearTimeout(stopTypingTimeoutRef.current);
      stopTypingTimeoutRef.current = null;
    }
    if (!body.trim()) {
      stopTyping({ conversationId }).catch(() => {});
      return;
    }
    setTypingTimeoutRef.current = setTimeout(() => {
      setTyping({ conversationId }).catch(() => {});
      setTypingTimeoutRef.current = null;
    }, 300);
    stopTypingTimeoutRef.current = setTimeout(() => {
      stopTyping({ conversationId }).catch(() => {});
      stopTypingTimeoutRef.current = null;
    }, 2_000);
    return () => {
      if (setTypingTimeoutRef.current) clearTimeout(setTypingTimeoutRef.current);
      if (stopTypingTimeoutRef.current)
        clearTimeout(stopTypingTimeoutRef.current);
    };
  }, [conversationId, body, setTyping, stopTyping]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text || !conversationId || sending) return;
    if (stopTypingTimeoutRef.current) {
      clearTimeout(stopTypingTimeoutRef.current);
      stopTypingTimeoutRef.current = null;
    }
    if (setTypingTimeoutRef.current) {
      clearTimeout(setTypingTimeoutRef.current);
      setTypingTimeoutRef.current = null;
    }
    stopTyping({ conversationId }).catch(() => {});
    setSending(true);
    setBody("");
    try {
      await sendMessage({ conversationId, body: text });
    } finally {
      setSending(false);
    }
  }

  if (data === undefined || messages === undefined) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <span className="text-sm text-muted-foreground">Loading…</span>
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center gap-4 p-8">
        <p className="text-muted-foreground">Conversation not found.</p>
        <Link href="/" className="text-sm font-medium text-primary hover:underline">
          Back to conversations
        </Link>
      </div>
    );
  }

  const { otherUser } = data;
  const otherIsTyping =
    Array.isArray(typingUserIds) &&
    otherUser.clerkId !== undefined &&
    (typingUserIds as string[]).includes(otherUser.clerkId);

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      <div className="flex shrink-0 items-center border-b border-border px-4 py-2">
        <Link
          href="/"
          className="mr-3 text-muted-foreground hover:text-foreground md:hidden"
          aria-label="Back to conversations"
        >
          ←
        </Link>
        <span className="flex items-center gap-1.5 font-medium text-foreground">
          <OnlineIndicator lastSeenAt={otherUser.lastSeenAt} />
          {otherUser.name}
        </span>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col">
        <ul
          ref={scrollContainerRef}
          className="flex flex-1 flex-col gap-2 overflow-y-auto p-4"
        >
          {otherIsTyping && (
          <li className="text-xs text-muted-foreground">
            {otherUser.name} is typing…
          </li>
        )}
        {messages.length === 0 && (
          <li className="flex flex-1 flex-col items-center justify-center py-12">
            <div className="flex max-w-xs flex-col gap-2 rounded-lg border border-border bg-muted/30 px-6 py-8 text-center">
              <p className="text-sm font-medium text-foreground">
                No messages in this conversation yet
              </p>
              <p className="text-sm text-muted-foreground">
                Send a message below to start the conversation.
              </p>
            </div>
          </li>
        )}
        {messages.map((msg: { _id: string; authorClerkId: string; body: string; createdAt: number }) => {
          const isMe = msg.authorClerkId === myClerkId;
          return (
            <li
              key={msg._id}
              className={`flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  isMe
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{msg.body}</p>
              </div>
              <span
                className={`text-xs text-muted-foreground ${isMe ? "mr-1" : "ml-1"}`}
                aria-hidden
              >
                {formatMessageTimestamp(msg.createdAt)}
              </span>
            </li>
          );
        })}
          <li ref={listEndRef} aria-hidden className="list-none" />
        </ul>
        {!isNearBottom && messages.length > 0 && (
          <button
            type="button"
            onClick={scrollToBottom}
            className="absolute bottom-2 left-4 right-4 rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            New messages
          </button>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex shrink-0 gap-2 border-t border-border p-4"
      >
        <input
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type a message…"
          className="min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          disabled={sending}
          aria-label="Message"
        />
        <button
          type="submit"
          disabled={sending || !body.trim()}
          className="shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
