import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";

export const sendTextMessage = internalAction({
  args: {
    salonId: v.id("salons"),
    recipientPhone: v.string(),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const salon = await ctx.runQuery(internal.salons.internal.getById, {
      salonId: args.salonId,
    });
    if (!salon) throw new Error("Salon not found");

    const response = await fetch(
      `https://graph.facebook.com/v21.0/${salon.waPhoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${salon.waAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: args.recipientPhone,
          type: "text",
          text: { body: args.text },
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("WhatsApp send failed:", response.status, errorBody);
    }
  },
});

export const sendInteractiveButtonMessage = internalAction({
  args: {
    salonId: v.id("salons"),
    recipientPhone: v.string(),
    bodyText: v.string(),
    buttons: v.array(
      v.object({
        id: v.string(),
        title: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const salon = await ctx.runQuery(internal.salons.internal.getById, {
      salonId: args.salonId,
    });
    if (!salon) throw new Error("Salon not found");

    const response = await fetch(
      `https://graph.facebook.com/v21.0/${salon.waPhoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${salon.waAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: args.recipientPhone,
          type: "interactive",
          interactive: {
            type: "button",
            body: { text: args.bodyText },
            action: {
              buttons: args.buttons.map((b) => ({
                type: "reply",
                reply: { id: b.id, title: b.title },
              })),
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        "WhatsApp interactive send failed:",
        response.status,
        errorBody
      );
    }
  },
});

export const sendLocationMessage = internalAction({
  args: {
    salonId: v.id("salons"),
    recipientPhone: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    name: v.string(),
    address: v.string(),
  },
  handler: async (ctx, args) => {
    const salon = await ctx.runQuery(internal.salons.internal.getById, {
      salonId: args.salonId,
    });
    if (!salon) throw new Error("Salon not found");

    const response = await fetch(
      `https://graph.facebook.com/v21.0/${salon.waPhoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${salon.waAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: args.recipientPhone,
          type: "location",
          location: {
            latitude: args.latitude,
            longitude: args.longitude,
            name: args.name,
            address: args.address,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("WhatsApp location send failed:", response.status, errorBody);
    }
  },
});
