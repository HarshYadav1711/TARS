import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const updateOrCreate = mutation({
  args: {
    name: v.string(),
    imageUrl: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const clerkId = identity.subject;
    const now = Date.now();
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        imageUrl: args.imageUrl,
        email: args.email,
        isOnline: true,
        lastSeen: now,
        updatedAt: now,
        lastSeenAt: now,
      });
      return existing._id;
    }
    return await ctx.db.insert("users", {
      clerkId,
      name: args.name,
      imageUrl: args.imageUrl,
      email: args.email,
      isOnline: true,
      lastSeen: now,
      updatedAt: now,
      lastSeenAt: now,
    });
  },
});

export const upsertUser = mutation({
  args: {
    name: v.string(),
    imageUrl: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const clerkId = identity.subject;
    const now = Date.now();
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        imageUrl: args.imageUrl,
        email: args.email,
        isOnline: true,
        lastSeen: now,
        updatedAt: now,
        lastSeenAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkId,
      name: args.name,
      imageUrl: args.imageUrl,
      email: args.email,
      isOnline: true,
      lastSeen: now,
      updatedAt: now,
      lastSeenAt: now,
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const listExceptCurrent = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const myClerkId = identity.subject;
    const all = await ctx.db.query("users").collect();
    return all.filter((u) => u.clerkId !== myClerkId);
  },
});

export const getUsers = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const myClerkId = identity.subject;

    const users = await ctx.db.query("users").collect();
    const conversations = await ctx.db.query("conversations").collect();
    const mine = users.filter((u) => u.clerkId !== myClerkId);

    return mine.map((user) => {
      const conversation = conversations.find((c) => {
        const isMine =
          c.participant1 === myClerkId || c.participant2 === myClerkId;
        const hasUser =
          c.participant1 === user.clerkId || c.participant2 === user.clerkId;
        return isMine && hasUser;
      });

      return {
        _id: user._id,
        clerkId: user.clerkId,
        name: user.name,
        imageUrl: user.imageUrl,
        isOnline: user.isOnline,
        updatedAt: user.updatedAt,
        lastSeenAt: user.lastSeenAt,
        conversationId: conversation?._id,
        lastMessageText: conversation?.lastMessageText,
        lastMessageAt: conversation?.lastMessageAt,
      };
    });
  },
});

export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});

export const heartbeat = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;
    const clerkId = identity.subject;
    const now = Date.now();
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        isOnline: true,
        lastSeen: now,
        lastSeenAt: now,
      });
    }
  },
});

export const setOffline = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!existing) return;
    await ctx.db.patch(existing._id, {
      isOnline: false,
      lastSeen: Date.now(),
      lastSeenAt: Date.now(),
    });
  },
});
