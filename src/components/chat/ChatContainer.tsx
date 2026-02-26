"use client";

import { ReactNode } from "react";

type ChatContainerProps = {
  header: ReactNode;
  messages: ReactNode;
  input: ReactNode;
};

export function ChatContainer({ header, messages, input }: ChatContainerProps) {
  return (
    <div className="flex h-[calc(100vh-3.5rem)] min-h-0 flex-col">
      {header}
      {messages}
      {input}
    </div>
  );
}
