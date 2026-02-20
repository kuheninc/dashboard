"use node";

import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";
import Anthropic from "@anthropic-ai/sdk";
import { buildCustomerSystemPrompt, buildAdminSystemPrompt } from "./prompts";
import { customerTools, adminTools } from "./tools";
import { Id } from "../_generated/dataModel";

const anthropic = new Anthropic();

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

    // 4. Store incoming message
    await ctx.runMutation(internal.messages.internal.store, {
      salonId: salon._id,
      conversationId,
      role: "user",
      content: args.messageBody,
    });

    // 5. Load context
    const staleThreshold = Date.now() - 24 * 60 * 60 * 1000;
    const messageLimit =
      conversation && conversation.lastMessageAt < staleThreshold ? 5 : 20;

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
    let tools: Anthropic.Messages.Tool[];

    if (isAdmin) {
      systemPrompt = buildAdminSystemPrompt(
        salon,
        services,
        stylists,
        conversation?.state ?? "idle",
        conversation?.flowData
      );
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

    // Build Claude messages from history
    const claudeMessages: Anthropic.Messages.MessageParam[] = recentMessages.map(
      (m) => ({
        role: m.role === "user" ? ("user" as const) : ("assistant" as const),
        content: m.content,
      })
    );

    // 7. Call Claude with tool loop
    let response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1024,
      system: systemPrompt,
      tools,
      messages: claudeMessages,
    });

    // Process tool calls in a loop (max 5 iterations to prevent runaway)
    let iterations = 0;
    while (response.stop_reason === "tool_use" && iterations < 5) {
      iterations++;

      const toolUseBlocks = response.content.filter(
        (block): block is Anthropic.Messages.ToolUseBlock =>
          block.type === "tool_use"
      );

      const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];

      for (const toolUse of toolUseBlocks) {
        const result = await executeTool(
          ctx,
          salon._id,
          args.senderPhone,
          role,
          toolUse.name,
          toolUse.input as Record<string, unknown>
        );
        toolResults.push({
          type: "tool_result",
          tool_use_id: toolUse.id,
          content: JSON.stringify(result),
        });
      }

      // Continue conversation with tool results
      claudeMessages.push({ role: "assistant", content: response.content });
      claudeMessages.push({ role: "user", content: toolResults });

      response = await anthropic.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 1024,
        system: systemPrompt,
        tools,
        messages: claudeMessages,
      });
    }

    // 8. Extract final text response
    const textBlocks = response.content.filter(
      (block): block is Anthropic.Messages.TextBlock => block.type === "text"
    );
    const replyText = textBlocks.map((b) => b.text).join("\n") || "Sorry, I couldn't process that. Please try again.";

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
        input.date as string
      );
    }

    case "create_booking": {
      const bookingId = await ctx.runMutation(
        internal.bookings.internal.create,
        {
          salonId,
          customerId: input.customerId as Id<"customers">,
          stylistId: input.stylistId as Id<"stylists">,
          serviceId: input.serviceId as Id<"services">,
          date: input.date as string,
          startTime: input.startTime as string,
          createdBy: "customer" as const,
        }
      );
      // Notify admins about pending booking
      const salon = await ctx.runQuery(internal.salons.internal.getById, { salonId });
      if (salon) {
        const customer = await ctx.runQuery(internal.customers.internal.getById, {
          customerId: input.customerId as Id<"customers">,
        });
        const service = await ctx.runQuery(internal.services.internal.getById, {
          serviceId: input.serviceId as Id<"services">,
        });
        for (const adminPhone of salon.adminPhones) {
          await ctx.runAction(internal.whatsapp.send.sendTextMessage, {
            salonId,
            recipientPhone: adminPhone,
            text: `📋 New booking request:\n${customer?.name ?? "Unknown"} wants ${service?.name ?? "a service"} on ${input.date} at ${input.startTime}.\n\nReply to approve or manage.`,
          });
        }
      }
      return { success: true, bookingId, status: "pending_approval" };
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
      // Delete GCal event before cancelling (need booking data)
      ctx.runAction(internal.calendar.sync.deleteEvent, {
        salonId,
        bookingId: input.bookingId as Id<"bookings">,
      }).catch(() => {});
      await ctx.runMutation(internal.bookings.internal.cancel, {
        bookingId: input.bookingId as Id<"bookings">,
        cancelledBy: role === "admin" ? "cancelled_admin" as const : "cancelled_customer" as const,
        reason: (input.reason as string) || undefined,
      });
      return { success: true };
    }

    case "confirm_attendance": {
      await ctx.runMutation(internal.bookings.internal.customerConfirm, {
        bookingId: input.bookingId as Id<"bookings">,
      });
      return { success: true };
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
            b.status !== "cancelled_customer" && b.status !== "cancelled_admin"
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

    case "approve_booking": {
      await ctx.runMutation(internal.bookings.internal.approve, {
        bookingId: input.bookingId as Id<"bookings">,
        adminPhone: senderPhone,
      });
      // Notify customer
      const booking = await ctx.runQuery(internal.bookings.internal.getById, {
        bookingId: input.bookingId as Id<"bookings">,
      });
      if (booking) {
        const customer = await ctx.runQuery(internal.customers.internal.getById, {
          customerId: booking.customerId,
        });
        const service = await ctx.runQuery(internal.services.internal.getById, {
          serviceId: booking.serviceId,
        });
        if (customer) {
          await ctx.runAction(internal.whatsapp.send.sendTextMessage, {
            salonId,
            recipientPhone: customer.phone,
            text: `✅ Your booking is confirmed!\n${service?.name ?? "Service"} on ${booking.date} at ${booking.startTime}.\nSee you there!`,
          });
        }
        // Sync to Google Calendar (fire-and-forget)
        ctx.runAction(internal.calendar.sync.createEvent, {
          salonId,
          bookingId: input.bookingId as Id<"bookings">,
        }).catch(() => {});
      }
      return { success: true };
    }

    case "admin_create_booking": {
      // Look up or create customer
      let customer = await ctx.runQuery(internal.customers.internal.getByPhone, {
        salonId,
        phone: input.customerPhone as string,
      });
      if (!customer) {
        const customerId = await ctx.runMutation(
          internal.customers.internal.create,
          {
            salonId,
            name: "Walk-in",
            phone: input.customerPhone as string,
          }
        );
        customer = await ctx.runQuery(internal.customers.internal.getById, {
          customerId,
        });
      }
      if (!customer) return { success: false, error: "Could not find/create customer" };

      const bookingId = await ctx.runMutation(internal.bookings.internal.create, {
        salonId,
        customerId: customer._id,
        stylistId: input.stylistId as Id<"stylists">,
        serviceId: input.serviceId as Id<"services">,
        date: input.date as string,
        startTime: input.startTime as string,
        createdBy: "admin" as const,
      });
      // Admin bookings are immediately confirmed — sync to GCal
      ctx.runAction(internal.calendar.sync.createEvent, {
        salonId,
        bookingId,
      }).catch(() => {});
      return { success: true, bookingId, status: "confirmed" };
    }

    case "admin_cancel_booking": {
      ctx.runAction(internal.calendar.sync.deleteEvent, {
        salonId,
        bookingId: input.bookingId as Id<"bookings">,
      }).catch(() => {});
      await ctx.runMutation(internal.bookings.internal.cancel, {
        bookingId: input.bookingId as Id<"bookings">,
        cancelledBy: "cancelled_admin" as const,
        reason: (input.reason as string) || undefined,
      });
      return { success: true };
    }

    case "add_service": {
      const serviceId = await ctx.runMutation(
        internal.services.internal.create,
        {
          salonId,
          name: input.name as string,
          nameBM: (input.nameBM as string) || undefined,
          durationMinutes: input.durationMinutes as number,
          priceRM: input.priceRM as number,
        }
      );
      return { success: true, serviceId };
    }

    case "update_service": {
      await ctx.runMutation(internal.services.internal.update, {
        serviceId: input.serviceId as Id<"services">,
        name: (input.name as string) || undefined,
        nameBM: (input.nameBM as string) || undefined,
        durationMinutes: (input.durationMinutes as number) || undefined,
        priceRM: (input.priceRM as number) || undefined,
      });
      return { success: true };
    }

    case "remove_service": {
      await ctx.runMutation(internal.services.internal.deactivate, {
        serviceId: input.serviceId as Id<"services">,
      });
      return { success: true };
    }

    case "update_hours": {
      await ctx.runMutation(internal.salons.internal.updateHours, {
        salonId,
        openingHours: input.openingHours as {
          day: number;
          open: string;
          close: string;
          isClosed: boolean;
        }[],
      });
      return { success: true };
    }

    case "update_closed_dates": {
      await ctx.runMutation(internal.salons.internal.updateClosedDates, {
        salonId,
        closedDates: input.closedDates as string[],
      });
      return { success: true };
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
        });
      }
      return enriched;
    }

    case "mark_no_show": {
      ctx.runAction(internal.calendar.sync.deleteEvent, {
        salonId,
        bookingId: input.bookingId as Id<"bookings">,
      }).catch(() => {});
      await ctx.runMutation(internal.bookings.internal.markNoShow, {
        bookingId: input.bookingId as Id<"bookings">,
      });
      return { success: true };
    }

    case "mark_completed": {
      await ctx.runMutation(internal.bookings.internal.markCompleted, {
        bookingId: input.bookingId as Id<"bookings">,
      });
      return { success: true };
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
  date: string
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
        b.status !== "cancelled_customer" && b.status !== "cancelled_admin" && b.status !== "no_show"
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

  return {
    available: slots.length > 0,
    date,
    serviceName: service.name,
    durationMinutes: service.durationMinutes,
    slots: slots.slice(0, 10), // Return max 10 options
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
