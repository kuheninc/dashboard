import { internalAction, internalMutation } from "./_generated/server";
import { createAccount } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// Seed a second salon: "Bella Hair Studio"
// Account: tjaya771129@yahoo.com / Jaya0977
// Generates ~120 bookings across 90 days for great-looking dashboard graphs

export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    // ── 1. Create salon ──────────────────────────────────
    const salonId = await ctx.db.insert("salons", {
      name: "Bella Hair Studio",
      address: "28, Jalan Ampang, 50450 Kuala Lumpur",
      googleMapsLink: "https://maps.google.com/?q=3.1569,101.7123",
      waPhoneNumberId: "PENDING_SETUP_2",
      waBusinessAccountId: "PENDING_SETUP_2",
      waAccessToken: "PENDING_SETUP_2",
      adminPhones: ["+60177711129"],
      admins: [
        {
          email: "tjaya771129@yahoo.com",
          username: "tjaya",
          passwordHash:
            "4fa793ccb1a07597d2dbbf9c2a7ec80afccaa222c583cad6b423c09356628ff4",
          phone: "+60177711129",
          role: "owner" as const,
        },
      ],
      timezone: "Asia/Kuala_Lumpur",
      openingHours: [
        { day: 0, open: "10:00", close: "18:00", isClosed: true }, // Sun closed
        { day: 1, open: "09:00", close: "19:00", isClosed: false },
        { day: 2, open: "09:00", close: "19:00", isClosed: false },
        { day: 3, open: "09:00", close: "19:00", isClosed: false },
        { day: 4, open: "09:00", close: "19:00", isClosed: false },
        { day: 5, open: "09:00", close: "19:00", isClosed: false },
        { day: 6, open: "09:00", close: "17:00", isClosed: false }, // Sat shorter
      ],
      closedDates: ["2025-12-25", "2026-01-01", "2026-01-29", "2026-01-30"],
      isActive: true,
    });

    // ── 2. Seed services ─────────────────────────────────
    const serviceData = [
      { name: "Classic Haircut", nameBM: "Gunting Rambut Klasik", durationMinutes: 40, priceRM: 38, isActive: true },
      { name: "Premium Hair Coloring", nameBM: "Pewarnaan Premium", durationMinutes: 150, priceRM: 220, isActive: true },
      { name: "Keratin Treatment", nameBM: "Rawatan Keratin", durationMinutes: 90, priceRM: 150, isActive: true },
      { name: "Express Blow Dry", nameBM: "Blow Kering Ekspres", durationMinutes: 25, priceRM: 30, isActive: true },
      { name: "Balayage Highlights", nameBM: "Balayage", durationMinutes: 180, priceRM: 350, isActive: true },
      { name: "Deep Conditioning", nameBM: "Rawatan Mendalam", durationMinutes: 45, priceRM: 80, isActive: true },
      { name: "Bridal Updo", nameBM: "Sanggul Pengantin", durationMinutes: 120, priceRM: 250, isActive: false },
    ];

    const serviceIds: string[] = [];
    for (const svc of serviceData) {
      const id = await ctx.db.insert("services", { salonId, ...svc });
      serviceIds.push(id as any);
    }

    // ── 3. Seed stylists ─────────────────────────────────
    const stylistData = [
      {
        name: "Lisa", phone: "+60161111001", isActive: true,
        availability: [
          { day: 1, startTime: "09:00", endTime: "18:00" },
          { day: 2, startTime: "09:00", endTime: "18:00" },
          { day: 3, startTime: "09:00", endTime: "18:00" },
          { day: 4, startTime: "09:00", endTime: "18:00" },
          { day: 5, startTime: "09:00", endTime: "18:00" },
        ],
      },
      {
        name: "Kevin", phone: "+60162222002", isActive: true,
        availability: [
          { day: 1, startTime: "10:00", endTime: "19:00" },
          { day: 2, startTime: "10:00", endTime: "19:00" },
          { day: 4, startTime: "10:00", endTime: "19:00" },
          { day: 5, startTime: "10:00", endTime: "19:00" },
          { day: 6, startTime: "09:00", endTime: "17:00" },
        ],
      },
      {
        name: "Suraya", phone: "+60163333003", isActive: true,
        availability: [
          { day: 2, startTime: "09:00", endTime: "17:00" },
          { day: 3, startTime: "09:00", endTime: "17:00" },
          { day: 4, startTime: "09:00", endTime: "17:00" },
          { day: 5, startTime: "09:00", endTime: "17:00" },
          { day: 6, startTime: "09:00", endTime: "15:00" },
        ],
      },
      {
        name: "Jun Wei", phone: "+60164444004", isActive: true,
        availability: [
          { day: 1, startTime: "11:00", endTime: "19:00" },
          { day: 3, startTime: "11:00", endTime: "19:00" },
          { day: 4, startTime: "11:00", endTime: "19:00" },
          { day: 5, startTime: "11:00", endTime: "19:00" },
          { day: 6, startTime: "10:00", endTime: "17:00" },
        ],
      },
    ];

    const stylistIds: string[] = [];
    for (const sty of stylistData) {
      const id = await ctx.db.insert("stylists", { salonId, ...sty });
      stylistIds.push(id as any);
    }

    // ── 4. Seed customers ────────────────────────────────
    const customerData = [
      { name: "Tan Mei Ying", phone: "+60171000001", email: "meiying.t@gmail.com", noShowCount: 0, totalBookings: 14, isBlacklisted: false },
      { name: "Siti Nurhaliza", phone: "+60172000002", email: "siti.n@yahoo.com", noShowCount: 0, totalBookings: 11, isBlacklisted: false },
      { name: "Priya Devi", phone: "+60173000003", noShowCount: 1, totalBookings: 8, isBlacklisted: false },
      { name: "Wong Siew Ling", phone: "+60174000004", email: "siewling@hotmail.com", noShowCount: 0, totalBookings: 16, isBlacklisted: false },
      { name: "Fatimah Zahra", phone: "+60175000005", noShowCount: 0, totalBookings: 6, isBlacklisted: false },
      { name: "Chong Pei San", phone: "+60176000006", email: "peisan.c@gmail.com", noShowCount: 2, totalBookings: 9, isBlacklisted: false },
      { name: "Aisyah Kamil", phone: "+60177000007", noShowCount: 0, totalBookings: 5, isBlacklisted: false },
      { name: "Lim Jia Xin", phone: "+60178000008", email: "jiaxin.lim@gmail.com", noShowCount: 0, totalBookings: 12, isBlacklisted: false },
      { name: "Nor Azlina", phone: "+60179000009", noShowCount: 3, totalBookings: 4, isBlacklisted: true, notes: "Repeat no-show. Blacklisted." },
      { name: "Kavitha Suresh", phone: "+60170000010", email: "kavitha.s@outlook.com", noShowCount: 0, totalBookings: 7, isBlacklisted: false },
      { name: "Yap Hui Wen", phone: "+60171100011", noShowCount: 0, totalBookings: 3, isBlacklisted: false },
      { name: "Rabiatul Adawiyah", phone: "+60172200012", email: "rabiatul@email.com", noShowCount: 1, totalBookings: 10, isBlacklisted: false },
      { name: "Michelle Ooi", phone: "+60173300013", noShowCount: 0, totalBookings: 2, isBlacklisted: false },
      { name: "Nadia Rahman", phone: "+60174400014", email: "nadia.r@yahoo.com", noShowCount: 0, totalBookings: 8, isBlacklisted: false },
      { name: "Chen Xiao Ting", phone: "+60175500015", noShowCount: 0, totalBookings: 5, isBlacklisted: false },
      { name: "Zainab Ismail", phone: "+60176600016", email: "zainab.i@gmail.com", noShowCount: 4, totalBookings: 6, isBlacklisted: true, notes: "Called twice about no-shows. Blacklisted." },
      { name: "Teh Soo Mei", phone: "+60177700017", noShowCount: 0, totalBookings: 9, isBlacklisted: false },
      { name: "Shakira Ahmad", phone: "+60178800018", email: "shakira.a@email.com", noShowCount: 0, totalBookings: 1, isBlacklisted: false },
      { name: "Fong Li Wei", phone: "+60179900019", noShowCount: 0, totalBookings: 4, isBlacklisted: false },
      { name: "Amira Hussin", phone: "+60170000020", email: "amira.h@gmail.com", noShowCount: 0, totalBookings: 7, isBlacklisted: false },
    ];

    const customerIds: string[] = [];
    for (const cust of customerData) {
      const id = await ctx.db.insert("customers", { salonId, ...cust });
      customerIds.push(id as any);
    }

    // ── 5. Seed bookings (90 days, ~120 bookings) ────────
    // Helper: add minutes to time string
    const addMinutes = (time: string, mins: number): string => {
      const [h, m] = time.split(":").map(Number);
      const total = h * 60 + m + mins;
      return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
    };

    // Service index: 0=Haircut(38,40m) 1=Coloring(220,150m) 2=Keratin(150,90m) 3=BlowDry(30,25m) 4=Balayage(350,180m) 5=DeepCond(80,45m)
    const durations = [40, 150, 90, 25, 180, 45];

    type BookingRow = {
      ci: number; si: number; sti: number;
      date: string; startTime: string;
      status: "pending" | "confirmed" | "completed" | "no_show" | "cancelled";
      createdBy: "customer" | "admin";
    };

    const bookings: BookingRow[] = [
      // ─── November 2025 (light, ~12 bookings — salon ramping up) ───
      { ci: 0,  si: 0, sti: 0, date: "2025-11-28", startTime: "10:00", status: "completed", createdBy: "customer" },
      { ci: 1,  si: 3, sti: 1, date: "2025-11-28", startTime: "14:00", status: "completed", createdBy: "customer" },
      { ci: 3,  si: 0, sti: 2, date: "2025-12-01", startTime: "09:30", status: "completed", createdBy: "customer" },
      { ci: 4,  si: 5, sti: 0, date: "2025-12-02", startTime: "11:00", status: "completed", createdBy: "admin" },
      { ci: 7,  si: 0, sti: 3, date: "2025-12-03", startTime: "11:30", status: "completed", createdBy: "customer" },
      { ci: 2,  si: 2, sti: 1, date: "2025-12-04", startTime: "10:00", status: "completed", createdBy: "customer" },
      { ci: 9,  si: 3, sti: 0, date: "2025-12-04", startTime: "15:00", status: "completed", createdBy: "customer" },
      { ci: 5,  si: 0, sti: 2, date: "2025-12-05", startTime: "09:00", status: "completed", createdBy: "customer" },
      { ci: 10, si: 0, sti: 3, date: "2025-12-05", startTime: "14:00", status: "completed", createdBy: "customer" },
      { ci: 0,  si: 1, sti: 0, date: "2025-12-06", startTime: "10:00", status: "completed", createdBy: "customer" },
      { ci: 6,  si: 5, sti: 1, date: "2025-12-08", startTime: "10:00", status: "no_show", createdBy: "customer" },
      { ci: 8,  si: 0, sti: 2, date: "2025-12-08", startTime: "14:00", status: "no_show", createdBy: "customer" },

      // ─── December 2025 (growing, ~25 bookings) ───
      { ci: 1,  si: 0, sti: 0, date: "2025-12-09", startTime: "09:00", status: "completed", createdBy: "customer" },
      { ci: 3,  si: 2, sti: 1, date: "2025-12-09", startTime: "11:00", status: "completed", createdBy: "customer" },
      { ci: 11, si: 0, sti: 3, date: "2025-12-10", startTime: "11:30", status: "completed", createdBy: "customer" },
      { ci: 7,  si: 5, sti: 0, date: "2025-12-10", startTime: "14:00", status: "completed", createdBy: "admin" },
      { ci: 4,  si: 0, sti: 2, date: "2025-12-11", startTime: "10:00", status: "completed", createdBy: "customer" },
      { ci: 13, si: 3, sti: 1, date: "2025-12-11", startTime: "15:00", status: "completed", createdBy: "customer" },
      { ci: 14, si: 0, sti: 3, date: "2025-12-12", startTime: "09:30", status: "completed", createdBy: "customer" },
      { ci: 0,  si: 2, sti: 0, date: "2025-12-12", startTime: "14:00", status: "completed", createdBy: "customer" },
      { ci: 2,  si: 0, sti: 2, date: "2025-12-13", startTime: "09:00", status: "completed", createdBy: "customer" },
      { ci: 5,  si: 1, sti: 1, date: "2025-12-15", startTime: "10:00", status: "completed", createdBy: "customer" },
      { ci: 9,  si: 0, sti: 0, date: "2025-12-15", startTime: "14:30", status: "completed", createdBy: "customer" },
      { ci: 12, si: 5, sti: 3, date: "2025-12-16", startTime: "11:00", status: "completed", createdBy: "customer" },
      { ci: 16, si: 0, sti: 2, date: "2025-12-16", startTime: "15:00", status: "completed", createdBy: "customer" },
      { ci: 8,  si: 0, sti: 0, date: "2025-12-17", startTime: "10:00", status: "no_show", createdBy: "customer" },
      { ci: 3,  si: 4, sti: 1, date: "2025-12-17", startTime: "11:00", status: "completed", createdBy: "customer" },
      { ci: 17, si: 3, sti: 3, date: "2025-12-18", startTime: "14:00", status: "completed", createdBy: "customer" },
      { ci: 1,  si: 0, sti: 0, date: "2025-12-19", startTime: "09:00", status: "completed", createdBy: "admin" },
      { ci: 19, si: 0, sti: 2, date: "2025-12-19", startTime: "11:00", status: "completed", createdBy: "customer" },
      { ci: 7,  si: 2, sti: 1, date: "2025-12-20", startTime: "10:00", status: "completed", createdBy: "customer" },
      { ci: 10, si: 3, sti: 0, date: "2025-12-20", startTime: "14:00", status: "completed", createdBy: "customer" },
      { ci: 6,  si: 0, sti: 3, date: "2025-12-22", startTime: "11:00", status: "cancelled", createdBy: "customer" },
      { ci: 15, si: 0, sti: 2, date: "2025-12-22", startTime: "14:30", status: "no_show", createdBy: "customer" },
      { ci: 0,  si: 5, sti: 0, date: "2025-12-23", startTime: "10:00", status: "completed", createdBy: "customer" },
      { ci: 11, si: 1, sti: 1, date: "2025-12-23", startTime: "11:00", status: "completed", createdBy: "customer" },
      { ci: 4,  si: 0, sti: 3, date: "2025-12-24", startTime: "09:00", status: "completed", createdBy: "customer" },

      // ─── January 2026 (steady growth, ~35 bookings) ───
      { ci: 3,  si: 0, sti: 0, date: "2026-01-02", startTime: "09:30", status: "completed", createdBy: "customer" },
      { ci: 1,  si: 5, sti: 2, date: "2026-01-02", startTime: "11:00", status: "completed", createdBy: "customer" },
      { ci: 7,  si: 0, sti: 1, date: "2026-01-02", startTime: "14:00", status: "completed", createdBy: "customer" },
      { ci: 14, si: 3, sti: 3, date: "2026-01-05", startTime: "11:30", status: "completed", createdBy: "customer" },
      { ci: 0,  si: 0, sti: 0, date: "2026-01-05", startTime: "15:00", status: "completed", createdBy: "admin" },
      { ci: 9,  si: 2, sti: 1, date: "2026-01-06", startTime: "10:00", status: "completed", createdBy: "customer" },
      { ci: 5,  si: 0, sti: 2, date: "2026-01-06", startTime: "14:30", status: "completed", createdBy: "customer" },
      { ci: 12, si: 5, sti: 0, date: "2026-01-07", startTime: "09:00", status: "completed", createdBy: "customer" },
      { ci: 19, si: 0, sti: 3, date: "2026-01-07", startTime: "11:00", status: "completed", createdBy: "customer" },
      { ci: 16, si: 1, sti: 1, date: "2026-01-08", startTime: "10:00", status: "completed", createdBy: "customer" },
      { ci: 2,  si: 0, sti: 0, date: "2026-01-08", startTime: "15:00", status: "no_show", createdBy: "customer" },
      { ci: 13, si: 3, sti: 2, date: "2026-01-09", startTime: "11:00", status: "completed", createdBy: "customer" },
      { ci: 4,  si: 2, sti: 3, date: "2026-01-09", startTime: "14:00", status: "completed", createdBy: "customer" },
      { ci: 10, si: 0, sti: 0, date: "2026-01-10", startTime: "09:00", status: "completed", createdBy: "customer" },
      { ci: 6,  si: 0, sti: 1, date: "2026-01-12", startTime: "10:00", status: "completed", createdBy: "customer" },
      { ci: 17, si: 5, sti: 2, date: "2026-01-12", startTime: "14:00", status: "completed", createdBy: "admin" },
      { ci: 1,  si: 0, sti: 0, date: "2026-01-13", startTime: "09:30", status: "completed", createdBy: "customer" },
      { ci: 8,  si: 3, sti: 3, date: "2026-01-13", startTime: "11:00", status: "no_show", createdBy: "customer" },
      { ci: 3,  si: 1, sti: 1, date: "2026-01-14", startTime: "10:00", status: "completed", createdBy: "customer" },
      { ci: 11, si: 0, sti: 0, date: "2026-01-14", startTime: "14:30", status: "completed", createdBy: "customer" },
      { ci: 7,  si: 0, sti: 2, date: "2026-01-15", startTime: "10:00", status: "completed", createdBy: "customer" },
      { ci: 0,  si: 4, sti: 1, date: "2026-01-15", startTime: "11:00", status: "completed", createdBy: "customer" },
      { ci: 19, si: 5, sti: 3, date: "2026-01-16", startTime: "14:00", status: "completed", createdBy: "customer" },
      { ci: 5,  si: 0, sti: 0, date: "2026-01-16", startTime: "15:30", status: "completed", createdBy: "customer" },
      { ci: 15, si: 0, sti: 2, date: "2026-01-17", startTime: "09:00", status: "no_show", createdBy: "customer" },
      { ci: 14, si: 2, sti: 1, date: "2026-01-19", startTime: "10:00", status: "completed", createdBy: "customer" },
      { ci: 9,  si: 0, sti: 0, date: "2026-01-19", startTime: "14:00", status: "completed", createdBy: "customer" },
      { ci: 4,  si: 0, sti: 3, date: "2026-01-20", startTime: "11:30", status: "completed", createdBy: "customer" },
      { ci: 16, si: 3, sti: 2, date: "2026-01-20", startTime: "15:00", status: "cancelled", createdBy: "customer" },
      { ci: 12, si: 0, sti: 0, date: "2026-01-21", startTime: "09:00", status: "completed", createdBy: "customer" },
      { ci: 1,  si: 2, sti: 1, date: "2026-01-21", startTime: "10:00", status: "completed", createdBy: "admin" },
      { ci: 13, si: 5, sti: 3, date: "2026-01-22", startTime: "11:00", status: "completed", createdBy: "customer" },
      { ci: 6,  si: 0, sti: 0, date: "2026-01-22", startTime: "14:30", status: "completed", createdBy: "customer" },
      { ci: 10, si: 0, sti: 2, date: "2026-01-23", startTime: "10:00", status: "completed", createdBy: "customer" },
      { ci: 18, si: 1, sti: 1, date: "2026-01-23", startTime: "11:00", status: "completed", createdBy: "customer" },

      // ─── February 2026 (busiest, ~45 bookings including future) ───
      { ci: 0,  si: 0, sti: 0, date: "2026-02-02", startTime: "09:00", status: "completed", createdBy: "customer" },
      { ci: 3,  si: 5, sti: 2, date: "2026-02-02", startTime: "11:00", status: "completed", createdBy: "customer" },
      { ci: 7,  si: 0, sti: 1, date: "2026-02-02", startTime: "14:00", status: "completed", createdBy: "admin" },
      { ci: 11, si: 3, sti: 3, date: "2026-02-03", startTime: "11:30", status: "completed", createdBy: "customer" },
      { ci: 4,  si: 2, sti: 0, date: "2026-02-03", startTime: "14:00", status: "completed", createdBy: "customer" },
      { ci: 1,  si: 0, sti: 2, date: "2026-02-04", startTime: "09:30", status: "completed", createdBy: "customer" },
      { ci: 9,  si: 1, sti: 1, date: "2026-02-04", startTime: "10:00", status: "completed", createdBy: "customer" },
      { ci: 14, si: 0, sti: 3, date: "2026-02-05", startTime: "11:00", status: "completed", createdBy: "customer" },
      { ci: 5,  si: 5, sti: 0, date: "2026-02-05", startTime: "15:00", status: "completed", createdBy: "customer" },
      { ci: 16, si: 0, sti: 2, date: "2026-02-06", startTime: "09:00", status: "completed", createdBy: "customer" },
      { ci: 12, si: 0, sti: 1, date: "2026-02-06", startTime: "14:00", status: "completed", createdBy: "customer" },
      { ci: 2,  si: 2, sti: 0, date: "2026-02-07", startTime: "10:00", status: "completed", createdBy: "customer" },
      { ci: 19, si: 3, sti: 3, date: "2026-02-09", startTime: "11:00", status: "completed", createdBy: "customer" },
      { ci: 0,  si: 0, sti: 2, date: "2026-02-09", startTime: "14:30", status: "completed", createdBy: "customer" },
      { ci: 17, si: 0, sti: 0, date: "2026-02-10", startTime: "09:00", status: "completed", createdBy: "customer" },
      { ci: 8,  si: 5, sti: 1, date: "2026-02-10", startTime: "10:00", status: "no_show", createdBy: "customer" },
      { ci: 6,  si: 0, sti: 3, date: "2026-02-10", startTime: "14:00", status: "completed", createdBy: "customer" },
      { ci: 3,  si: 1, sti: 0, date: "2026-02-11", startTime: "10:00", status: "completed", createdBy: "customer" },
      { ci: 10, si: 0, sti: 2, date: "2026-02-11", startTime: "14:00", status: "completed", createdBy: "admin" },
      { ci: 13, si: 2, sti: 1, date: "2026-02-12", startTime: "10:00", status: "completed", createdBy: "customer" },
      { ci: 4,  si: 0, sti: 3, date: "2026-02-12", startTime: "11:30", status: "completed", createdBy: "customer" },
      { ci: 15, si: 0, sti: 0, date: "2026-02-12", startTime: "15:00", status: "no_show", createdBy: "customer" },
      { ci: 1,  si: 4, sti: 1, date: "2026-02-13", startTime: "10:00", status: "completed", createdBy: "customer" },
      { ci: 7,  si: 0, sti: 2, date: "2026-02-13", startTime: "14:00", status: "completed", createdBy: "customer" },
      { ci: 11, si: 5, sti: 0, date: "2026-02-13", startTime: "15:00", status: "completed", createdBy: "customer" },
      { ci: 9,  si: 0, sti: 3, date: "2026-02-14", startTime: "09:00", status: "completed", createdBy: "customer" },
      { ci: 18, si: 3, sti: 2, date: "2026-02-16", startTime: "11:00", status: "completed", createdBy: "customer" },
      { ci: 0,  si: 2, sti: 0, date: "2026-02-16", startTime: "14:00", status: "completed", createdBy: "customer" },
      { ci: 5,  si: 0, sti: 1, date: "2026-02-17", startTime: "10:00", status: "completed", createdBy: "customer" },
      { ci: 14, si: 0, sti: 3, date: "2026-02-17", startTime: "14:30", status: "completed", createdBy: "customer" },
      { ci: 16, si: 1, sti: 0, date: "2026-02-18", startTime: "10:00", status: "completed", createdBy: "customer" },
      { ci: 12, si: 5, sti: 2, date: "2026-02-18", startTime: "14:00", status: "completed", createdBy: "customer" },
      { ci: 3,  si: 0, sti: 1, date: "2026-02-19", startTime: "10:00", status: "completed", createdBy: "customer" },
      { ci: 7,  si: 3, sti: 3, date: "2026-02-19", startTime: "14:00", status: "completed", createdBy: "customer" },
      { ci: 19, si: 0, sti: 0, date: "2026-02-20", startTime: "09:00", status: "completed", createdBy: "customer" },
      { ci: 1,  si: 2, sti: 2, date: "2026-02-20", startTime: "11:00", status: "completed", createdBy: "admin" },
      { ci: 10, si: 0, sti: 1, date: "2026-02-20", startTime: "14:00", status: "completed", createdBy: "customer" },
      { ci: 6,  si: 0, sti: 0, date: "2026-02-21", startTime: "09:30", status: "completed", createdBy: "customer" },
      { ci: 4,  si: 5, sti: 3, date: "2026-02-23", startTime: "11:00", status: "completed", createdBy: "customer" },
      { ci: 13, si: 0, sti: 2, date: "2026-02-23", startTime: "14:00", status: "completed", createdBy: "customer" },
      { ci: 0,  si: 0, sti: 0, date: "2026-02-24", startTime: "09:00", status: "completed", createdBy: "customer" },
      { ci: 17, si: 1, sti: 1, date: "2026-02-24", startTime: "10:00", status: "completed", createdBy: "customer" },
      { ci: 11, si: 3, sti: 3, date: "2026-02-24", startTime: "14:00", status: "completed", createdBy: "customer" },
      { ci: 2,  si: 0, sti: 0, date: "2026-02-25", startTime: "09:30", status: "completed", createdBy: "customer" },
      { ci: 5,  si: 2, sti: 2, date: "2026-02-25", startTime: "10:00", status: "completed", createdBy: "customer" },
      { ci: 9,  si: 0, sti: 1, date: "2026-02-25", startTime: "14:00", status: "completed", createdBy: "customer" },
      // Today (2026-02-26)
      { ci: 7,  si: 0, sti: 0, date: "2026-02-26", startTime: "09:00", status: "confirmed", createdBy: "customer" },
      { ci: 3,  si: 5, sti: 2, date: "2026-02-26", startTime: "10:00", status: "confirmed", createdBy: "customer" },
      { ci: 14, si: 1, sti: 1, date: "2026-02-26", startTime: "10:00", status: "confirmed", createdBy: "admin" },
      { ci: 4,  si: 0, sti: 3, date: "2026-02-26", startTime: "11:00", status: "confirmed", createdBy: "customer" },
      { ci: 12, si: 3, sti: 0, date: "2026-02-26", startTime: "14:00", status: "pending", createdBy: "customer" },
      { ci: 1,  si: 0, sti: 2, date: "2026-02-26", startTime: "14:30", status: "confirmed", createdBy: "customer" },
      { ci: 19, si: 2, sti: 1, date: "2026-02-26", startTime: "15:00", status: "pending", createdBy: "customer" },
      // Tomorrow + next days (future bookings)
      { ci: 0,  si: 4, sti: 0, date: "2026-02-27", startTime: "10:00", status: "confirmed", createdBy: "customer" },
      { ci: 10, si: 0, sti: 1, date: "2026-02-27", startTime: "11:00", status: "confirmed", createdBy: "customer" },
      { ci: 6,  si: 2, sti: 2, date: "2026-02-27", startTime: "14:00", status: "pending", createdBy: "customer" },
      { ci: 16, si: 0, sti: 3, date: "2026-02-27", startTime: "14:30", status: "confirmed", createdBy: "admin" },
      { ci: 11, si: 5, sti: 0, date: "2026-02-28", startTime: "10:00", status: "confirmed", createdBy: "customer" },
      { ci: 3,  si: 0, sti: 1, date: "2026-02-28", startTime: "11:30", status: "pending", createdBy: "customer" },
      { ci: 5,  si: 1, sti: 2, date: "2026-02-28", startTime: "14:00", status: "confirmed", createdBy: "customer" },
    ];

    let bookingCount = 0;
    const bookingIds: { index: number; id: any }[] = [];
    for (let i = 0; i < bookings.length; i++) {
      const b = bookings[i];
      const customerId = customerIds[b.ci] as any;
      const serviceId = serviceIds[b.si] as any;
      const stylistId = stylistIds[b.sti] as any;
      const endTime = addMinutes(b.startTime, durations[b.si]);

      const bookingId = await ctx.db.insert("bookings", {
        salonId,
        customerId,
        stylistId,
        serviceId,
        date: b.date,
        startTime: b.startTime,
        endTime,
        status: b.status,
        createdBy: b.createdBy,
      });
      bookingIds.push({ index: i, id: bookingId });
      bookingCount++;
    }

    // ── 6. Seed no-show logs ─────────────────────────────
    for (const { index, id } of bookingIds) {
      const b = bookings[index];
      if (b.status !== "no_show") continue;
      await ctx.db.insert("noShowLog", {
        salonId,
        customerId: customerIds[b.ci] as any,
        bookingId: id,
        date: b.date,
        flaggedAsRepeatOffender: customerData[b.ci].noShowCount >= 3,
      });
    }

    // ── 7. Seed notifications ────────────────────────────
    const now = Date.now();
    await ctx.db.insert("notifications", {
      salonId,
      type: "pending_booking" as const,
      title: "New booking request",
      body: "Michelle Ooi requested a Blow Dry on Feb 26 at 2:00 PM with Lisa.",
      read: false,
      actedOn: false,
      createdAt: now - 30 * 60 * 1000,
    });
    await ctx.db.insert("notifications", {
      salonId,
      type: "pending_booking" as const,
      title: "New booking request",
      body: "Amira Hussin requested a Keratin Treatment on Feb 26 at 3:00 PM with Kevin.",
      read: false,
      actedOn: false,
      createdAt: now - 15 * 60 * 1000,
    });
    await ctx.db.insert("notifications", {
      salonId,
      type: "customer_cancelled" as const,
      title: "Booking cancelled",
      body: "Zainab Ismail cancelled her Haircut on Feb 22.",
      read: true,
      actedOn: true,
      createdAt: now - 4 * 24 * 60 * 60 * 1000,
    });

    return {
      salonId,
      services: serviceData.length,
      stylists: stylistData.length,
      customers: customerData.length,
      bookings: bookingCount,
    };
  },
});

