import { internalMutation } from "../_generated/server";

export const resetStale = internalMutation({
  args: {},
  handler: async (ctx) => {
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    const conversations = await ctx.db.query("conversations").collect();

    for (const conv of conversations) {
      if (conv.state !== "idle" && conv.lastMessageAt < twoHoursAgo) {
        await ctx.db.patch(conv._id, {
          state: "idle",
          flowData: undefined,
          lastMessageAt: Date.now(),
        });
      }
    }
  },
});
