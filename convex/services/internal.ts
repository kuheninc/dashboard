import { internalQuery, internalMutation } from "../_generated/server";
import { v } from "convex/values";

export const listBySalon = internalQuery({
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

export const getById = internalQuery({
  args: { serviceId: v.id("services") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.serviceId);
  },
});

export const create = internalMutation({
  args: {
    salonId: v.id("salons"),
    name: v.string(),
    nameBM: v.optional(v.string()),
    description: v.optional(v.string()),
    durationMinutes: v.number(),
    priceRM: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("services", { ...args, isActive: true });
  },
});

export const update = internalMutation({
  args: {
    serviceId: v.id("services"),
    name: v.optional(v.string()),
    nameBM: v.optional(v.string()),
    description: v.optional(v.string()),
    durationMinutes: v.optional(v.number()),
    priceRM: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { serviceId, ...fields } = args;
    const updates: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(fields)) {
      if (val !== undefined) updates[key] = val;
    }
    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(serviceId, updates);
    }
  },
});

export const deactivate = internalMutation({
  args: { serviceId: v.id("services") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.serviceId, { isActive: false });
  },
});
