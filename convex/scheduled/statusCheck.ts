"use node";

import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";

export const sendStatusCheck = internalAction({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const booking = await ctx.runQuery(internal.bookings.internal.getById, {
      bookingId: args.bookingId,
    });
    if (!booking) return;

    // Skip if already resolved
    if (
      booking.status === "completed" ||
      booking.status === "no_show" ||
      booking.status === "cancelled" ||
      booking.status === "rejected"
    ) {
      return;
    }

    const customer = await ctx.runQuery(internal.customers.internal.getById, {
      customerId: booking.customerId,
    });
    if (!customer) return;

    const service = await ctx.runQuery(internal.services.internal.getById, {
      serviceId: booking.serviceId,
    });

    const salon = await ctx.runQuery(internal.salons.internal.getById, {
      salonId: booking.salonId,
    });
    if (!salon) return;

    // Send WhatsApp to each admin
    for (const adminPhone of salon.adminPhones) {
      await ctx.runAction(internal.whatsapp.send.sendTextMessage, {
        salonId: booking.salonId,
        recipientPhone: adminPhone,
        text: `Booking for ${customer.name} (${service?.name ?? "appointment"}, ${booking.startTime}-${booking.endTime}) just ended.\nPlease mark as completed or no-show in the dashboard.`,
      });
    }

    // Create dashboard notification
    await ctx.runMutation(internal.notifications.internal.create, {
      salonId: booking.salonId,
      type: "status_check" as const,
      title: `Status check: ${customer.name}`,
      body: `${service?.name ?? "Appointment"} (${booking.startTime}-${booking.endTime}) just ended. Mark as completed or no-show.`,
      bookingId: args.bookingId,
    });
  },
});
