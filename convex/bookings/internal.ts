import { internalQuery, internalMutation } from "../_generated/server";
import { v } from "convex/values";

export const getByDate = internalQuery({
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

export const getByDateRange = internalQuery({
  args: { salonId: v.id("salons"), startDate: v.string(), endDate: v.string() },
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

export const getByStylistDate = internalQuery({
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

export const getByCustomer = internalQuery({
  args: { customerId: v.id("customers") },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("bookings")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .collect();
    // Return only upcoming/active bookings
    const now = new Date().toISOString().split("T")[0];
    return all.filter(
      (b) =>
        b.date >= now &&
        !b.status.startsWith("cancelled") &&
        b.status !== "no_show" &&
        b.status !== "completed"
    );
  },
});

export const getPendingApproval = internalQuery({
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

export const getById = internalQuery({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.bookingId);
  },
});

export const create = internalMutation({
  args: {
    salonId: v.id("salons"),
    customerId: v.id("customers"),
    stylistId: v.id("stylists"),
    serviceId: v.id("services"),
    date: v.string(),
    startTime: v.string(),
    createdBy: v.union(v.literal("customer"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.serviceId);
    if (!service) throw new Error("Service not found");

    const endTime = addMinutesToTime(args.startTime, service.durationMinutes);
    const status =
      args.createdBy === "admin" ? "confirmed" : "pending_approval";

    const bookingId = await ctx.db.insert("bookings", {
      salonId: args.salonId,
      customerId: args.customerId,
      stylistId: args.stylistId,
      serviceId: args.serviceId,
      date: args.date,
      startTime: args.startTime,
      endTime,
      status,
      createdBy: args.createdBy,
    });

    const customer = await ctx.db.get(args.customerId);
    if (customer) {
      await ctx.db.patch(args.customerId, {
        totalBookings: customer.totalBookings + 1,
      });
    }

    return bookingId;
  },
});

export const approve = internalMutation({
  args: { bookingId: v.id("bookings"), adminPhone: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookingId, {
      status: "confirmed",
      approvedBy: args.adminPhone,
    });
  },
});

export const cancel = internalMutation({
  args: {
    bookingId: v.id("bookings"),
    cancelledBy: v.union(
      v.literal("cancelled_customer"),
      v.literal("cancelled_admin")
    ),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("Booking not found");

    if (booking.reminderScheduledId) {
      await ctx.scheduler.cancel(booking.reminderScheduledId);
    }
    if (booking.checkinScheduledId) {
      await ctx.scheduler.cancel(booking.checkinScheduledId);
    }

    await ctx.db.patch(args.bookingId, {
      status: args.cancelledBy,
      cancelledReason: args.reason,
    });
  },
});

export const markNoShow = internalMutation({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("Booking not found");

    await ctx.db.patch(args.bookingId, { status: "no_show" });

    const customer = await ctx.db.get(booking.customerId);
    if (customer) {
      const newCount = customer.noShowCount + 1;
      await ctx.db.patch(booking.customerId, {
        noShowCount: newCount,
        isBlacklisted: newCount >= 3,
      });
    }

    await ctx.db.insert("noShowLog", {
      salonId: booking.salonId,
      customerId: booking.customerId,
      bookingId: args.bookingId,
      date: booking.date,
      flaggedAsRepeatOffender: (customer?.noShowCount ?? 0) + 1 >= 3,
    });
  },
});

export const markCompleted = internalMutation({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookingId, { status: "completed" });
  },
});

export const customerConfirm = internalMutation({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookingId, {
      status: "customer_confirmed",
      customerConfirmedAt: Date.now(),
    });
  },
});

export const markReminderSent = internalMutation({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookingId, { status: "reminder_sent" });
  },
});

export const setReminderScheduledId = internalMutation({
  args: {
    bookingId: v.id("bookings"),
    scheduledId: v.id("_scheduled_functions"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookingId, {
      reminderScheduledId: args.scheduledId,
    });
  },
});

export const setCheckinScheduledId = internalMutation({
  args: {
    bookingId: v.id("bookings"),
    scheduledId: v.id("_scheduled_functions"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookingId, {
      checkinScheduledId: args.scheduledId,
    });
  },
});

function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const totalMinutes = h * 60 + m + minutes;
  const newH = Math.floor(totalMinutes / 60) % 24;
  const newM = totalMinutes % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}
