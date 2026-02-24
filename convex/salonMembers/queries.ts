import { query } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const getMySalonMemberships = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const memberships = await ctx.db
      .query("salonMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const results = await Promise.all(
      memberships.map(async (m) => {
        const salon = await ctx.db.get(m.salonId);
        if (!salon || !salon.isActive) return null;
        return { salon, role: m.role, membershipId: m._id };
      })
    );

    return results.filter(Boolean);
  },
});

export const getByUserAndSalon = query({
  args: { salonId: v.id("salons") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("salonMembers")
      .withIndex("by_user_salon", (q) =>
        q.eq("userId", userId).eq("salonId", args.salonId)
      )
      .first();
  },
});
