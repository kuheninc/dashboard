"use node";

import { action, internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";

export const requestFeedback = action({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const booking = await ctx.runQuery(internal.bookings.internal.getById, {
      bookingId: args.bookingId,
    });
    if (!booking) throw new Error("Booking not found");
    if (booking.status !== "completed") throw new Error("Only completed bookings");
    if (booking.feedbackRequestedAt) throw new Error("Already requested");

    await ctx.runMutation(internal.bookings.internal.requestFeedback, {
      bookingId: args.bookingId,
    });

    const customer = await ctx.runQuery(internal.customers.internal.getById, {
      customerId: booking.customerId,
    });
    const service = await ctx.runQuery(internal.services.internal.getById, {
      serviceId: booking.serviceId,
    });
    if (!customer) throw new Error("Customer not found");

    // Placeholder Google Review link — replace with salon's actual link
    const reviewLink = "https://g.page/r/CbGzk5R3jVIpEBM/review";

    await ctx.runAction(internal.whatsapp.send.sendTextMessage, {
      salonId: booking.salonId,
      recipientPhone: customer.phone,
      text: `Hi ${customer.name}! Thank you for visiting us for your ${service?.name ?? "appointment"} on ${booking.date}. We hope you had a great experience! 😊\n\nWe'd really appreciate it if you could leave us a quick review:\n${reviewLink}\n\nThank you for your support! 🙏`,
    });

    return { success: true };
  },
});

export const notifyRejectionWithAlternatives = internalAction({
  args: {
    bookingId: v.id("bookings"),
    salonId: v.id("salons"),
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
    const serviceName = service?.name ?? "appointment";

    // Check availability for same service + date to find alternatives
    const salon = await ctx.runQuery(internal.salons.internal.getById, {
      salonId: args.salonId,
    });
    if (!salon) return;

    // Inline availability check for alternatives
    const stylists = await ctx.runQuery(internal.stylists.internal.listBySalon, {
      salonId: args.salonId,
    });

    const slots: { startTime: string; endTime: string; stylistName: string }[] = [];

    if (service && !salon.closedDates.includes(booking.date)) {
      const dayOfWeek = new Date(booking.date + "T00:00:00").getDay();
      const dayHours = salon.openingHours.find((h: { day: number }) => h.day === dayOfWeek);

      if (dayHours && !dayHours.isClosed) {
        for (const stylist of stylists) {
          const stylistDay = stylist.availability.find((a: { day: number }) => a.day === dayOfWeek);
          if (!stylistDay) continue;

          const existingBookings = await ctx.runQuery(
            internal.bookings.internal.getByStylistDate,
            { stylistId: stylist._id, date: booking.date }
          );
          const activeBookings = existingBookings.filter(
            (b: Record<string, unknown>) =>
              b.status !== "cancelled" &&
              b.status !== "no_show" &&
              b.status !== "rejected"
          );

          const toMin = (t: string) => {
            const [h, m] = t.split(":").map(Number);
            return h * 60 + m;
          };
          const toStr = (m: number) => {
            const h = Math.floor(m / 60) % 24;
            const min = m % 60;
            return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
          };

          const slotStart = toMin(stylistDay.startTime);
          const slotEnd = toMin(stylistDay.endTime);

          for (let t = slotStart; t + service.durationMinutes <= slotEnd; t += 15) {
            const hasConflict = activeBookings.some((b: Record<string, unknown>) => {
              const bStart = toMin(b.startTime as string);
              const bEnd = toMin(b.endTime as string);
              return t < bEnd && t + service.durationMinutes > bStart;
            });
            if (!hasConflict) {
              slots.push({
                startTime: toStr(t),
                endTime: toStr(t + service.durationMinutes),
                stylistName: stylist.name,
              });
            }
          }
        }
      }
    }

    // Sort by proximity to original time
    const origMin = (() => {
      const [h, m] = booking.startTime.split(":").map(Number);
      return h * 60 + m;
    })();
    const sorted = slots
      .map((s) => ({
        ...s,
        distance: Math.abs((() => {
          const [h, m] = s.startTime.split(":").map(Number);
          return h * 60 + m;
        })() - origMin),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);

    let text: string;
    if (sorted.length > 0) {
      const slotList = sorted
        .map((s, i) => `${i + 1}. ${s.startTime} - ${s.endTime}`)
        .join("\n");
      text = `We're sorry, your ${serviceName} request for ${booking.date} at ${booking.startTime} couldn't be accommodated.\n\nHere are some alternative times on the same day:\n${slotList}\n\nWould you like to book one of these? Or reply with a different date.`;
    } else {
      text = `We're sorry, your ${serviceName} request for ${booking.date} at ${booking.startTime} couldn't be accommodated, and no other slots are available on that date.\n\nWould you like to try a different date?`;
    }

    await ctx.runAction(internal.whatsapp.send.sendTextMessage, {
      salonId: args.salonId,
      recipientPhone: customer.phone,
      text,
    });

    // Set customer conversation to booking flow so they can rebook
    const conversation = await ctx.runQuery(
      internal.conversations.internal.getBySalonPhone,
      { salonId: args.salonId, phone: customer.phone }
    );
    if (conversation) {
      await ctx.runMutation(internal.conversations.internal.updateState, {
        conversationId: conversation._id,
        state: "booking_flow",
      });
    }
  },
});
