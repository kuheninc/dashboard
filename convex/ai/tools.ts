import Anthropic from "@anthropic-ai/sdk";

type Tool = Anthropic.Messages.Tool;

export const customerTools: Tool[] = [
  {
    name: "lookup_customer",
    description:
      "Check if a customer exists in the database by their phone number. Use this when you need to verify if the sender is a registered customer.",
    input_schema: {
      type: "object" as const,
      properties: {
        phone: {
          type: "string",
          description: "Customer phone number in E.164 format (e.g. 60123456789)",
        },
      },
      required: ["phone"],
    },
  },
  {
    name: "register_customer",
    description:
      "Register a new customer. Requires their name, email is optional. Phone is auto-filled from sender. Ask for name and email together in one message, then call this immediately — do not ask twice.",
    input_schema: {
      type: "object" as const,
      properties: {
        name: { type: "string", description: "Customer's full name" },
        phone: { type: "string", description: "Phone number in E.164 format" },
        email: { type: "string", description: "Email address (optional)" },
      },
      required: ["name", "phone"],
    },
  },
  {
    name: "check_availability",
    description:
      "Check available time slots for a specific service on a specific date. Returns available slots with stylist assignments.",
    input_schema: {
      type: "object" as const,
      properties: {
        serviceId: { type: "string", description: "The Convex document ID for the service (e.g. 'k57...'). Use the exact _id from the services list, NOT the service name." },
        date: { type: "string", description: "Date in YYYY-MM-DD format" },
      },
      required: ["serviceId", "date"],
    },
  },
  {
    name: "create_booking",
    description:
      "Create a new booking. Status will be pending_approval (needs admin confirmation).",
    input_schema: {
      type: "object" as const,
      properties: {
        customerId: { type: "string", description: "Customer ID" },
        stylistId: { type: "string", description: "Stylist ID (from availability check)" },
        serviceId: { type: "string", description: "Service ID" },
        date: { type: "string", description: "Date in YYYY-MM-DD format" },
        startTime: { type: "string", description: "Start time in HH:MM format" },
      },
      required: ["customerId", "stylistId", "serviceId", "date", "startTime"],
    },
  },
  {
    name: "get_my_bookings",
    description: "Get all upcoming bookings for a customer.",
    input_schema: {
      type: "object" as const,
      properties: {
        customerId: { type: "string", description: "Customer ID" },
      },
      required: ["customerId"],
    },
  },
  {
    name: "cancel_booking",
    description: "Cancel a booking.",
    input_schema: {
      type: "object" as const,
      properties: {
        bookingId: { type: "string", description: "Booking ID to cancel" },
        reason: { type: "string", description: "Reason for cancellation" },
      },
      required: ["bookingId"],
    },
  },
  {
    name: "confirm_attendance",
    description:
      "Customer confirms they will attend after receiving the 1-hour reminder.",
    input_schema: {
      type: "object" as const,
      properties: {
        bookingId: { type: "string", description: "Booking ID" },
      },
      required: ["bookingId"],
    },
  },
];

