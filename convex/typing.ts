import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** Typing state is considered valid for this many ms. */
const TYPING_TTL_MS = 4_000;

export const set = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;
    const conv = await ctx.db.get(args.conversationId);
    if (!conv) return;
    const clerkId = identity.subject;
    if (conv.participant1 !== clerkId && conv.participant2 !== clerkId) return;
    const now = Date.now();
    const all = await ctx.db.query("typing").collect();
    const existing = all.find(
      (t) =>
        t.conversationId === args.conversationId && t.clerkId === clerkId
    );
    if (existing) {
      await ctx.db.patch(existing._id, { updatedAt: now });
    } else {
      await ctx.db.insert("typing", {
        conversationId: args.conversationId,
        clerkId,
        updatedAt: now,
      });
    }
  },
});

export const stop = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;
    const clerkId = identity.subject;
    const all = await ctx.db.query("typing").collect();
    const mine = all.find(
      (t) =>
        t.conversationId === args.conversationId && t.clerkId === clerkId
    );
    if (mine) await ctx.db.delete(mine._id);
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
    const cutoff = Date.now() - TYPING_TTL_MS;
    const all = await ctx.db.query("typing").collect();
    return all
      .filter(
        (t) =>
          t.conversationId === args.conversationId &&
          t.clerkId !== me &&
          t.updatedAt > cutoff
      )
      .map((t) => t.clerkId);
  },
});
