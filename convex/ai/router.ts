"use node";

import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";
import { GoogleGenAI, type FunctionDeclaration } from "@google/genai";
import { buildCustomerSystemPrompt, buildAdminSystemPrompt } from "./prompts";
import { customerTools, adminTools } from "./tools";
import { Id } from "../_generated/dataModel";

let _ai: GoogleGenAI | null = null;
function getAI() {
  if (!_ai) {
    _ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  }
  return _ai;
}

const GEMINI_TIMEOUT_MS = 30_000; // 30 seconds per API call

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

export const handleMessage = internalAction({
  args: {
    waPhoneNumberId: v.string(),
    senderPhone: v.string(),
    messageBody: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Look up salon
    const salon = await ctx.runQuery(internal.salons.internal.getByWaPhoneNumberId, {
      waPhoneNumberId: args.waPhoneNumberId,
    });
    if (!salon) {
      console.error("No salon found for waPhoneNumberId:", args.waPhoneNumberId);
      return;
    }

    // 2. Determine role
    const isAdmin = salon.adminPhones.includes(args.senderPhone);
    const role = isAdmin ? "admin" : "customer";

    // 3. Get or create conversation
    const conversationId = await ctx.runMutation(
      internal.conversations.internal.getOrCreate,
      { salonId: salon._id, phone: args.senderPhone, role }
    );

    // Load conversation record for state
    const conversation = await ctx.runQuery(
      internal.conversations.internal.getBySalonPhone,
      { salonId: salon._id, phone: args.senderPhone }
    );

    // 4. Store incoming message (skip if re-scheduled with empty body)
    if (args.messageBody) {
      await ctx.runMutation(internal.messages.internal.store, {
        salonId: salon._id,
        conversationId,
        role: "user",
        content: args.messageBody,
      });
    }

    // 4.5. Acquire processing lock to prevent concurrent AI calls for same conversation.
    // If another handleMessage is already processing, skip — it will see our stored message.
    const { acquired, startedAt } = await ctx.runMutation(
      internal.conversations.internal.acquireProcessingLock,
      { conversationId }
    );
    if (!acquired) {
      return; // Another call is handling this conversation; our message is in history
    }

    try {
    // 5. Load context
    const staleThreshold = Date.now() - 24 * 60 * 60 * 1000;
    const messageLimit =
      conversation && conversation.lastMessageAt < staleThreshold ? 3 : 10;

    const recentMessages = await ctx.runQuery(
      internal.messages.internal.getRecent,
      { conversationId, limit: messageLimit }
    );

    const services = await ctx.runQuery(internal.services.internal.listBySalon, {
      salonId: salon._id,
    });
    const stylists = await ctx.runQuery(internal.stylists.internal.listBySalon, {
      salonId: salon._id,
    });

    // 6. Build system prompt and messages
    let systemPrompt: string;
    let tools: typeof customerTools;

    if (isAdmin) {
      systemPrompt = buildAdminSystemPrompt(salon, services, stylists);
      tools = adminTools;
    } else {
      // Look up customer record
      const customer = await ctx.runQuery(
        internal.customers.internal.getByPhone,
        { salonId: salon._id, phone: args.senderPhone }
      );

      // Get upcoming bookings for this customer
      let upcomingBookings: { date: string; startTime: string; serviceName: string; stylistName: string }[] = [];
      if (customer) {
        const bookings = await ctx.runQuery(
          internal.bookings.internal.getByCustomer,
          { customerId: customer._id }
        );
        for (const b of bookings) {
          const svc = services.find((s) => s._id === b.serviceId);
          const sty = stylists.find((s) => s._id === b.stylistId);
          upcomingBookings.push({
            date: b.date,
            startTime: b.startTime,
            serviceName: svc?.name ?? "Unknown",
            stylistName: sty?.name ?? "Unknown",
          });
        }
      }

      systemPrompt = buildCustomerSystemPrompt(
        salon,
        services,
        stylists,
        customer,
        conversation?.state ?? "idle",
        conversation?.flowData,
        upcomingBookings
      );
      tools = customerTools;
    }

    // Build Gemini messages from history
    const geminiMessages: { role: "user" | "model"; parts: Record<string, unknown>[] }[] =
      recentMessages.map((m) => ({
        role: m.role === "user" ? "user" as const : "model" as const,
        parts: [{ text: m.content }],
      }));

    // 7. Call Gemini with tool loop
    let response = await withTimeout(
      getAI().models.generateContent({
        model: "gemini-2.5-flash",
        contents: geminiMessages,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
          tools: [{ functionDeclarations: tools as unknown as FunctionDeclaration[] }],
        },
      }),
      GEMINI_TIMEOUT_MS,
      "Gemini initial call"
    );

    // Process tool calls in a loop (max 5 iterations to prevent runaway)
    let iterations = 0;
    let parts = response.candidates?.[0]?.content?.parts ?? [];
    let functionCalls = parts.filter(
      (p) => (p as { functionCall?: unknown }).functionCall
    );

    while (functionCalls.length > 0 && iterations < 5) {
      iterations++;

      const functionResponses: Record<string, unknown>[] = [];

      for (const part of functionCalls) {
        const fc = (part as { functionCall: { name: string; args: Record<string, unknown> } }).functionCall;
        const result = await executeTool(
          ctx,
          salon._id,
          args.senderPhone,
          role,
          fc.name,
          fc.args ?? {}
        );
        functionResponses.push({
          functionResponse: {
            name: fc.name,
            response: result as object,
          },
        });
      }

      // Continue conversation with tool results
      geminiMessages.push({ role: "model", parts: parts as Record<string, unknown>[] });
      geminiMessages.push({ role: "user", parts: functionResponses });

      response = await withTimeout(
        getAI().models.generateContent({
          model: "gemini-2.5-flash",
          contents: geminiMessages,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
            tools: [{ functionDeclarations: tools as unknown as FunctionDeclaration[] }],
          },
        }),
        GEMINI_TIMEOUT_MS,
        `Gemini tool loop iteration ${iterations}`
      );

      parts = response.candidates?.[0]?.content?.parts ?? [];
      functionCalls = parts.filter(
        (p) => (p as { functionCall?: unknown }).functionCall
      );
    }

    // 8. Extract final text response
    const responseParts = response.candidates?.[0]?.content?.parts ?? [];
    const replyText =
      responseParts
        .filter((p) => (p as { text?: string }).text)
        .map((p) => (p as { text: string }).text)
        .join("\n") || "Sorry, I couldn't process that. Please try again.";

    // 9. Store assistant response
    await ctx.runMutation(internal.messages.internal.store, {
      salonId: salon._id,
      conversationId,
      role: "assistant",
      content: replyText,
    });

    // 10. Send via WhatsApp
    await ctx.runAction(internal.whatsapp.send.sendTextMessage, {
      salonId: salon._id,
      recipientPhone: args.senderPhone,
      text: replyText,
    });

    } catch (error) {
      console.error(
        `handleMessage failed for salon=${salon._id} phone=${args.senderPhone} role=${role}:`,
        error
      );
      // Send fallback message so the customer isn't left hanging
      try {
        await ctx.runAction(internal.whatsapp.send.sendTextMessage, {
          salonId: salon._id,
          recipientPhone: args.senderPhone,
          text: "Sorry, something went wrong on our end. Please try again in a moment!",
        });
      } catch (sendError) {
        console.error("Failed to send error fallback message:", sendError);
      }
    } finally {
      // Release processing lock and check for messages that arrived during processing
      const { hasNewMessages } = await ctx.runMutation(
        internal.conversations.internal.releaseProcessingLock,
        { conversationId, startedAt }
      );
      if (hasNewMessages) {
        // New messages arrived while we were processing — re-schedule to handle them
        await ctx.scheduler.runAfter(0, internal.ai.router.handleMessage, {
          waPhoneNumberId: args.waPhoneNumberId,
          senderPhone: args.senderPhone,
          messageBody: "", // Content already stored; AI will read from history
        });
      }
    }
  },
});

