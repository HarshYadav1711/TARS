import { mutation } from "./_generated/server";

export const ping = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;
    const clerkId = identity.subject;
    const now = Date.now();

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();
    if (existingUser) {
      await ctx.db.patch(existingUser._id, { lastSeenAt: now });
    }

    const existingPresence = await ctx.db
      .query("presence")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();
    if (existingPresence) {
      await ctx.db.patch(existingPresence._id, { lastSeenAt: now });
      return;
    }

    await ctx.db.insert("presence", {
      clerkId,
      lastSeenAt: now,
    });
  },
});
