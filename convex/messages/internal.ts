import { internalQuery, internalMutation } from "../_generated/server";
import { v } from "convex/values";

export const getRecent = internalQuery({
  args: {
    conversationId: v.id("conversations"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("desc")
      .take(limit);
    return messages.reverse();
  },
});

export const store = internalMutation({
  args: {
    salonId: v.id("salons"),
    conversationId: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("messages", {
      ...args,
      timestamp: Date.now(),
    });
  },
});
