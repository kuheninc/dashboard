import { mutation } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    salonId: v.id("salons"),
    role: v.union(v.literal("owner"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if membership already exists
    const existing = await ctx.db
      .query("salonMembers")
      .withIndex("by_user_salon", (q) =>
        q.eq("userId", userId).eq("salonId", args.salonId)
      )
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("salonMembers", {
      userId,
      salonId: args.salonId,
      role: args.role,
    });
  },
});
