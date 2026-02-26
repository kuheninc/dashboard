type GeminiFunctionDeclaration = {
  name: string;
  description: string;
  parameters: {
    type: "OBJECT";
    properties: Record<string, unknown>;
    required?: string[];
  };
};

export const customerTools: GeminiFunctionDeclaration[] = [
  {
    name: "lookup_customer",
    description:
      "Check if a customer exists in the database by their phone number. Use this when you need to verify if the sender is a registered customer.",
    parameters: {
      type: "OBJECT",
      properties: {
        phone: {
          type: "STRING",
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
    parameters: {
      type: "OBJECT",
      properties: {
        name: { type: "STRING", description: "Customer's full name" },
        phone: { type: "STRING", description: "Phone number in E.164 format" },
        email: { type: "STRING", description: "Email address (optional)" },
      },
      required: ["name", "phone"],
    },
  },
  {
    name: "check_availability",
    description:
      "Check available time slots for a specific service on a specific date. Returns available slots with stylist assignments. If a preferred stylist is specified, their slots are listed first.",
    parameters: {
      type: "OBJECT",
      properties: {
        serviceId: { type: "STRING", description: "The Convex document ID for the service (e.g. 'k57...'). Use the exact _id from the services list, NOT the service name." },
        date: { type: "STRING", description: "Date in YYYY-MM-DD format" },
        preferredStylistId: { type: "STRING", description: "Optional stylist ID if customer has a preference. Preferred stylist's slots shown first." },
      },
      required: ["serviceId", "date"],
    },
  },
  {
    name: "create_booking",
    description:
      "Create a new booking. Status will be pending (needs admin confirmation). Returns endTime for multi-service chaining.",
    parameters: {
      type: "OBJECT",
      properties: {
        customerId: { type: "STRING", description: "Customer ID" },
        stylistId: { type: "STRING", description: "Stylist ID (from availability check)" },
        serviceId: { type: "STRING", description: "Service ID" },
        date: { type: "STRING", description: "Date in YYYY-MM-DD format" },
        startTime: { type: "STRING", description: "Start time in HH:MM format" },
        preferredStylistId: { type: "STRING", description: "Optional: stylist the customer prefers. Stored as a request for admin to review." },
      },
      required: ["customerId", "stylistId", "serviceId", "date", "startTime"],
    },
  },
  {
    name: "get_my_bookings",
    description: "Get all upcoming bookings for a customer.",
    parameters: {
      type: "OBJECT",
      properties: {
        customerId: { type: "STRING", description: "Customer ID" },
      },
      required: ["customerId"],
    },
  },
  {
    name: "cancel_booking",
    description: "Cancel a booking.",
    parameters: {
      type: "OBJECT",
      properties: {
        bookingId: { type: "STRING", description: "Booking ID to cancel" },
        reason: { type: "STRING", description: "Reason for cancellation" },
      },
      required: ["bookingId"],
    },
  },
  {
    name: "confirm_attendance",
    description:
      "Customer confirms they will attend after receiving the 1-hour reminder.",
    parameters: {
      type: "OBJECT",
      properties: {
        bookingId: { type: "STRING", description: "Booking ID" },
      },
      required: ["bookingId"],
    },
  },
  {
    name: "send_location",
    description:
      "Send the salon's location to the customer. Use when customer asks for directions, address, or how to get to the salon.",
    parameters: {
      type: "OBJECT",
      properties: {},
    },
  },
];

export const adminTools: GeminiFunctionDeclaration[] = [
  {
    name: "count_bookings",
    description: "Count bookings for a specific date or date range.",
    parameters: {
      type: "OBJECT",
      properties: {
        date: { type: "STRING", description: "Specific date YYYY-MM-DD (use this OR startDate+endDate)" },
        startDate: { type: "STRING", description: "Range start date YYYY-MM-DD" },
        endDate: { type: "STRING", description: "Range end date YYYY-MM-DD" },
      },
    },
  },
  {
    name: "list_bookings",
    description: "List bookings with full details for a date or date range.",
    parameters: {
      type: "OBJECT",
      properties: {
        date: { type: "STRING", description: "Specific date YYYY-MM-DD" },
        startDate: { type: "STRING", description: "Range start YYYY-MM-DD" },
        endDate: { type: "STRING", description: "Range end YYYY-MM-DD" },
      },
    },
  },
  {
    name: "get_pending_bookings",
    description: "Get all bookings awaiting admin approval.",
    parameters: {
      type: "OBJECT",
      properties: {},
    },
  },
  {
    name: "get_no_show_report",
    description: "Get customers with repeated no-shows.",
    parameters: {
      type: "OBJECT",
      properties: {
        threshold: { type: "NUMBER", description: "Minimum no-show count (default 3)" },
      },
    },
  },
];
