import { query } from "../_generated/server";
import { v } from "convex/values";

export const getBySalonPhone = query({
  args: { salonId: v.id("salons"), phone: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("conversations")
      .withIndex("by_salon_phone", (q) =>
        q.eq("salonId", args.salonId).eq("phone", args.phone)
      )
      .unique();
  },
});
