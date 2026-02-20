import { query } from "../_generated/server";
import { v } from "convex/values";

export const getByPhone = query({
  args: { salonId: v.id("salons"), phone: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("customers")
      .withIndex("by_salon_phone", (q) =>
        q.eq("salonId", args.salonId).eq("phone", args.phone)
      )
      .unique();
  },
});

export const listBySalon = query({
  args: { salonId: v.id("salons") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("customers")
      .withIndex("by_salon", (q) => q.eq("salonId", args.salonId))
      .collect();
  },
});

export const getRepeatOffenders = query({
  args: { salonId: v.id("salons"), threshold: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const minNoShows = args.threshold ?? 3;
    const customers = await ctx.db
      .query("customers")
      .withIndex("by_salon", (q) => q.eq("salonId", args.salonId))
      .collect();
    return customers.filter((c) => c.noShowCount >= minNoShows);
  },
});
