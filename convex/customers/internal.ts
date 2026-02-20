import { internalQuery, internalMutation } from "../_generated/server";
import { v } from "convex/values";

export const getByPhone = internalQuery({
  args: { salonId: v.id("salons"), phone: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("customers")
      .withIndex("by_salon_phone", (q) =>
        q.eq("salonId", args.salonId).eq("phone", args.phone)
      )
      .unique();
  },
});

export const getById = internalQuery({
  args: { customerId: v.id("customers") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.customerId);
  },
});

export const getRepeatOffenders = internalQuery({
  args: { salonId: v.id("salons"), threshold: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const minNoShows = args.threshold ?? 3;
    const customers = await ctx.db
      .query("customers")
      .withIndex("by_salon", (q) => q.eq("salonId", args.salonId))
      .collect();
    return customers
      .filter((c) => c.noShowCount >= minNoShows)
      .map((c) => ({ id: c._id, name: c.name, phone: c.phone, noShowCount: c.noShowCount }));
  },
});

export const create = internalMutation({
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
