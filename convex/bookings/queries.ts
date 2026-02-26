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
        q.eq("salonId", args.salonId).eq("status", "pending")
      )
      .collect();
  },
});

export const checkConflicts = query({
  args: {
    salonId: v.id("salons"),
    stylistId: v.id("stylists"),
    date: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    excludeBookingId: v.optional(v.id("bookings")),
  },
  handler: async (ctx, args) => {
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_salon_stylist_date", (q) =>
        q
          .eq("salonId", args.salonId)
          .eq("stylistId", args.stylistId)
          .eq("date", args.date)
      )
      .collect();

    const activeStatuses = ["pending", "confirmed"];

    const toMin = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };

    return bookings.filter((b) => {
      if (args.excludeBookingId && b._id === args.excludeBookingId)
        return false;
      if (!activeStatuses.includes(b.status)) return false;
      const bStart = toMin(b.startTime);
      const bEnd = toMin(b.endTime);
      const newStart = toMin(args.startTime);
      const newEnd = toMin(args.endTime);
      return newStart < bEnd && newEnd > bStart;
    });
  },
});
