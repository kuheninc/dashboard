"use node";

import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";

export const sendCheckin = internalAction({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const booking = await ctx.runQuery(internal.bookings.internal.getById, {
      bookingId: args.bookingId,
    });
    if (!booking) return;

    // Skip if already resolved
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

    const salon = await ctx.runQuery(internal.salons.internal.getById, {
      salonId: booking.salonId,
    });
    if (!salon) return;

    // Send check-in to each admin
    for (const adminPhone of salon.adminPhones) {
      // Update admin conversation state
      const conversation = await ctx.runQuery(
        internal.conversations.internal.getBySalonPhone,
        { salonId: booking.salonId, phone: adminPhone }
      );
      if (conversation) {
        await ctx.runMutation(internal.conversations.internal.updateState, {
          conversationId: conversation._id,
          state: "awaiting_checkin_response",
          flowData: { bookingId: args.bookingId, customerName: customer.name },
        });
      }

      await ctx.runAction(internal.whatsapp.send.sendTextMessage, {
        salonId: booking.salonId,
        recipientPhone: adminPhone,
        text: `Did ${customer.name} arrive for their ${booking.startTime} ${service?.name ?? "appointment"}?\n\nReply YES if they're here, or NO if they haven't shown up.`,
      });
    }
  },
});
