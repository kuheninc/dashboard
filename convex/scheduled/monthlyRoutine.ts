"use node";

import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";

// Fan-out: list active salons and schedule one action per salon.
export const sendNudges = internalAction({
  args: {},
  handler: async (ctx) => {
    const salons = await ctx.runQuery(internal.salons.internal.listActive, {});
    for (const salon of salons) {
      await ctx.scheduler.runAfter(0, internal.scheduled.monthlyRoutine.sendNudgeForSalon, {
        salonId: salon._id,
      });
    }
  },
});

export const sendNudgeForSalon = internalAction({
  args: { salonId: v.id("salons") },
  handler: async (ctx, args) => {
    const salon = await ctx.runQuery(internal.salons.internal.getById, {
      salonId: args.salonId,
    });
    if (!salon || !salon.isActive) return;

    for (const adminPhone of salon.adminPhones) {
      await ctx.runAction(internal.whatsapp.send.sendTextMessage, {
        salonId: args.salonId,
        recipientPhone: adminPhone,
        text: `Monthly check-in for ${salon.name}! Please review in your dashboard:\n\n1. Services & prices\n2. Staff availability\n3. Closed dates\n\nHead to your dashboard to make any updates.`,
      });
    }
  },
});
