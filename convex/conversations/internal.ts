import { internalQuery, internalMutation } from "../_generated/server";
import { v } from "convex/values";

export const getBySalonPhone = internalQuery({
  args: { salonId: v.id("salons"), phone: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("conversations")
      .withIndex("by_salon_phone", (q) =>
        q.eq("salonId", args.salonId).eq("phone", args.phone)
      )
      .unique();
  },
});

export const getOrCreate = internalMutation({
  args: {
    salonId: v.id("salons"),
    phone: v.string(),
    role: v.union(v.literal("customer"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("conversations")
      .withIndex("by_salon_phone", (q) =>
        q.eq("salonId", args.salonId).eq("phone", args.phone)
      )
      .unique();

    if (existing) return existing._id;

    return await ctx.db.insert("conversations", {
      salonId: args.salonId,
      phone: args.phone,
      role: args.role,
      state: "idle",
      lastMessageAt: Date.now(),
    });
  },
});

export const updateState = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    state: v.union(
      v.literal("idle"),
      v.literal("collecting_info"),
      v.literal("booking_flow"),
      v.literal("reschedule_flow"),
      v.literal("cancel_flow"),
      v.literal("awaiting_reminder_response"),
      v.literal("awaiting_checkin_response"),
      v.literal("admin_updating")
    ),
    flowData: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationId, {
      state: args.state,
      flowData: args.flowData,
      lastMessageAt: Date.now(),
    });
  },
});

export const resetToIdle = internalMutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationId, {
      state: "idle",
      flowData: undefined,
      lastMessageAt: Date.now(),
    });
  },
});
