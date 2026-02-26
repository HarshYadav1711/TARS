"use client";

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useEffect, useRef, useState } from "react";

type MessageInputProps = {
  conversationId: Id<"conversations">;
  typingLabel: string;
  onSent?: () => void;
};

export function MessageInput({
  conversationId,
  typingLabel,
  onSent,
}: MessageInputProps) {
  const sendMessage = useMutation(api.messages.send);
  const setTyping = useMutation(api.typing.set);
  const stopTyping = useMutation(api.typing.stop);

  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState("");

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingUpdateRef = useRef(0);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      void stopTyping({ conversationId }).catch(() => {});
    };
  }, [conversationId, stopTyping]);

  function updateTypingState(value: string) {
    if (!value.trim()) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      void stopTyping({ conversationId }).catch(() => {});
      return;
    }
    const now = Date.now();
    if (now - lastTypingUpdateRef.current > 900) {
      lastTypingUpdateRef.current = now;
      void setTyping({ conversationId }).catch(() => {});
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      void stopTyping({ conversationId }).catch(() => {});
    }, 2000);
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
      onSent?.();
    } catch {
      setInput(previous);
      setSendError("Couldn't send. Try again.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="border-t border-border px-3 py-2">
      {typingLabel ? (
        <p className="mb-1 text-xs text-muted-foreground">{typingLabel}</p>
      ) : (
        <div className="mb-1 h-4" />
      )}
      <div className="flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e) => {
            const value = e.target.value;
            setInput(value);
            updateTypingState(value);
          }}
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
          {isSending ? "Sending..." : "Send"}
        </button>
      </div>
      {sendError ? <p className="mt-1 text-xs text-destructive">{sendError}</p> : null}
    </div>
  );
}
