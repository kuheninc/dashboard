"use node";

import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";
import { google } from "googleapis";

export const createEvent = internalAction({
  args: {
    salonId: v.id("salons"),
    bookingId: v.id("bookings"),
  },
  handler: async (ctx, args) => {
    const salon = await ctx.runQuery(internal.salons.internal.getById, {
      salonId: args.salonId,
    });
    if (!salon?.googleCalendarId || !salon?.googleServiceAccountKey) {
      return; // GCal not configured for this salon — silently skip
    }

    const booking = await ctx.runQuery(internal.bookings.internal.getById, {
      bookingId: args.bookingId,
    });
    if (!booking) return;

    const customer = await ctx.runQuery(internal.customers.internal.getById, {
      customerId: booking.customerId,
    });
    const service = await ctx.runQuery(internal.services.internal.getById, {
      serviceId: booking.serviceId,
    });
    const stylists = await ctx.runQuery(internal.stylists.internal.listBySalon, {
      salonId: args.salonId,
    });
    const stylist = stylists.find((s: { _id: string }) => s._id === booking.stylistId);

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(salon.googleServiceAccountKey),
      scopes: ["https://www.googleapis.com/auth/calendar.events"],
    });

    const calendar = google.calendar({ version: "v3", auth });

    const startDateTime = `${booking.date}T${booking.startTime}:00`;
    const endDateTime = `${booking.date}T${booking.endTime}:00`;

    try {
      const event = await calendar.events.insert({
        calendarId: salon.googleCalendarId,
        requestBody: {
          summary: `${service?.name ?? "Booking"} — ${customer?.name ?? "Customer"}`,
          description: [
            `Customer: ${customer?.name ?? "Unknown"} (${customer?.phone ?? ""})`,
            `Service: ${service?.name ?? "Unknown"} (${service?.durationMinutes ?? "?"}min, RM${service?.priceRM ?? "?"})`,
            `Stylist: ${stylist?.name ?? "Unknown"}`,
            `Status: ${booking.status}`,
            `Booking ID: ${args.bookingId}`,
          ].join("\n"),
          start: { dateTime: startDateTime, timeZone: salon.timezone },
          end: { dateTime: endDateTime, timeZone: salon.timezone },
        },
      });

      if (event.data.id) {
        await ctx.runMutation(internal.calendar.mutations.setGoogleEventId, {
          bookingId: args.bookingId,
          googleEventId: event.data.id,
        });
      }
    } catch (err) {
      console.error("GCal create event failed:", err);
      // Fire-and-forget — don't throw, don't block booking
    }
  },
});

export const deleteEvent = internalAction({
  args: {
    salonId: v.id("salons"),
    bookingId: v.id("bookings"),
  },
  handler: async (ctx, args) => {
    const salon = await ctx.runQuery(internal.salons.internal.getById, {
      salonId: args.salonId,
    });
    if (!salon?.googleCalendarId || !salon?.googleServiceAccountKey) {
      return;
    }

    const booking = await ctx.runQuery(internal.bookings.internal.getById, {
      bookingId: args.bookingId,
    });
    if (!booking?.googleEventId) return;

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(salon.googleServiceAccountKey),
      scopes: ["https://www.googleapis.com/auth/calendar.events"],
    });

    const calendar = google.calendar({ version: "v3", auth });

    try {
      await calendar.events.delete({
        calendarId: salon.googleCalendarId,
        eventId: booking.googleEventId,
      });
    } catch (err) {
      console.error("GCal delete event failed:", err);
      // Fire-and-forget
    }
  },
});
