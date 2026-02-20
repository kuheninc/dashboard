import { query } from "../_generated/server";
import { v } from "convex/values";

export const getByDate = query({
  args: { salonId: v.id("salons"), date: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookings")
      .withIndex("by_salon_date", (q) =>
        q.eq("salonId", args.salonId).eq("date", args.date)
      )
      .collect();
  },
});

export const getByDateRange = query({
  args: {
    salonId: v.id("salons"),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookings")
      .withIndex("by_salon_date", (q) =>
        q
          .eq("salonId", args.salonId)
          .gte("date", args.startDate)
          .lte("date", args.endDate)
      )
      .collect();
  },
});

export const getByStylistDate = query({
  args: { stylistId: v.id("stylists"), date: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookings")
      .withIndex("by_stylist_date", (q) =>
        q.eq("stylistId", args.stylistId).eq("date", args.date)
      )
      .collect();
  },
});

export const getByCustomer = query({
  args: { customerId: v.id("customers") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookings")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .collect();
  },
});

export const getPendingApproval = query({
  args: { salonId: v.id("salons") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookings")
      .withIndex("by_salon_status", (q) =>
        q.eq("salonId", args.salonId).eq("status", "pending_approval")
      )
      .collect();
  },
});
