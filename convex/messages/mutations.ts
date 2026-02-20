import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const store = mutation({
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
