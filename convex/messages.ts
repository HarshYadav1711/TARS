import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const send = mutation({
  args: {
    conversationId: v.id("conversations"),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const conv = await ctx.db.get(args.conversationId);
    if (!conv) throw new Error("Conversation not found");
    const authorClerkId = identity.subject;
    if (conv.participant1 !== authorClerkId && conv.participant2 !== authorClerkId) {
      throw new Error("Not a participant");
    }
    const body = args.body.trim();
    if (!body) throw new Error("Message cannot be empty");
    const now = Date.now();
    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      authorClerkId,
      body,
      createdAt: now,
    });
    const preview =
      body.length > 80 ? body.slice(0, 77) + "..." : body;
    await ctx.db.patch(args.conversationId, {
      lastMessageText: preview,
      lastMessageAt: now,
    });
  },
});

export const list = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const conv = await ctx.db.get(args.conversationId);
    if (!conv) return [];
    const me = identity.subject;
    if (conv.participant1 !== me && conv.participant2 !== me) return [];
    const all = await ctx.db.query("messages").collect();
    const messages = all
      .filter((m) => m.conversationId === args.conversationId)
      .sort((a, b) => a.createdAt - b.createdAt);
    return messages;
  },
});
