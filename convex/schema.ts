import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  conversations: defineTable({
    participant1: v.string(),
    participant2: v.string(),
    createdAt: v.number(),
    lastMessageText: v.optional(v.string()),
    lastMessageAt: v.optional(v.number()),
  }).index("by_participants", ["participant1", "participant2"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    authorClerkId: v.string(),
    body: v.string(),
    createdAt: v.number(),
  }).index("by_conversation", ["conversationId"]),
});
