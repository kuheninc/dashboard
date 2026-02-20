import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    name: v.string(),
    waPhoneNumberId: v.string(),
    waBusinessAccountId: v.string(),
    waAccessToken: v.string(),
    adminPhones: v.array(v.string()),
    address: v.string(),
    googleMapsLink: v.optional(v.string()),
    openingHours: v.array(
      v.object({
        day: v.number(),
        open: v.string(),
        close: v.string(),
        isClosed: v.boolean(),
      })
    ),
    closedDates: v.array(v.string()),
    timezone: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("salons", {
      ...args,
      isActive: true,
    });
  },
});

export const updateHours = mutation({
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

export const updateClosedDates = mutation({
  args: {
    salonId: v.id("salons"),
    closedDates: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.salonId, { closedDates: args.closedDates });
  },
});

export const updateWaToken = mutation({
  args: {
    salonId: v.id("salons"),
    waAccessToken: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.salonId, { waAccessToken: args.waAccessToken });
  },
});

export const updateAdminPhones = mutation({
  args: {
    salonId: v.id("salons"),
    adminPhones: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.salonId, { adminPhones: args.adminPhones });
  },
});
