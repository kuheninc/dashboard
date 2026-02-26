import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  salonMembers: defineTable({
    userId: v.id("users"),
    salonId: v.id("salons"),
    role: v.union(v.literal("owner"), v.literal("admin")),
  })
    .index("by_user", ["userId"])
    .index("by_salon", ["salonId"])
    .index("by_user_salon", ["userId", "salonId"]),

  salons: defineTable({
    name: v.string(),
    waPhoneNumberId: v.string(),
    waBusinessAccountId: v.string(),
    waAccessToken: v.string(),
    adminPhones: v.array(v.string()),
    admins: v.optional(
      v.array(
        v.object({
          email: v.optional(v.string()),
          username: v.string(),
          passwordHash: v.string(),
          phone: v.string(),
          role: v.union(v.literal("owner"), v.literal("admin")),
        })
      )
    ),
    address: v.string(),
    googleMapsLink: v.optional(v.string()),
    openingHours: v.array(
      v.object({
        day: v.number(),
        open: v.string(),
        close: v.string(),
        isClosed: v.boolean(),
      })
    ),
    closedDates: v.array(v.string()),
    timezone: v.string(),
    googleCalendarId: v.optional(v.string()),
    googleServiceAccountKey: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    isActive: v.boolean(),
  })
    .index("by_waPhoneNumberId", ["waPhoneNumberId"])
    .index("by_isActive", ["isActive"]),

  stylists: defineTable({
    salonId: v.id("salons"),
    name: v.string(),
    phone: v.optional(v.string()),
    availability: v.array(
      v.object({
        day: v.number(),
        startTime: v.string(),
        endTime: v.string(),
      })
    ),
    isActive: v.boolean(),
  })
    .index("by_salon", ["salonId"])
    .index("by_salon_active", ["salonId", "isActive"]),

  services: defineTable({
    salonId: v.id("salons"),
    name: v.string(),
    nameBM: v.optional(v.string()),
    description: v.optional(v.string()),
    durationMinutes: v.number(),
    priceRM: v.number(),
    isActive: v.boolean(),
  })
    .index("by_salon", ["salonId"])
    .index("by_salon_active", ["salonId", "isActive"]),

  customers: defineTable({
    salonId: v.id("salons"),
    name: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    noShowCount: v.number(),
    totalBookings: v.number(),
    isBlacklisted: v.boolean(),
    notes: v.optional(v.string()),
  })
    .index("by_salon_phone", ["salonId", "phone"])
    .index("by_salon", ["salonId"])
    .index("by_phone", ["phone"]),

  bookings: defineTable({
    salonId: v.id("salons"),
    customerId: v.id("customers"),
    stylistId: v.id("stylists"),
    serviceId: v.id("services"),
    date: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("completed"),
      v.literal("no_show"),
      v.literal("cancelled"),
      v.literal("rejected")
    ),
    cancelledBy: v.optional(v.union(v.literal("customer"), v.literal("admin"))),
    customerConfirmedAt: v.optional(v.number()),
    approvedBy: v.optional(v.string()),
    cancelledReason: v.optional(v.string()),
    rejectedReason: v.optional(v.string()),
    preferredStylistId: v.optional(v.id("stylists")),
    preferredStylistName: v.optional(v.string()),
    feedbackRequestedAt: v.optional(v.number()),
    googleEventId: v.optional(v.string()),
    reminderScheduledId: v.optional(v.id("_scheduled_functions")),
    statusCheckScheduledId: v.optional(v.id("_scheduled_functions")),
    createdBy: v.union(v.literal("customer"), v.literal("admin")),
  })
    .index("by_salon_date", ["salonId", "date"])
    .index("by_salon_status", ["salonId", "status"])
    .index("by_customer", ["customerId"])
    .index("by_stylist_date", ["stylistId", "date"])
    .index("by_salon_stylist_date", ["salonId", "stylistId", "date"]),

  conversations: defineTable({
    salonId: v.id("salons"),
    phone: v.string(),
    role: v.union(v.literal("customer"), v.literal("admin")),
    state: v.union(
      v.literal("idle"),
      v.literal("collecting_info"),
      v.literal("booking_flow"),
      v.literal("awaiting_reminder_response")
    ),
    flowData: v.optional(v.any()),
    lastMessageAt: v.number(),
    isProcessing: v.optional(v.boolean()),
    processingStartedAt: v.optional(v.number()),
  })
    .index("by_salon_phone", ["salonId", "phone"])
    .index("by_state_lastMessageAt", ["state", "lastMessageAt"]),

  messages: defineTable({
    salonId: v.id("salons"),
    conversationId: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    timestamp: v.number(),
  })
    .index("by_conversation", ["conversationId", "timestamp"])
    .index("by_salon_timestamp", ["salonId", "timestamp"]),

  noShowLog: defineTable({
    salonId: v.id("salons"),
    customerId: v.id("customers"),
    bookingId: v.id("bookings"),
    date: v.string(),
    flaggedAsRepeatOffender: v.boolean(),
  })
    .index("by_customer", ["customerId"])
    .index("by_salon_date", ["salonId", "date"]),

  notifications: defineTable({
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
    read: v.boolean(),
    actedOn: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_salon", ["salonId"])
    .index("by_salon_read", ["salonId", "read"])
    .index("by_salon_createdAt", ["salonId", "createdAt"]),
});