// Create auth user and link to salon
export const createUserAndLink = internalAction({
  args: {},
  handler: async (ctx) => {
    // Create the Convex Auth user
    const userId = await createAccount(ctx, {
      provider: "password",
      account: {
        id: "tjaya771129@yahoo.com",
        secret: "Jaya0977",
      },
      profile: {
        email: "tjaya771129@yahoo.com",
        name: "T Jaya",
      },
    });

    if (!userId) throw new Error("Failed to create user account");

    // createAccount may return the user ID or a full object depending on version
    const uid = typeof userId === "string" ? userId : (userId as any)?.user?._id ?? (userId as any);

    // Link user to salon
    await ctx.runMutation(internal.seedSecondSalon.linkUserToSalon, {
      userId: uid,
    });

    return { userId: uid };
  },
});

// Link user to the Bella Hair Studio salon
export const linkUserToSalon = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const salons = await ctx.db.query("salons").collect();
    const salon = salons.find((s) => s.name === "Bella Hair Studio");
    if (!salon) throw new Error("Bella Hair Studio not found. Run seed first.");

    const existing = await ctx.db
      .query("salonMembers")
      .withIndex("by_user_salon", (q) =>
        q.eq("userId", userId).eq("salonId", salon._id)
      )
      .first();
    if (existing) return existing._id;

    return await ctx.db.insert("salonMembers", {
      userId,
      salonId: salon._id,
      role: "owner",
    });
  },
});
