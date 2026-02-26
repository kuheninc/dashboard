import { internalMutation } from "../_generated/server";

const NON_IDLE_STATES = [
  "collecting_info",
  "booking_flow",
  "awaiting_reminder_response",
] as const;

export const resetStale = internalMutation({
  args: {},
  handler: async (ctx) => {
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;

    for (const state of NON_IDLE_STATES) {
      const stale = await ctx.db
        .query("conversations")
        .withIndex("by_state_lastMessageAt", (q) =>
          q.eq("state", state).lt("lastMessageAt", twoHoursAgo)
        )
        .collect();

      for (const conv of stale) {
        await ctx.db.patch(conv._id, {
          state: "idle",
          flowData: undefined,
          lastMessageAt: Date.now(),
        });
      }
    }
  },
});
