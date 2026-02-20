import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    salonId: v.id("salons"),
    name: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("customers", {
      ...args,
      noShowCount: 0,
      totalBookings: 0,
      isBlacklisted: false,
    });
  },
});

export const update = mutation({
  args: {
    customerId: v.id("customers"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { customerId, ...fields } = args;
    const updates: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(fields)) {
      if (val !== undefined) updates[key] = val;
    }
    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(customerId, updates);
    }
  },
});

export const incrementNoShow = mutation({
  args: { customerId: v.id("customers") },
  handler: async (ctx, args) => {
    const customer = await ctx.db.get(args.customerId);
    if (!customer) throw new Error("Customer not found");
    const newCount = customer.noShowCount + 1;
    await ctx.db.patch(args.customerId, {
      noShowCount: newCount,
      isBlacklisted: newCount >= 3,
    });
  },
});
