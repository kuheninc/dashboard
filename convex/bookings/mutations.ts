import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const create = mutation({
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

    // Increment customer's total bookings
    const customer = await ctx.db.get(args.customerId);
    if (customer) {
      await ctx.db.patch(args.customerId, {
        totalBookings: customer.totalBookings + 1,
      });
    }

    return bookingId;
  },
});

export const approve = mutation({
  args: {
    bookingId: v.id("bookings"),
    adminPhone: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookingId, {
      status: "confirmed",
      approvedBy: args.adminPhone,
    });
  },
});

export const customerConfirm = mutation({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookingId, {
      status: "customer_confirmed",
      customerConfirmedAt: Date.now(),
    });
  },
});

export const cancel = mutation({
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

    // Cancel scheduled reminders/check-ins
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

export const markNoShow = mutation({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("Booking not found");

    await ctx.db.patch(args.bookingId, { status: "no_show" });

    // Increment customer no-show count
    const customer = await ctx.db.get(booking.customerId);
    if (customer) {
      const newCount = customer.noShowCount + 1;
      await ctx.db.patch(booking.customerId, {
        noShowCount: newCount,
        isBlacklisted: newCount >= 3,
      });
    }

    // Create no-show log entry
    await ctx.db.insert("noShowLog", {
      salonId: booking.salonId,
      customerId: booking.customerId,
      bookingId: args.bookingId,
      date: booking.date,
      flaggedAsRepeatOffender: (customer?.noShowCount ?? 0) + 1 >= 3,
    });
  },
});

export const markCompleted = mutation({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookingId, { status: "completed" });
  },
});

export const setReminderScheduledId = mutation({
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

export const setCheckinScheduledId = mutation({
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

export const markReminderSent = mutation({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookingId, { status: "reminder_sent" });
  },
});

// Helper: add minutes to a "HH:MM" time string
function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const totalMinutes = h * 60 + m + minutes;
  const newH = Math.floor(totalMinutes / 60) % 24;
  const newM = totalMinutes % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}
