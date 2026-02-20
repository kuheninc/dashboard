import { httpAction } from "../_generated/server";
import { internal } from "../_generated/api";

export const webhookVerify = httpAction(async (ctx, request) => {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken) {
    return new Response(challenge, { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
});

export const webhookIncoming = httpAction(async (ctx, request) => {
  const body = await request.json();

  // Meta sends various webhook events — we only care about messages
  const entry = body.entry?.[0];
  const changes = entry?.changes?.[0];
  const value = changes?.value;

  if (!value) {
    return new Response(null, { status: 200 });
  }

  // Ignore delivery status updates
  if (value.statuses) {
    return new Response(null, { status: 200 });
  }

  const message = value.messages?.[0];
  if (!message) {
    return new Response(null, { status: 200 });
  }

  // Only handle text messages for MVP
  if (message.type !== "text") {
    return new Response(null, { status: 200 });
  }

  const waPhoneNumberId = value.metadata?.phone_number_id;
  const senderPhone = message.from; // E.164 without +
  const messageBody = message.text?.body;

  if (!waPhoneNumberId || !senderPhone || !messageBody) {
    return new Response(null, { status: 200 });
  }

  // Schedule AI processing asynchronously (return 200 fast)
  await ctx.scheduler.runAfter(0, internal.ai.router.handleMessage, {
    waPhoneNumberId,
    senderPhone,
    messageBody,
  });

  return new Response(null, { status: 200 });
});
