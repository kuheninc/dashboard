import { query } from "../_generated/server";
import { v } from "convex/values";

export const listBySalon = query({
  args: { salonId: v.id("salons") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("services")
      .withIndex("by_salon_active", (q) =>
        q.eq("salonId", args.salonId).eq("isActive", true)
      )
      .collect();
  },
});

export const listAllBySalon = query({
  args: { salonId: v.id("salons") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("services")
      .withIndex("by_salon", (q) => q.eq("salonId", args.salonId))
      .collect();
  },
});
