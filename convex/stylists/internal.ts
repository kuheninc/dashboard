import { internalQuery } from "../_generated/server";
import { v } from "convex/values";

export const listBySalon = internalQuery({
  args: { salonId: v.id("salons") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("stylists")
      .withIndex("by_salon_active", (q) =>
        q.eq("salonId", args.salonId).eq("isActive", true)
      )
      .collect();
  },
});
