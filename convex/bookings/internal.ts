import { internalQuery, internalMutation, internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
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
    preferredStylistId: v.optional(v.id("stylists")),
  },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.serviceId);
    if (!service) throw new Error("Service not found");

    const endTime = addMinutesToTime(args.startTime, service.durationMinutes);
    const status =
      args.createdBy === "admin" ? "confirmed" : "pending_approval";

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

export const approve = internalMutation({
  args: { bookingId: v.id("bookings"), adminPhone: v.string() },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("Booking not found");

    await ctx.db.patch(args.bookingId, {
      status: "confirmed",
      approvedBy: args.adminPhone,
    });

    // Schedule customer confirmation notification + GCal sync
    await ctx.scheduler.runAfter(0, internal.bookings.internal.notifyCustomer, {
      bookingId: args.bookingId,
      salonId: booking.salonId,
      type: "approved",
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

    if (args.cancelledBy === "cancelled_admin") {
      // Notify customer + GCal cleanup
      await ctx.scheduler.runAfter(0, internal.bookings.internal.notifyCustomer, {
        bookingId: args.bookingId,
        salonId: booking.salonId,
        type: "cancelled",
        reason: args.reason,
      });
    } else {
      // Customer-initiated cancel: still need GCal cleanup
      await ctx.scheduler.runAfter(0, internal.calendar.sync.deleteEvent, {
        salonId: booking.salonId,
        bookingId: args.bookingId,
      });
    }
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

    // GCal cleanup
    await ctx.scheduler.runAfter(0, internal.calendar.sync.deleteEvent, {
      salonId: booking.salonId,
      bookingId: args.bookingId,
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

export const notifyCustomer = internalAction({
  args: {
    bookingId: v.id("bookings"),
    salonId: v.id("salons"),
    type: v.union(
      v.literal("approved"),
      v.literal("cancelled"),
      v.literal("rescheduled")
    ),
    reason: v.optional(v.string()),
    newDate: v.optional(v.string()),
    newTime: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.runQuery(internal.bookings.internal.getById, {
      bookingId: args.bookingId,
    });
    if (!booking) return;

    const customer = await ctx.runQuery(internal.customers.internal.getById, {
      customerId: booking.customerId,
    });
    if (!customer) return;

    const service = await ctx.runQuery(internal.services.internal.getById, {
      serviceId: booking.serviceId,
    });
    const serviceName = service?.name ?? "Service";

    let text: string;
    switch (args.type) {
      case "approved":
        text = `✅ Your booking is confirmed!\n${serviceName} on ${booking.date} at ${booking.startTime}.\nSee you there!`;
        // Sync to Google Calendar
        ctx.runAction(internal.calendar.sync.createEvent, {
          salonId: args.salonId,
          bookingId: args.bookingId,
        }).catch(() => {});
        break;
      case "cancelled":
        text = `❌ Your booking for ${serviceName} on ${booking.date} at ${booking.startTime} has been cancelled by the salon.`;
        if (args.reason) text += `\nReason: ${args.reason}`;
        text += `\nPlease message us if you'd like to rebook.`;
        // Remove from Google Calendar
        ctx.runAction(internal.calendar.sync.deleteEvent, {
          salonId: args.salonId,
          bookingId: args.bookingId,
        }).catch(() => {});
        break;
      case "rescheduled":
        text = `📅 Your booking has been rescheduled.\n${serviceName} is now on ${args.newDate ?? booking.date} at ${args.newTime ?? booking.startTime}.\nLet us know if this doesn't work for you!`;
        break;
    }

    await ctx.runAction(internal.whatsapp.send.sendTextMessage, {
      salonId: args.salonId,
      recipientPhone: customer.phone,
      text,
    });
  },
});

// Keep backward-compatible alias for existing scheduled jobs
export const notifyApproval = internalAction({
  args: {
    bookingId: v.id("bookings"),
    salonId: v.id("salons"),
  },
  handler: async (ctx, args) => {
    await ctx.runAction(internal.bookings.internal.notifyCustomer, {
      ...args,
      type: "approved",
    });
  },
});

export const reject = internalMutation({
  args: {
    bookingId: v.id("bookings"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("Booking not found");
    if (booking.status !== "pending_approval") {
      throw new Error("Can only reject pending bookings");
    }
    if (booking.reminderScheduledId) {
      await ctx.scheduler.cancel(booking.reminderScheduledId);
    }
    await ctx.db.patch(args.bookingId, {
      status: "rejected",
      rejectedReason: args.reason,
    });
  },
});

export const requestFeedback = internalMutation({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("Booking not found");
    if (booking.status !== "completed") throw new Error("Can only request feedback for completed bookings");
    if (booking.feedbackRequestedAt) throw new Error("Feedback already requested");
    await ctx.db.patch(args.bookingId, {
      feedbackRequestedAt: Date.now(),
    });
  },
});

export const submitFeedback = internalMutation({
  args: {
    bookingId: v.id("bookings"),
    rating: v.number(),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.rating < 1 || args.rating > 5) throw new Error("Rating must be 1-5");
    await ctx.db.patch(args.bookingId, {
      feedbackRating: args.rating,
      feedbackComment: args.comment,
      feedbackSubmittedAt: Date.now(),
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
