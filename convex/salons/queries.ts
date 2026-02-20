import { query } from "../_generated/server";
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
