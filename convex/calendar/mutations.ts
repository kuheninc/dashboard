import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

export const setGoogleEventId = internalMutation({
  args: {
    bookingId: v.id("bookings"),
    googleEventId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookingId, {
      googleEventId: args.googleEventId,
    });
  },
});
