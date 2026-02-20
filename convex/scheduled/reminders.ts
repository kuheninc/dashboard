"use node";

import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";

export const sendReminder = internalAction({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const booking = await ctx.runQuery(internal.bookings.internal.getById, {
      bookingId: args.bookingId,
    });
    if (!booking) return;

    // Skip if already cancelled or completed
    if (
      booking.status.startsWith("cancelled") ||
      booking.status === "no_show" ||
      booking.status === "completed"
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

    // Mark booking as reminder_sent
    await ctx.runMutation(internal.bookings.internal.markReminderSent, {
      bookingId: args.bookingId,
    });

    // Update conversation state
    const conversation = await ctx.runQuery(
      internal.conversations.internal.getBySalonPhone,
      { salonId: booking.salonId, phone: customer.phone }
    );
    if (conversation) {
      await ctx.runMutation(internal.conversations.internal.updateState, {
        conversationId: conversation._id,
        state: "awaiting_reminder_response",
        flowData: { bookingId: args.bookingId },
      });
    }

    // Send reminder via WhatsApp
    await ctx.runAction(internal.whatsapp.send.sendTextMessage, {
      salonId: booking.salonId,
      recipientPhone: customer.phone,
      text: `Hi ${customer.name}! Your ${service?.name ?? "appointment"} is in 1 hour (${booking.date} at ${booking.startTime}).\n\nCan you still make it? Reply YES to confirm, or NO if you need to reschedule.`,
    });
  },
});