export const adminTools: Tool[] = [
  {
    name: "count_bookings",
    description: "Count bookings for a specific date or date range.",
    input_schema: {
      type: "object" as const,
      properties: {
        date: { type: "string", description: "Specific date YYYY-MM-DD (use this OR startDate+endDate)" },
        startDate: { type: "string", description: "Range start date YYYY-MM-DD" },
        endDate: { type: "string", description: "Range end date YYYY-MM-DD" },
      },
      required: [],
    },
  },
  {
    name: "list_bookings",
    description: "List bookings with full details for a date or date range.",
    input_schema: {
      type: "object" as const,
      properties: {
        date: { type: "string", description: "Specific date YYYY-MM-DD" },
        startDate: { type: "string", description: "Range start YYYY-MM-DD" },
        endDate: { type: "string", description: "Range end YYYY-MM-DD" },
      },
      required: [],
    },
  },
  {
    name: "approve_booking",
    description: "Approve a pending booking.",
    input_schema: {
      type: "object" as const,
      properties: {
        bookingId: { type: "string", description: "Booking ID to approve" },
      },
      required: ["bookingId"],
    },
  },
  {
    name: "admin_create_booking",
    description: "Create a booking directly (auto-confirmed, no approval needed).",
    input_schema: {
      type: "object" as const,
      properties: {
        customerPhone: { type: "string", description: "Customer phone number" },
        stylistId: { type: "string", description: "Stylist ID" },
        serviceId: { type: "string", description: "Service ID" },
        date: { type: "string", description: "Date YYYY-MM-DD" },
        startTime: { type: "string", description: "Start time HH:MM" },
      },
      required: ["customerPhone", "stylistId", "serviceId", "date", "startTime"],
    },
  },
  {
    name: "admin_cancel_booking",
    description: "Cancel any booking as admin.",
    input_schema: {
      type: "object" as const,
      properties: {
        bookingId: { type: "string", description: "Booking ID" },
        reason: { type: "string", description: "Cancellation reason" },
      },
      required: ["bookingId"],
    },
  },
  {
    name: "add_service",
    description: "Add a new service to the salon.",
    input_schema: {
      type: "object" as const,
      properties: {
        name: { type: "string", description: "Service name in English" },
        nameBM: { type: "string", description: "Service name in Bahasa Malaysia (optional)" },
        durationMinutes: { type: "number", description: "Duration in minutes" },
        priceRM: { type: "number", description: "Price in RM" },
      },
      required: ["name", "durationMinutes", "priceRM"],
    },
  },
  {
    name: "update_service",
    description: "Update an existing service's details.",
    input_schema: {
      type: "object" as const,
      properties: {
        serviceId: { type: "string", description: "Service ID" },
        name: { type: "string", description: "New name (optional)" },
        nameBM: { type: "string", description: "New BM name (optional)" },
        durationMinutes: { type: "number", description: "New duration (optional)" },
        priceRM: { type: "number", description: "New price (optional)" },
      },
      required: ["serviceId"],
    },
  },
  {
    name: "remove_service",
    description: "Deactivate a service (soft delete).",
    input_schema: {
      type: "object" as const,
      properties: {
        serviceId: { type: "string", description: "Service ID" },
      },
      required: ["serviceId"],
    },
  },
  {
    name: "update_hours",
    description: "Update salon opening hours.",
    input_schema: {
      type: "object" as const,
      properties: {
        openingHours: {
          type: "array",
          items: {
            type: "object",
            properties: {
              day: { type: "number", description: "0=Sunday..6=Saturday" },
              open: { type: "string", description: "Opening time HH:MM" },
              close: { type: "string", description: "Closing time HH:MM" },
              isClosed: { type: "boolean" },
            },
            required: ["day", "open", "close", "isClosed"],
          },
          description: "Array of 7 day entries",
        },
      },
      required: ["openingHours"],
    },
  },
  {
    name: "update_closed_dates",
    description: "Update the list of closed dates.",
    input_schema: {
      type: "object" as const,
      properties: {
        closedDates: {
          type: "array",
          items: { type: "string" },
          description: "Array of dates in YYYY-MM-DD format",
        },
      },
      required: ["closedDates"],
    },
  },
  {
    name: "get_no_show_report",
    description: "Get customers with repeated no-shows.",
    input_schema: {
      type: "object" as const,
      properties: {
        threshold: { type: "number", description: "Minimum no-show count (default 3)" },
      },
      required: [],
    },
  },
  {
    name: "get_pending_bookings",
    description: "Get all bookings awaiting admin approval.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "mark_no_show",
    description: "Mark a booking as no-show. Increments customer's no-show count.",
    input_schema: {
      type: "object" as const,
      properties: {
        bookingId: { type: "string", description: "Booking ID" },
      },
      required: ["bookingId"],
    },
  },
  {
    name: "mark_completed",
    description: "Mark a booking as completed (customer arrived and was served).",
    input_schema: {
      type: "object" as const,
      properties: {
        bookingId: { type: "string", description: "Booking ID" },
      },
      required: ["bookingId"],
    },
  },
];
