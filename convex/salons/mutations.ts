import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    name: v.string(),
    waPhoneNumberId: v.string(),
    waBusinessAccountId: v.string(),
    waAccessToken: v.string(),
    admins: v.array(
      v.object({
        username: v.string(),
        passwordHash: v.string(),
        phone: v.string(),
        role: v.union(v.literal("owner"), v.literal("admin")),
      })
    ),
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
    const { admins, ...rest } = args;

    // Check for duplicate usernames within this salon
    const usernames = admins.map((a) => a.username.toLowerCase());
    if (new Set(usernames).size !== usernames.length) {
      throw new Error("Each admin must have a unique username");
    }

    // Derive adminPhones from admins for backward compatibility
    const adminPhones = admins.map((a) => a.phone);

    return await ctx.db.insert("salons", {
      ...rest,
      admins,
      adminPhones,
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

export const updateInfo = mutation({
  args: {
    salonId: v.id("salons"),
    name: v.optional(v.string()),
    address: v.optional(v.string()),
    googleMapsLink: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { salonId, ...fields } = args;
    const updates: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(fields)) {
      if (val !== undefined) updates[key] = val;
    }
    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(salonId, updates);
    }
  },
});

export const createFromImport = mutation({
  args: {
    name: v.string(),
    address: v.string(),
    openingHours: v.array(
      v.object({
        day: v.number(),
        open: v.string(),
        close: v.string(),
        isClosed: v.boolean(),
      })
    ),
    timezone: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("salons", {
      ...args,
      waPhoneNumberId: "PENDING_SETUP",
      waBusinessAccountId: "PENDING_SETUP",
      waAccessToken: "PENDING_SETUP",
      adminPhones: [],
      closedDates: [],
      isActive: true,
    });
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
