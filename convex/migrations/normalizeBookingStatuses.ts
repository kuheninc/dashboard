import { internalMutation } from "../_generated/server";

const STATUS_MAP: Record<string, string> = {
  pending_approval: "pending",
  reminder_sent: "confirmed",
  customer_confirmed: "confirmed",
  cancelled_customer: "cancelled",
  cancelled_admin: "cancelled",
  reschedule_pending: "confirmed",
};

const CANCELLED_BY_MAP: Record<string, "customer" | "admin"> = {
  cancelled_customer: "customer",
  cancelled_admin: "admin",
};

export const run = internalMutation({
  args: {},
  handler: async (ctx) => {
    const bookings = await ctx.db.query("bookings").collect();
    let updated = 0;

    for (const booking of bookings) {
      const oldStatus = booking.status as string;
      const newStatus = STATUS_MAP[oldStatus];
      if (newStatus) {
        const patch: Record<string, unknown> = { status: newStatus };
        const cancelledBy = CANCELLED_BY_MAP[oldStatus];
        if (cancelledBy) {
          patch.cancelledBy = cancelledBy;
        }
        await ctx.db.patch(booking._id, patch);
        updated++;
      }
    }

    return { total: bookings.length, updated };
  },
});

const LEGACY_CONVERSATION_STATES = new Set([
  "reschedule_flow",
  "cancel_flow",
  "awaiting_checkin_response",
  "admin_updating",
  "awaiting_reschedule_response",
]);

export const normalizeConversations = internalMutation({
  args: {},
  handler: async (ctx) => {
    const conversations = await ctx.db.query("conversations").collect();
    let updated = 0;
    for (const conv of conversations) {
      if (LEGACY_CONVERSATION_STATES.has(conv.state)) {
        await ctx.db.patch(conv._id, { state: "idle", flowData: undefined });
        updated++;
      }
    }
    return { total: conversations.length, updated };
  },
});
