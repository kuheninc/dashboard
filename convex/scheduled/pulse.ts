"use node";

import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

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

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 512,
        messages: [
          {
            role: "user",
            content: `Generate a brief WhatsApp-friendly weekly pulse for a hair salon admin. Use bullet points, keep it under 200 words.

Data:
- Last 7 days: ${completed} completed, ${noShows} no-shows, ${cancelled} cancelled
- Next 7 days: ${upcoming} upcoming bookings
- Repeat no-show customers: ${offenders.length > 0 ? offenders.map((o) => `${o.name} (${o.noShowCount}x)`).join(", ") : "None"}
- Salon: ${salon.name}
- Date: ${fmt(now)}`,
          },
        ],
      });

      const text =
        response.content[0].type === "text"
          ? response.content[0].text
          : "Weekly summary unavailable.";

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
