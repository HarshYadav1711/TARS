"use client";

import { useQuery, Authenticated, Unauthenticated } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { MessageInput } from "@/components/chat/MessageInput";

export default function ConversationPage() {
  const params = useParams<{ conversationId: string }>();
  const conversationId = params.conversationId as Id<"conversations">;
  const { user } = useUser();

  const conversation = useQuery(api.conversations.getWithOtherUser, {
    conversationId,
  });
  const typingUsers = useQuery(api.typing.list, { conversationId });

  const otherName = conversation?.otherUser?.name ?? "User";
  const typingLabel = useMemo(() => {
    if (!typingUsers || typingUsers.length === 0) return "";
    return `${otherName} is typing...`;
  }, [typingUsers, otherName]);

  return (
    <>
      <Authenticated>
        <ChatContainer
          header={
            <ChatHeader
              participantName={otherName}
              isOnline={conversation?.otherUser?.isOnline}
              lastSeenAt={conversation?.otherUser?.lastSeenAt}
            />
          }
          messages={
            <ChatMessages
              conversationId={conversationId}
              currentUserId={user?.id}
              participantName={otherName}
            />
          }
          input={
            <MessageInput
              conversationId={conversationId}
              typingLabel={typingLabel}
            />
          }
        />
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
    </>
  );
}