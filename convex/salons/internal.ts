import { internalQuery, internalMutation } from "../_generated/server";
import { v } from "convex/values";

export const getById = internalQuery({
  args: { salonId: v.id("salons") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.salonId);
  },
});

export const getByWaPhoneNumberId = internalQuery({
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

export const listActive = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("salons")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();
  },
});

export const updateHours = internalMutation({
  args: {
    salonId: v.id("salons"),
    openingHours: v.array(
      v.object({
        day: v.number(),
        open: v.string(),
        close: v.string(),
        isClosed: v.boolean(),
      })
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.salonId, { openingHours: args.openingHours });
  },
});

export const updateClosedDates = internalMutation({
  args: {
    salonId: v.id("salons"),
    closedDates: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.salonId, { closedDates: args.closedDates });
  },
});
