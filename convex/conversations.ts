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

export const getWithOtherUser = query({
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
    const otherClerkId =
      conv.participant1 === myClerkId ? conv.participant2 : conv.participant1;
    const users = await ctx.db.query("users").collect();
    const otherUser = users.find((u) => u.clerkId === otherClerkId);
    return {
      conversation: conv,
      otherUser: otherUser
        ? {
            clerkId: otherUser.clerkId,
            name: otherUser.name,
            imageUrl: otherUser.imageUrl,
            lastSeenAt: otherUser.lastSeenAt,
          }
        : {
            clerkId: otherClerkId,
            name: "Unknown",
            imageUrl: undefined,
            lastSeenAt: undefined,
          },
    };
  },
});

export const listForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const myClerkId = identity.subject;
    const all = await ctx.db.query("conversations").collect();
    const mine = all.filter(
      (c) => c.participant1 === myClerkId || c.participant2 === myClerkId
    );
    const users = await ctx.db.query("users").collect();
    const reads = await ctx.db.query("reads").collect();
    const messages = await ctx.db.query("messages").collect();
    const result = mine.map((conv) => {
      const otherClerkId =
        conv.participant1 === myClerkId ? conv.participant2 : conv.participant1;
      const otherUser = users.find((u) => u.clerkId === otherClerkId);
      const read = reads.find(
        (r) => r.conversationId === conv._id && r.clerkId === myClerkId
      );
      const lastReadAt = read?.lastReadAt ?? 0;
      const convMessages = messages.filter(
        (m) => m.conversationId === conv._id && m.authorClerkId !== myClerkId && m.createdAt > lastReadAt
      );
      const unreadCount = convMessages.length;
      return {
        _id: conv._id,
        otherUser: otherUser
          ? {
              clerkId: otherUser.clerkId,
              name: otherUser.name,
              imageUrl: otherUser.imageUrl,
              lastSeenAt: otherUser.lastSeenAt,
            }
          : {
              clerkId: otherClerkId,
              name: "Unknown",
              imageUrl: undefined,
              lastSeenAt: undefined,
            },
        lastMessageText: conv.lastMessageText,
        lastMessageAt: conv.lastMessageAt ?? conv.createdAt,
        unreadCount,
      };
    });
    result.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
    return result;
  },
});
