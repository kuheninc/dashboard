"use node";

import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";

export const sendNudges = internalAction({
  args: {},
  handler: async (ctx) => {
    const salons = await ctx.runQuery(internal.salons.internal.listActive, {});

    for (const salon of salons) {
      for (const adminPhone of salon.adminPhones) {
        await ctx.runAction(internal.whatsapp.send.sendTextMessage, {
          salonId: salon._id,
          recipientPhone: adminPhone,
          text: `Monthly check-in for ${salon.name}! Please review and update:\n\n1. Services & prices — any changes?\n2. Staff availability for this month\n3. Any closed dates coming up?\n\nJust reply with what you'd like to update.`,
        });
      }
    }
  },
});
