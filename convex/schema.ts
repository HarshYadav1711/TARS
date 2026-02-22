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
  }).index("by_participants", ["participant1", "participant2"]),
});
