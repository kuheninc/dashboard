import { internalMutation } from "./_generated/server";

// Mock-data-based seed: replaces all non-technical salon data
// Preserves: waPhoneNumberId, waBusinessAccountId, waAccessToken, admins, ownerId
// Replaces: name, address, openingHours, services, stylists, customers, bookings

export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    // ── 1. Find existing salon ─────────────────────────
    const salons = await ctx.db.query("salons").collect();
    if (salons.length === 0) throw new Error("No salon found. Run onboarding first.");
    const salon = salons[0];

    // ── 2. Update salon non-technical fields ───────────
    await ctx.db.patch(salon._id, {
      name: "Glow Studio KL",
      address: "12, Jalan Bukit Bintang, 55100 KL",
      timezone: "Asia/Kuala_Lumpur",
      openingHours: [
        { day: 0, open: "10:00", close: "20:00", isClosed: true },
        { day: 1, open: "10:00", close: "20:00", isClosed: false },
        { day: 2, open: "10:00", close: "20:00", isClosed: false },
        { day: 3, open: "10:00", close: "20:00", isClosed: false },
        { day: 4, open: "10:00", close: "20:00", isClosed: false },
        { day: 5, open: "10:00", close: "20:00", isClosed: false },
        { day: 6, open: "10:00", close: "18:00", isClosed: false },
      ],
    });

    // ── 3. Delete existing data for this salon ─────────
    const existingBookings = await ctx.db
      .query("bookings")
      .withIndex("by_salon_date", (q) => q.eq("salonId", salon._id))
      .collect();
    for (const b of existingBookings) await ctx.db.delete(b._id);

    const existingNoShowLogs = await ctx.db
      .query("noShowLog")
      .withIndex("by_salon_date", (q) => q.eq("salonId", salon._id))
      .collect();
    for (const n of existingNoShowLogs) await ctx.db.delete(n._id);

    const existingCustomers = await ctx.db
      .query("customers")
      .withIndex("by_salon", (q) => q.eq("salonId", salon._id))
      .collect();
    for (const c of existingCustomers) await ctx.db.delete(c._id);

    const existingServices = await ctx.db
      .query("services")
      .withIndex("by_salon", (q) => q.eq("salonId", salon._id))
      .collect();
    for (const s of existingServices) await ctx.db.delete(s._id);

    const existingStylists = await ctx.db
      .query("stylists")
      .withIndex("by_salon", (q) => q.eq("salonId", salon._id))
      .collect();
    for (const s of existingStylists) await ctx.db.delete(s._id);

    const existingConversations = await ctx.db
      .query("conversations")
      .withIndex("by_salon_phone", (q) => q.eq("salonId", salon._id))
      .collect();
    for (const c of existingConversations) {
      const msgs = await ctx.db
        .query("messages")
        .withIndex("by_conversation", (q) => q.eq("conversationId", c._id))
        .collect();
      for (const m of msgs) await ctx.db.delete(m._id);
      await ctx.db.delete(c._id);
    }

    // ── 4. Seed services ───────────────────────────────
    const serviceMap = new Map<string, typeof salon._id>();

    const services = [
      { mockId: "svc1", name: "Haircut", nameBM: "Gunting Rambut", durationMinutes: 45, priceRM: 45, isActive: true },
      { mockId: "svc2", name: "Hair Coloring", nameBM: "Pewarnaan Rambut", durationMinutes: 120, priceRM: 180, isActive: true },
      { mockId: "svc3", name: "Hair Treatment", nameBM: "Rawatan Rambut", durationMinutes: 60, priceRM: 120, isActive: true },
      { mockId: "svc4", name: "Blow Dry & Styling", nameBM: "Blow Kering & Gaya", durationMinutes: 30, priceRM: 35, isActive: true },
      { mockId: "svc5", name: "Rebonding", nameBM: "Rebonding", durationMinutes: 180, priceRM: 280, isActive: true },
      { mockId: "svc6", name: "Scalp Treatment", nameBM: "Rawatan Kulit Kepala", durationMinutes: 45, priceRM: 90, isActive: false },
    ];

    for (const { mockId, ...svc } of services) {
      const id = await ctx.db.insert("services", { salonId: salon._id, ...svc });
      serviceMap.set(mockId, id as any);
    }

    // ── 5. Seed stylists ───────────────────────────────
    const stylistMap = new Map<string, typeof salon._id>();

    const stylists = [
      {
        mockId: "st1", name: "Aisha", phone: "60111111111", isActive: true,
        availability: [
          { day: 1, startTime: "10:00", endTime: "19:00" },
          { day: 2, startTime: "10:00", endTime: "19:00" },
          { day: 3, startTime: "10:00", endTime: "19:00" },
          { day: 4, startTime: "10:00", endTime: "19:00" },
          { day: 5, startTime: "10:00", endTime: "19:00" },
          { day: 6, startTime: "10:00", endTime: "17:00" },
        ],
      },
      {
        mockId: "st2", name: "Wei Lin", phone: "60122222222", isActive: true,
        availability: [
          { day: 1, startTime: "11:00", endTime: "20:00" },
          { day: 2, startTime: "11:00", endTime: "20:00" },
          { day: 3, startTime: "11:00", endTime: "20:00" },
          { day: 5, startTime: "11:00", endTime: "20:00" },
          { day: 6, startTime: "10:00", endTime: "18:00" },
        ],
      },
      {
        mockId: "st3", name: "Priya", phone: "60133333333", isActive: true,
        availability: [
          { day: 1, startTime: "10:00", endTime: "18:00" },
          { day: 2, startTime: "10:00", endTime: "18:00" },
          { day: 4, startTime: "10:00", endTime: "18:00" },
          { day: 5, startTime: "10:00", endTime: "18:00" },
          { day: 6, startTime: "10:00", endTime: "16:00" },
        ],
      },
      {
        mockId: "st4", name: "Daniel", phone: "60144444444", isActive: true,
        availability: [
          { day: 2, startTime: "12:00", endTime: "20:00" },
          { day: 3, startTime: "12:00", endTime: "20:00" },
          { day: 4, startTime: "12:00", endTime: "20:00" },
          { day: 5, startTime: "12:00", endTime: "20:00" },
          { day: 6, startTime: "10:00", endTime: "18:00" },
        ],
      },
    ];

    for (const { mockId, ...sty } of stylists) {
      const id = await ctx.db.insert("stylists", { salonId: salon._id, ...sty });
      stylistMap.set(mockId, id as any);
    }

    // ── 6. Seed customers ──────────────────────────────
    const customerMap = new Map<string, typeof salon._id>();

    const customers = [
      { mockId: "c1", name: "Sarah Tan", phone: "60171234567", email: "sarah@email.com", noShowCount: 0, totalBookings: 8, isBlacklisted: false },
      { mockId: "c2", name: "Aminah Binti Hassan", phone: "60182345678", email: "aminah.h@email.com", noShowCount: 1, totalBookings: 12, isBlacklisted: false },
      { mockId: "c3", name: "Jessica Wong", phone: "60193456789", noShowCount: 3, totalBookings: 5, isBlacklisted: true },
      { mockId: "c4", name: "Nurul Izzah", phone: "60174567890", email: "nurul.i@email.com", noShowCount: 0, totalBookings: 15, isBlacklisted: false },
      { mockId: "c5", name: "Rachel Lim", phone: "60185678901", noShowCount: 2, totalBookings: 6, isBlacklisted: false },
      { mockId: "c6", name: "Siti Aishah", phone: "60196789012", email: "siti.a@email.com", noShowCount: 0, totalBookings: 3, isBlacklisted: false },
      { mockId: "c7", name: "Mei Ling Chen", phone: "60177890123", noShowCount: 0, totalBookings: 20, isBlacklisted: false },
      { mockId: "c8", name: "Farah Abdullah", phone: "60188901234", email: "farah.ab@email.com", noShowCount: 4, totalBookings: 7, isBlacklisted: true, notes: "Repeat no-show. Contacted twice." },
      { mockId: "c9", name: "Amanda Lee", phone: "60199012345", email: "amanda.l@email.com", noShowCount: 0, totalBookings: 2, isBlacklisted: false },
      { mockId: "c10", name: "Kavitha Ramasamy", phone: "60170123456", noShowCount: 1, totalBookings: 9, isBlacklisted: false },
      { mockId: "c11", name: "Zara Othman", phone: "60181234567", email: "zara.o@email.com", noShowCount: 0, totalBookings: 4, isBlacklisted: false },
      { mockId: "c12", name: "Michelle Ng", phone: "60192345678", noShowCount: 0, totalBookings: 11, isBlacklisted: false },
      { mockId: "c13", name: "Putri Zainal", phone: "60173456789", email: "putri.z@email.com", noShowCount: 2, totalBookings: 3, isBlacklisted: false },
      { mockId: "c14", name: "Lily Chong", phone: "60184567890", noShowCount: 0, totalBookings: 1, isBlacklisted: false },
      { mockId: "c15", name: "Halimah Yusof", phone: "60195678901", email: "halimah.y@email.com", noShowCount: 0, totalBookings: 6, isBlacklisted: false },
    ];

    for (const { mockId, ...cust } of customers) {
      const id = await ctx.db.insert("customers", { salonId: salon._id, ...cust });
      customerMap.set(mockId, id as any);
    }

    // ── 7. Seed bookings ───────────────────────────────
    const bookings = [
      // Today (2026-02-23)
      { customerId: "c1", stylistId: "st1", serviceId: "svc1", date: "2026-02-23", startTime: "10:00", endTime: "10:45", status: "confirmed" as const, createdBy: "customer" as const },
      { customerId: "c2", stylistId: "st2", serviceId: "svc2", date: "2026-02-23", startTime: "11:00", endTime: "13:00", status: "confirmed" as const, createdBy: "customer" as const },
      { customerId: "c4", stylistId: "st1", serviceId: "svc3", date: "2026-02-23", startTime: "11:00", endTime: "12:00", status: "customer_confirmed" as const, createdBy: "customer" as const },
      { customerId: "c7", stylistId: "st3", serviceId: "svc1", date: "2026-02-23", startTime: "14:00", endTime: "14:45", status: "confirmed" as const, createdBy: "admin" as const },
      { customerId: "c10", stylistId: "st4", serviceId: "svc4", date: "2026-02-23", startTime: "14:30", endTime: "15:00", status: "pending_approval" as const, createdBy: "customer" as const },
      { customerId: "c6", stylistId: "st2", serviceId: "svc1", date: "2026-02-23", startTime: "15:00", endTime: "15:45", status: "pending_approval" as const, createdBy: "customer" as const },
      { customerId: "c12", stylistId: "st1", serviceId: "svc5", date: "2026-02-23", startTime: "15:00", endTime: "18:00", status: "confirmed" as const, createdBy: "customer" as const },
      // Yesterday
      { customerId: "c5", stylistId: "st2", serviceId: "svc1", date: "2026-02-22", startTime: "10:00", endTime: "10:45", status: "completed" as const, createdBy: "customer" as const },
      { customerId: "c3", stylistId: "st3", serviceId: "svc3", date: "2026-02-22", startTime: "11:00", endTime: "12:00", status: "no_show" as const, createdBy: "customer" as const },
      { customerId: "c1", stylistId: "st1", serviceId: "svc2", date: "2026-02-22", startTime: "13:00", endTime: "15:00", status: "completed" as const, createdBy: "customer" as const },
      { customerId: "c9", stylistId: "st4", serviceId: "svc4", date: "2026-02-22", startTime: "14:00", endTime: "14:30", status: "completed" as const, createdBy: "admin" as const },
      // Tomorrow
      { customerId: "c11", stylistId: "st1", serviceId: "svc1", date: "2026-02-24", startTime: "10:00", endTime: "10:45", status: "confirmed" as const, createdBy: "customer" as const },
      { customerId: "c15", stylistId: "st2", serviceId: "svc3", date: "2026-02-24", startTime: "11:00", endTime: "12:00", status: "confirmed" as const, createdBy: "customer" as const },
      { customerId: "c4", stylistId: "st3", serviceId: "svc5", date: "2026-02-24", startTime: "13:00", endTime: "16:00", status: "pending_approval" as const, createdBy: "customer" as const },
      // This week
      { customerId: "c7", stylistId: "st1", serviceId: "svc2", date: "2026-02-25", startTime: "10:00", endTime: "12:00", status: "confirmed" as const, createdBy: "customer" as const },
      { customerId: "c2", stylistId: "st4", serviceId: "svc1", date: "2026-02-25", startTime: "14:00", endTime: "14:45", status: "confirmed" as const, createdBy: "customer" as const },
      { customerId: "c13", stylistId: "st2", serviceId: "svc4", date: "2026-02-26", startTime: "10:00", endTime: "10:30", status: "confirmed" as const, createdBy: "customer" as const },
      // Past week
      { customerId: "c10", stylistId: "st3", serviceId: "svc1", date: "2026-02-21", startTime: "10:00", endTime: "10:45", status: "completed" as const, createdBy: "customer" as const },
      { customerId: "c8", stylistId: "st1", serviceId: "svc3", date: "2026-02-21", startTime: "14:00", endTime: "15:00", status: "no_show" as const, createdBy: "customer" as const },
      { customerId: "c12", stylistId: "st2", serviceId: "svc2", date: "2026-02-20", startTime: "11:00", endTime: "13:00", status: "completed" as const, createdBy: "admin" as const },
      { customerId: "c4", stylistId: "st4", serviceId: "svc1", date: "2026-02-20", startTime: "15:00", endTime: "15:45", status: "completed" as const, createdBy: "customer" as const },
      { customerId: "c6", stylistId: "st1", serviceId: "svc4", date: "2026-02-19", startTime: "10:00", endTime: "10:30", status: "completed" as const, createdBy: "customer" as const },
      { customerId: "c5", stylistId: "st3", serviceId: "svc5", date: "2026-02-19", startTime: "13:00", endTime: "16:00", status: "cancelled_customer" as const, createdBy: "customer" as const },
      { customerId: "c1", stylistId: "st2", serviceId: "svc1", date: "2026-02-18", startTime: "11:00", endTime: "11:45", status: "completed" as const, createdBy: "customer" as const },
      { customerId: "c14", stylistId: "st1", serviceId: "svc3", date: "2026-02-18", startTime: "14:00", endTime: "15:00", status: "completed" as const, createdBy: "customer" as const },
      { customerId: "c7", stylistId: "st4", serviceId: "svc1", date: "2026-02-17", startTime: "10:00", endTime: "10:45", status: "completed" as const, createdBy: "admin" as const },
      { customerId: "c2", stylistId: "st2", serviceId: "svc2", date: "2026-02-17", startTime: "13:00", endTime: "15:00", status: "cancelled_admin" as const, createdBy: "customer" as const },
      { customerId: "c11", stylistId: "st3", serviceId: "svc4", date: "2026-02-16", startTime: "15:00", endTime: "15:30", status: "completed" as const, createdBy: "customer" as const },
      { customerId: "c9", stylistId: "st1", serviceId: "svc1", date: "2026-02-16", startTime: "10:00", endTime: "10:45", status: "completed" as const, createdBy: "customer" as const },
      { customerId: "c15", stylistId: "st4", serviceId: "svc3", date: "2026-02-15", startTime: "11:00", endTime: "12:00", status: "completed" as const, createdBy: "customer" as const },
    ];

    for (const booking of bookings) {
      const cId = customerMap.get(booking.customerId);
      const stId = stylistMap.get(booking.stylistId);
      const svcId = serviceMap.get(booking.serviceId);
      if (!cId || !stId || !svcId) continue;

      await ctx.db.insert("bookings", {
        salonId: salon._id,
        customerId: cId as any,
        stylistId: stId as any,
        serviceId: svcId as any,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
        createdBy: booking.createdBy,
      });
    }

    return {
      salonId: salon._id,
      services: services.length,
      stylists: stylists.length,
      customers: customers.length,
      bookings: bookings.length,
    };
  },
});
