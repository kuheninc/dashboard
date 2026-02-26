import { mutation } from "../_generated/server";
import { internal } from "../_generated/api";
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
    preferredStylistId: v.optional(v.id("stylists")),
  },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.serviceId);
    if (!service) throw new Error("Service not found");

    const endTime = addMinutesToTime(args.startTime, service.durationMinutes);

    // Conflict check: prevent double-booking the same stylist
    const existingBookings = await ctx.db
      .query("bookings")
      .withIndex("by_stylist_date", (q) =>
        q.eq("stylistId", args.stylistId).eq("date", args.date)
      )
      .collect();

    const activeStatuses = new Set(["pending", "confirmed"]);
    const hasConflict = existingBookings.some((b) => {
      if (!activeStatuses.has(b.status)) return false;
      return args.startTime < b.endTime && endTime > b.startTime;
    });

    if (hasConflict) {
      throw new Error(
        `Time slot conflict: stylist already has a booking overlapping ${args.startTime}-${endTime} on ${args.date}`
      );
    }

    const status =
      args.createdBy === "admin" ? "confirmed" : "pending";

    let preferredStylistName: string | undefined;
    if (args.preferredStylistId) {
      const prefStylist = await ctx.db.get(args.preferredStylistId);
      preferredStylistName = prefStylist?.name;
    }

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
      preferredStylistId: args.preferredStylistId,
      preferredStylistName,
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

export const approve = mutation({
  args: {
    bookingId: v.id("bookings"),
    adminPhone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("Booking not found");

    // Conflict check: ensure no confirmed booking overlaps this one
    const existingBookings = await ctx.db
      .query("bookings")
      .withIndex("by_stylist_date", (q) =>
        q.eq("stylistId", booking.stylistId).eq("date", booking.date)
      )
      .collect();

    const hasConflict = existingBookings.some((b) => {
      if (b._id === args.bookingId) return false;
      if (b.status !== "confirmed") return false;
      return booking.startTime < b.endTime && booking.endTime > b.startTime;
    });

    if (hasConflict) {
      throw new Error(
        `Cannot approve: stylist already has a confirmed booking overlapping ${booking.startTime}-${booking.endTime} on ${booking.date}`
      );
    }

    await ctx.db.patch(args.bookingId, {
      status: "confirmed",
      approvedBy: args.adminPhone ?? "dashboard",
    });

    await ctx.scheduler.runAfter(0, internal.bookings.internal.notifyCustomer, {
      bookingId: args.bookingId,
      salonId: booking.salonId,
      type: "approved",
    });

    // Schedule end-of-booking status check
    const bookingEndMs = dateTimeToMs(booking.date, booking.endTime);
    const delay = Math.max(0, bookingEndMs - Date.now());

    const statusCheckId = await ctx.scheduler.runAfter(
      delay,
      internal.scheduled.statusCheck.sendStatusCheck,
      { bookingId: args.bookingId }
    );
    await ctx.db.patch(args.bookingId, {
      statusCheckScheduledId: statusCheckId,
    });
  },
});

export const customerConfirm = mutation({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookingId, {
      customerConfirmedAt: Date.now(),
    });
  },
});

export const cancel = mutation({
  args: {
    bookingId: v.id("bookings"),
    cancelledBy: v.union(v.literal("customer"), v.literal("admin")),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("Booking not found");

    if (booking.reminderScheduledId) {
      await ctx.scheduler.cancel(booking.reminderScheduledId);
    }
    if (booking.statusCheckScheduledId) {
      await ctx.scheduler.cancel(booking.statusCheckScheduledId);
    }

    await ctx.db.patch(args.bookingId, {
      status: "cancelled",
      cancelledBy: args.cancelledBy,
      cancelledReason: args.reason,
    });

    if (args.cancelledBy === "admin") {
      await ctx.scheduler.runAfter(0, internal.bookings.internal.notifyCustomer, {
        bookingId: args.bookingId,
        salonId: booking.salonId,
        type: "cancelled",
        reason: args.reason,
      });
    } else {
      await ctx.scheduler.runAfter(0, internal.calendar.sync.deleteEvent, {
        salonId: booking.salonId,
        bookingId: args.bookingId,
      });
    }
  },
});

export const markNoShow = mutation({
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

    await ctx.scheduler.runAfter(0, internal.calendar.sync.deleteEvent, {
      salonId: booking.salonId,
      bookingId: args.bookingId,
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

export const reject = mutation({
  args: {
    bookingId: v.id("bookings"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("Booking not found");
    if (booking.status !== "pending") {
      throw new Error("Can only reject pending bookings");
    }
    if (booking.reminderScheduledId) {
      await ctx.scheduler.cancel(booking.reminderScheduledId);
    }
    await ctx.db.patch(args.bookingId, {
      status: "rejected",
      rejectedReason: args.reason,
    });

    await ctx.scheduler.runAfter(0, internal.bookings.actions.notifyRejectionWithAlternatives, {
      bookingId: args.bookingId,
      salonId: booking.salonId,
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

function dateTimeToMs(date: string, time: string): number {
  return new Date(`${date}T${time}:00+08:00`).getTime();
}
