import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function sortedParticipants(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export const getOrCreate = mutation({
  args: { otherUserClerkId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const myClerkId = identity.subject;
    if (args.otherUserClerkId === myClerkId) {
      throw new Error("Cannot start conversation with yourself");
    }
    const [p1, p2] = sortedParticipants(myClerkId, args.otherUserClerkId);
    const all = await ctx.db.query("conversations").collect();
    const existing = all.find(
      (c) => c.participant1 === p1 && c.participant2 === p2
    );
    if (existing) return existing._id;
    const now = Date.now();
    return await ctx.db.insert("conversations", {
      participant1: p1,
      participant2: p2,
      createdAt: now,
    });
  },
});

export const get = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const conv = await ctx.db.get(args.conversationId);
    if (!conv) return null;
    const myClerkId = identity.subject;
    if (conv.participant1 !== myClerkId && conv.participant2 !== myClerkId) {
      return null;
    }
    return conv;
  },
});
