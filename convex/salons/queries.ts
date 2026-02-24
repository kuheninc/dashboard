import { query } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const getById = query({
  args: { salonId: v.id("salons") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.salonId);
  },
});

export const getByWaPhoneNumberId = query({
  args: { waPhoneNumberId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("salons")
      .withIndex("by_waPhoneNumberId", (q) =>
        q.eq("waPhoneNumberId", args.waPhoneNumberId)
      )
      .unique();
  },
});

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("salons")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();
  },
});

export const getMySalon = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const membership = await ctx.db
      .query("salonMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!membership) return null;
    return await ctx.db.get(membership.salonId);
  },
});

export const getMySalons = query({
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
        return { ...salon, memberRole: m.role };
      })
    );

    return results.filter(Boolean);
  },
});
