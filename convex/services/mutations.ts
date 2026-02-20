import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    salonId: v.id("salons"),
    name: v.string(),
    nameBM: v.optional(v.string()),
    description: v.optional(v.string()),
    durationMinutes: v.number(),
    priceRM: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("services", {
      ...args,
      isActive: true,
    });
  },
});

export const update = mutation({
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

export const deactivate = mutation({
  args: { serviceId: v.id("services") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.serviceId, { isActive: false });
  },
});
