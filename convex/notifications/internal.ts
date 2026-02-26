import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

export const create = internalMutation({
  args: {
    salonId: v.id("salons"),
    type: v.union(
      v.literal("pending_booking"),
      v.literal("status_check"),
      v.literal("customer_cancelled"),
      v.literal("weekly_summary")
    ),
    title: v.string(),
    body: v.string(),
    bookingId: v.optional(v.id("bookings")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      salonId: args.salonId,
      type: args.type,
      title: args.title,
      body: args.body,
      bookingId: args.bookingId,
      read: false,
      actedOn: false,
      createdAt: Date.now(),
    });
  },
});
