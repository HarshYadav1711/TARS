import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    email: v.optional(v.string()),
    isOnline: v.optional(v.boolean()),
    lastSeen: v.optional(v.number()),
    updatedAt: v.number(),
    lastSeenAt: v.optional(v.number()),
  }).index("by_clerk_id", ["clerkId"]),

  conversations: defineTable({
    participant1: v.string(),
    participant2: v.string(),
    participantIds: v.optional(v.array(v.string())),
    createdAt: v.number(),
    lastMessageId: v.optional(v.id("messages")),
    lastMessageTime: v.optional(v.number()),
    lastMessageText: v.optional(v.string()),
    lastMessageAt: v.optional(v.number()),
  }).index("by_participants", ["participant1", "participant2"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.optional(v.string()),
    authorClerkId: v.string(),
    text: v.optional(v.string()),
    body: v.string(),
    createdAt: v.number(),
    isDeleted: v.optional(v.boolean()),
  }).index("by_conversation", ["conversationId"]),

  typing: defineTable({
    conversationId: v.id("conversations"),
    clerkId: v.string(),
    updatedAt: v.number(),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_conversation_clerk", ["conversationId", "clerkId"]),

  presence: defineTable({
    clerkId: v.string(),
    lastSeenAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  reads: defineTable({
    conversationId: v.id("conversations"),
    clerkId: v.string(),
    lastReadAt: v.number(),
    lastSeenMessageId: v.optional(v.id("messages")),
  }).index("by_conversation_clerk", ["conversationId", "clerkId"]),
});