// Tool execution dispatcher
async function executeTool(
  ctx: {
    runQuery: Function;
    runMutation: Function;
    runAction: Function;
  },
  salonId: Id<"salons">,
  senderPhone: string,
  role: "customer" | "admin",
  toolName: string,
  input: Record<string, unknown>
): Promise<unknown> {
  switch (toolName) {
    // ─── CUSTOMER TOOLS ──────────────────────────
    case "lookup_customer": {
      const customer = await ctx.runQuery(
        internal.customers.internal.getByPhone,
        { salonId, phone: input.phone as string }
      );
      return customer
        ? { found: true, id: customer._id, name: customer.name, phone: customer.phone, noShowCount: customer.noShowCount }
        : { found: false };
    }

    case "register_customer": {
      // Always use the actual sender phone to ensure consistent lookups
      const existingCustomer = await ctx.runQuery(
        internal.customers.internal.getByPhone,
        { salonId, phone: senderPhone }
      );
      if (existingCustomer) {
        return { success: true, customerId: existingCustomer._id, alreadyRegistered: true, name: existingCustomer.name, email: existingCustomer.email, note: "Customer already registered. Do NOT ask for name or email again." };
      }
      const customerId = await ctx.runMutation(
        internal.customers.internal.create,
        {
          salonId,
          name: input.name as string,
          phone: senderPhone,
          email: (input.email as string) || undefined,
        }
      );
      return { success: true, customerId };
    }

    case "check_availability": {
      const serviceInput = input.serviceId as string;
      const services = await ctx.runQuery(internal.services.internal.listBySalon, { salonId });
      // Try exact ID match first, then name match
      const match = services.find((s: { _id: string }) => s._id === serviceInput)
        || services.find(
          (s: { name: string; nameBM?: string }) =>
            s.name.toLowerCase().includes(serviceInput.toLowerCase()) ||
            (s.nameBM && s.nameBM.toLowerCase().includes(serviceInput.toLowerCase()))
        );
      if (!match) {
        return { error: `Service "${serviceInput}" not found. Available services: ${services.map((s: { _id: string; name: string }) => `${s.name} (ID: ${s._id})`).join(", ")}` };
      }
      return await checkAvailability(
        ctx,
        salonId,
        match._id as Id<"services">,
        input.date as string,
        input.preferredStylistId as string | undefined
      );
    }

    case "create_booking": {
      let bookingId;
      try {
        bookingId = await ctx.runMutation(
          internal.bookings.internal.create,
          {
            salonId,
            customerId: input.customerId as Id<"customers">,
            stylistId: input.stylistId as Id<"stylists">,
            serviceId: input.serviceId as Id<"services">,
            date: input.date as string,
            startTime: input.startTime as string,
            createdBy: "customer" as const,
            preferredStylistId: input.preferredStylistId
              ? (input.preferredStylistId as Id<"stylists">)
              : undefined,
          }
        );
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.includes("Time slot conflict")) {
          return {
            success: false,
            error: msg,
            suggestion: "This time slot is no longer available. Please check availability again for alternative slots.",
          };
        }
        throw error;
      }
      // Notify admins about pending booking
      const salon = await ctx.runQuery(internal.salons.internal.getById, { salonId });
      const service = await ctx.runQuery(internal.services.internal.getById, {
        serviceId: input.serviceId as Id<"services">,
      });
      if (salon) {
        const customer = await ctx.runQuery(internal.customers.internal.getById, {
          customerId: input.customerId as Id<"customers">,
        });
        // Include stylist preference in admin notification
        let preferenceNote = "";
        if (input.preferredStylistId) {
          const stylists = await ctx.runQuery(internal.stylists.internal.listBySalon, { salonId });
          const prefStylist = stylists.find(
            (s: { _id: string }) => s._id === input.preferredStylistId
          );
          if (prefStylist) {
            preferenceNote = `\nCustomer requested stylist: ${prefStylist.name}`;
          }
        }
        for (const adminPhone of salon.adminPhones) {
          await ctx.runAction(internal.whatsapp.send.sendTextMessage, {
            salonId,
            recipientPhone: adminPhone,
            text: `📋 New booking request:\n${customer?.name ?? "Unknown"} wants ${service?.name ?? "a service"} on ${input.date} at ${input.startTime}.${preferenceNote}\n\nView and manage in your dashboard.`,
          });
        }
        // Create dashboard notification
        await ctx.runMutation(internal.notifications.internal.create, {
          salonId,
          type: "pending_booking" as const,
          title: `New booking: ${customer?.name ?? "Unknown"}`,
          body: `${service?.name ?? "Service"} on ${input.date} at ${input.startTime}`,
          bookingId,
        });
      }
      // Return endTime for multi-service chaining
      const endTimeMinutes = timeToMinutes(input.startTime as string) + (service?.durationMinutes ?? 0);
      return {
        success: true,
        bookingId,
        status: "pending",
        date: input.date,
        startTime: input.startTime,
        endTime: minutesToTime(endTimeMinutes),
        serviceName: service?.name ?? "Unknown",
      };
    }

    case "get_my_bookings": {
      const bookings = await ctx.runQuery(
        internal.bookings.internal.getByCustomer,
        { customerId: input.customerId as Id<"customers"> }
      );
      return bookings.map((b: Record<string, unknown>) => ({
        id: b._id,
        date: b.date,
        startTime: b.startTime,
        endTime: b.endTime,
        status: b.status,
        serviceId: b.serviceId,
        stylistId: b.stylistId,
      }));
    }

    case "cancel_booking": {
      const cancelledBooking = await ctx.runQuery(
        internal.bookings.internal.getById,
        { bookingId: input.bookingId as Id<"bookings"> }
      );
      await ctx.runMutation(internal.bookings.internal.cancel, {
        bookingId: input.bookingId as Id<"bookings">,
        cancelledBy: role === "admin" ? "admin" as const : "customer" as const,
        reason: (input.reason as string) || undefined,
      });
      // Create dashboard notification if customer cancelled
      if (role === "customer" && cancelledBooking) {
        const customer = await ctx.runQuery(internal.customers.internal.getByPhone, {
          salonId, phone: senderPhone,
        });
        const service = await ctx.runQuery(internal.services.internal.getById, {
          serviceId: cancelledBooking.serviceId,
        });
        await ctx.runMutation(internal.notifications.internal.create, {
          salonId,
          type: "customer_cancelled" as const,
          title: `Booking cancelled: ${customer?.name ?? "Customer"}`,
          body: `${service?.name ?? "Service"} on ${cancelledBooking.date} at ${cancelledBooking.startTime}`,
          bookingId: input.bookingId as Id<"bookings">,
        });
      }
      return {
        success: true,
        cancelledServiceId: cancelledBooking?.serviceId,
        cancelledDate: cancelledBooking?.date,
        cancelledStartTime: cancelledBooking?.startTime,
      };
    }

    case "confirm_attendance": {
      await ctx.runMutation(internal.bookings.internal.customerConfirm, {
        bookingId: input.bookingId as Id<"bookings">,
      });
      return { success: true };
    }

    case "send_location": {
      const salonData = await ctx.runQuery(internal.salons.internal.getById, { salonId });
      if (!salonData) return { error: "Salon not found" };
      if ((salonData as Record<string, unknown>).latitude && (salonData as Record<string, unknown>).longitude) {
        await ctx.runAction(internal.whatsapp.send.sendLocationMessage, {
          salonId,
          recipientPhone: senderPhone,
          latitude: (salonData as Record<string, unknown>).latitude as number,
          longitude: (salonData as Record<string, unknown>).longitude as number,
          name: salonData.name,
          address: salonData.address,
        });
        return {
          success: true,
          sent: "location_pin",
          address: salonData.address,
          googleMapsLink: salonData.googleMapsLink ?? null,
        };
      } else {
        return {
          success: true,
          sent: "text_only",
          address: salonData.address,
          googleMapsLink: salonData.googleMapsLink ?? null,
          note: "No coordinates stored. Include the Google Maps link and address in your text reply.",
        };
      }
    }

    // ─── ADMIN TOOLS ─────────────────────────────
    case "count_bookings":
    case "list_bookings": {
      let bookings;
      if (input.date) {
        bookings = await ctx.runQuery(internal.bookings.internal.getByDate, {
          salonId,
          date: input.date as string,
        });
      } else if (input.startDate && input.endDate) {
        bookings = await ctx.runQuery(internal.bookings.internal.getByDateRange, {
          salonId,
          startDate: input.startDate as string,
          endDate: input.endDate as string,
        });
      } else {
        // Default to today
        const today = new Date().toISOString().split("T")[0];
        bookings = await ctx.runQuery(internal.bookings.internal.getByDate, {
          salonId,
          date: today,
        });
      }

      if (toolName === "count_bookings") {
        const active = bookings.filter(
          (b: Record<string, unknown>) =>
            b.status !== "cancelled" && b.status !== "rejected"
        );
        return { total: bookings.length, active: active.length };
      }

      // Enrich bookings with customer/service/stylist names
      const enriched = [];
      for (const b of bookings) {
        const customer = await ctx.runQuery(internal.customers.internal.getById, {
          customerId: b.customerId,
        });
        const service = await ctx.runQuery(internal.services.internal.getById, {
          serviceId: b.serviceId,
        });
        enriched.push({
          id: b._id,
          date: b.date,
          startTime: b.startTime,
          endTime: b.endTime,
          status: b.status,
          customerName: customer?.name ?? "Unknown",
          customerPhone: customer?.phone ?? "Unknown",
          serviceName: service?.name ?? "Unknown",
          stylistId: b.stylistId,
        });
      }
      return enriched;
    }

    case "get_no_show_report": {
      const customers = await ctx.runQuery(
        internal.customers.internal.getRepeatOffenders,
        { salonId, threshold: (input.threshold as number) || undefined }
      );
      return customers;
    }

    case "get_pending_bookings": {
      const bookings = await ctx.runQuery(
        internal.bookings.internal.getPendingApproval,
        { salonId }
      );
      const enriched = [];
      for (const b of bookings) {
        const customer = await ctx.runQuery(internal.customers.internal.getById, {
          customerId: b.customerId,
        });
        const service = await ctx.runQuery(internal.services.internal.getById, {
          serviceId: b.serviceId,
        });
        enriched.push({
          id: b._id,
          date: b.date,
          startTime: b.startTime,
          customerName: customer?.name ?? "Unknown",
          serviceName: service?.name ?? "Unknown",
          preferredStylistName: (b as Record<string, unknown>).preferredStylistName ?? null,
        });
      }
      return enriched;
    }

    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}

