import { query } from "../_generated/server";
import { v } from "convex/values";

export const getBySalon = query({
  args: { salonId: v.id("salons") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_salon_createdAt", (q) => q.eq("salonId", args.salonId))
      .order("desc")
      .take(50);
  },
});

export const getUnreadCount = query({
  args: { salonId: v.id("salons") },
  handler: async (ctx, args) => {
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_salon_read", (q) =>
        q.eq("salonId", args.salonId).eq("read", false)
      )
      .collect();
    return unread.length;
  },
});
