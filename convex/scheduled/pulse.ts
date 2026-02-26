"use node";

import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";

// Fan-out: list active salons and schedule one action per salon.
// Prevents a single long-running action from blocking all salons sequentially.
export const generateAndSend = internalAction({
  args: {},
  handler: async (ctx) => {
    const salons = await ctx.runQuery(internal.salons.internal.listActive, {});
    for (const salon of salons) {
      await ctx.scheduler.runAfter(0, internal.scheduled.pulse.generateForSalon, {
        salonId: salon._id,
      });
    }
  },
});

export const generateForSalon = internalAction({
  args: { salonId: v.id("salons") },
  handler: async (ctx, args) => {
    const salon = await ctx.runQuery(internal.salons.internal.getById, {
      salonId: args.salonId,
    });
    if (!salon || !salon.isActive) return;

    const now = new Date();
    const lastWeekStart = new Date(now);
    lastWeekStart.setDate(now.getDate() - 7);
    const nextWeekEnd = new Date(now);
    nextWeekEnd.setDate(now.getDate() + 7);

    const fmt = (d: Date) => d.toISOString().split("T")[0];

    const pastBookings = await ctx.runQuery(
      internal.bookings.internal.getByDateRange,
      { salonId: args.salonId, startDate: fmt(lastWeekStart), endDate: fmt(now) }
    );
    const upcomingBookings = await ctx.runQuery(
      internal.bookings.internal.getByDateRange,
      { salonId: args.salonId, startDate: fmt(now), endDate: fmt(nextWeekEnd) }
    );
    const offenders = await ctx.runQuery(
      internal.customers.internal.getRepeatOffenders,
      { salonId: args.salonId }
    );

    const completed = pastBookings.filter((b) => b.status === "completed").length;
    const noShows = pastBookings.filter((b) => b.status === "no_show").length;
    const cancelled = pastBookings.filter((b) => b.status === "cancelled").length;
    const upcoming = upcomingBookings.filter(
      (b) => b.status !== "cancelled" && b.status !== "no_show" && b.status !== "rejected"
    ).length;

    const offendersList =
      offenders.length > 0
        ? offenders.map((o: { name: string; noShowCount: number }) => `  - ${o.name} (${o.noShowCount}x)`).join("\n")
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
        salonId: args.salonId,
        recipientPhone: adminPhone,
        text,
      });
    }

    // Create dashboard notification
    await ctx.runMutation(internal.notifications.internal.create, {
      salonId: args.salonId,
      type: "weekly_summary" as const,
      title: "Weekly pulse available",
      body: `${completed} completed, ${noShows} no-shows, ${upcoming} upcoming`,
    });
  },
});
