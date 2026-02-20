import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    salonId: v.id("salons"),
    name: v.string(),
    phone: v.optional(v.string()),
    availability: v.array(
      v.object({
        day: v.number(),
        startTime: v.string(),
        endTime: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("stylists", {
      ...args,
      isActive: true,
    });
  },
});

export const updateAvailability = mutation({
  args: {
    stylistId: v.id("stylists"),
    availability: v.array(
      v.object({
        day: v.number(),
        startTime: v.string(),
        endTime: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.stylistId, { availability: args.availability });
  },
});

export const deactivate = mutation({
  args: { stylistId: v.id("stylists") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.stylistId, { isActive: false });
  },
});
