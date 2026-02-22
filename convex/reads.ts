import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const markRead = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;
    const conv = await ctx.db.get(args.conversationId);
    if (!conv) return;
    const clerkId = identity.subject;
    if (conv.participant1 !== clerkId && conv.participant2 !== clerkId) return;
    const now = Date.now();
    const all = await ctx.db.query("reads").collect();
    const existing = all.find(
      (r) =>
        r.conversationId === args.conversationId && r.clerkId === clerkId
    );
    if (existing) {
      await ctx.db.patch(existing._id, { lastReadAt: now });
    } else {
      await ctx.db.insert("reads", {
        conversationId: args.conversationId,
        clerkId,
        lastReadAt: now,
      });
    }
  },
});
