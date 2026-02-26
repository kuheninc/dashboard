"use node";

import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";

export const generateAndSend = internalAction({
  args: {},
  handler: async (ctx) => {
    const salons = await ctx.runQuery(internal.salons.internal.listActive, {});

    for (const salon of salons) {
      const now = new Date();
      const lastWeekStart = new Date(now);
      lastWeekStart.setDate(now.getDate() - 7);
      const nextWeekEnd = new Date(now);
      nextWeekEnd.setDate(now.getDate() + 7);

      const fmt = (d: Date) => d.toISOString().split("T")[0];

      const pastBookings = await ctx.runQuery(
        internal.bookings.internal.getByDateRange,
        { salonId: salon._id, startDate: fmt(lastWeekStart), endDate: fmt(now) }
      );
      const upcomingBookings = await ctx.runQuery(
        internal.bookings.internal.getByDateRange,
        { salonId: salon._id, startDate: fmt(now), endDate: fmt(nextWeekEnd) }
      );
      const offenders = await ctx.runQuery(
        internal.customers.internal.getRepeatOffenders,
        { salonId: salon._id }
      );

      const completed = pastBookings.filter((b) => b.status === "completed").length;
      const noShows = pastBookings.filter((b) => b.status === "no_show").length;
      const cancelled = pastBookings.filter((b) => b.status.startsWith("cancelled")).length;
      const upcoming = upcomingBookings.filter(
        (b) => !b.status.startsWith("cancelled") && b.status !== "no_show"
      ).length;

      const offendersList =
        offenders.length > 0
          ? offenders.map((o) => `  - ${o.name} (${o.noShowCount}x)`).join("\n")
          : "  None";

      const text = `Weekly Pulse for ${salon.name} (${fmt(now)})

Last 7 days:
  Completed: ${completed}
  No-shows: ${noShows}
  Cancelled: ${cancelled}

Next 7 days:
  Upcoming bookings: ${upcoming}

Repeat no-show customers:
${offendersList}`;

      for (const adminPhone of salon.adminPhones) {
        await ctx.runAction(internal.whatsapp.send.sendTextMessage, {
          salonId: salon._id,
          recipientPhone: adminPhone,
          text,
        });
      }
    }
  },
});