// Availability checker
async function checkAvailability(
  ctx: { runQuery: Function },
  salonId: Id<"salons">,
  serviceId: Id<"services">,
  date: string,
  preferredStylistId?: string
): Promise<unknown> {
  const salon = await ctx.runQuery(internal.salons.internal.getById, { salonId });
  if (!salon) return { error: "Salon not found" };

  const service = await ctx.runQuery(internal.services.internal.getById, { serviceId });
  if (!service) return { error: "Service not found" };

  // Check if date is a closed date
  if (salon.closedDates.includes(date)) {
    return { available: false, reason: "Salon is closed on this date", slots: [] };
  }

  // Check day of week
  const dayOfWeek = new Date(date + "T00:00:00").getDay();
  const dayHours = salon.openingHours.find((h: { day: number; open: string; close: string; isClosed: boolean }) => h.day === dayOfWeek);
  if (!dayHours || dayHours.isClosed) {
    return { available: false, reason: "Salon is closed on this day", slots: [] };
  }

  const stylists = await ctx.runQuery(internal.stylists.internal.listBySalon, {
    salonId,
  });

  const slots: { startTime: string; endTime: string; stylistId: string; stylistName: string }[] = [];

  for (const stylist of stylists) {
    // Check if stylist works this day
    const stylistDay = stylist.availability.find((a: { day: number; startTime: string; endTime: string }) => a.day === dayOfWeek);
    if (!stylistDay) continue;

    // Get existing bookings for this stylist on this date
    const existingBookings = await ctx.runQuery(
      internal.bookings.internal.getByStylistDate,
      { stylistId: stylist._id, date }
    );
    const activeBookings = existingBookings.filter(
      (b: Record<string, unknown>) =>
        b.status !== "cancelled" && b.status !== "no_show" && b.status !== "rejected"
    );

    // Generate 15-min increment slots within stylist working hours
    const slotStart = timeToMinutes(stylistDay.startTime);
    const slotEnd = timeToMinutes(stylistDay.endTime);

    for (let t = slotStart; t + service.durationMinutes <= slotEnd; t += 15) {
      const startStr = minutesToTime(t);
      const endStr = minutesToTime(t + service.durationMinutes);

      // Check for overlap with existing bookings
      const hasConflict = activeBookings.some((b: Record<string, unknown>) => {
        const bStart = timeToMinutes(b.startTime as string);
        const bEnd = timeToMinutes(b.endTime as string);
        return t < bEnd && t + service.durationMinutes > bStart;
      });

      if (!hasConflict) {
        slots.push({
          startTime: startStr,
          endTime: endStr,
          stylistId: stylist._id,
          stylistName: stylist.name,
        });
      }
    }
  }

  // If preferred stylist specified, sort their slots first
  if (preferredStylistId) {
    slots.sort((a, b) => {
      const aPref = a.stylistId === preferredStylistId ? 0 : 1;
      const bPref = b.stylistId === preferredStylistId ? 0 : 1;
      if (aPref !== bPref) return aPref - bPref;
      return a.startTime.localeCompare(b.startTime);
    });
  }

  return {
    available: slots.length > 0,
    date,
    serviceName: service.name,
    durationMinutes: service.durationMinutes,
    preferredStylistAvailable: preferredStylistId
      ? slots.some((s) => s.stylistId === preferredStylistId)
      : undefined,
    slots: slots.slice(0, 10),
  };
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
