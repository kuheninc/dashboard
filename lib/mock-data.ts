// Mock data for admin dashboard — mirrors Convex schema types
// Will be replaced with real Convex queries later

export type BookingStatus =
  | "pending_approval"
  | "confirmed"
  | "reminder_sent"
  | "customer_confirmed"
  | "completed"
  | "no_show"
  | "cancelled_customer"
  | "cancelled_admin";

export interface MockSalon {
  id: string;
  name: string;
  address: string;
  adminPhones: string[];
  timezone: string;
}

export interface MockService {
  id: string;
  name: string;
  nameBM: string;
  durationMinutes: number;
  priceRM: number;
  isActive: boolean;
}

export interface MockStylist {
  id: string;
  name: string;
  phone: string;
  isActive: boolean;
  availability: { day: number; startTime: string; endTime: string }[];
}

export interface MockCustomer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  noShowCount: number;
  totalBookings: number;
  isBlacklisted: boolean;
  notes?: string;
  joinedDate: string;
}

export interface MockBooking {
  id: string;
  customerId: string;
  stylistId: string;
  serviceId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  createdBy: "customer" | "admin";
}

export interface MockActivity {
  id: string;
  type: "booking" | "cancellation" | "no_show" | "new_customer" | "completed";
  message: string;
  timestamp: string;
}

export interface TrendDataPoint {
  date: string;
  value: number;
}

export interface PeakHourCell {
  day: number;
  hour: number;
  count: number;
}

// ─── Salon ───────────────────────────────────────────
export const mockSalon: MockSalon = {
  id: "s1",
  name: "Glow Studio KL",
  address: "12, Jalan Bukit Bintang, 55100 KL",
  adminPhones: ["60123456789"],
  timezone: "Asia/Kuala_Lumpur",
};

// ─── Services ────────────────────────────────────────
export const mockServices: MockService[] = [
  { id: "svc1", name: "Haircut", nameBM: "Gunting Rambut", durationMinutes: 45, priceRM: 45, isActive: true },
  { id: "svc2", name: "Hair Coloring", nameBM: "Pewarnaan Rambut", durationMinutes: 120, priceRM: 180, isActive: true },
  { id: "svc3", name: "Hair Treatment", nameBM: "Rawatan Rambut", durationMinutes: 60, priceRM: 120, isActive: true },
  { id: "svc4", name: "Blow Dry & Styling", nameBM: "Blow Kering & Gaya", durationMinutes: 30, priceRM: 35, isActive: true },
  { id: "svc5", name: "Rebonding", nameBM: "Rebonding", durationMinutes: 180, priceRM: 280, isActive: true },
  { id: "svc6", name: "Scalp Treatment", nameBM: "Rawatan Kulit Kepala", durationMinutes: 45, priceRM: 90, isActive: false },
];

// ─── Stylists ────────────────────────────────────────
export const mockStylists: MockStylist[] = [
  {
    id: "st1", name: "Aisha", phone: "60111111111", isActive: true,
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
    id: "st2", name: "Wei Lin", phone: "60122222222", isActive: true,
    availability: [
      { day: 1, startTime: "11:00", endTime: "20:00" },
      { day: 2, startTime: "11:00", endTime: "20:00" },
      { day: 3, startTime: "11:00", endTime: "20:00" },
      { day: 5, startTime: "11:00", endTime: "20:00" },
      { day: 6, startTime: "10:00", endTime: "18:00" },
    ],
  },
  {
    id: "st3", name: "Priya", phone: "60133333333", isActive: true,
    availability: [
      { day: 1, startTime: "10:00", endTime: "18:00" },
      { day: 2, startTime: "10:00", endTime: "18:00" },
      { day: 4, startTime: "10:00", endTime: "18:00" },
      { day: 5, startTime: "10:00", endTime: "18:00" },
      { day: 6, startTime: "10:00", endTime: "16:00" },
    ],
  },
  {
    id: "st4", name: "Daniel", phone: "60144444444", isActive: true,
    availability: [
      { day: 2, startTime: "12:00", endTime: "20:00" },
      { day: 3, startTime: "12:00", endTime: "20:00" },
      { day: 4, startTime: "12:00", endTime: "20:00" },
      { day: 5, startTime: "12:00", endTime: "20:00" },
      { day: 6, startTime: "10:00", endTime: "18:00" },
    ],
  },
];

// ─── Customers ───────────────────────────────────────
export const mockCustomers: MockCustomer[] = [
  { id: "c1", name: "Sarah Tan", phone: "60171234567", email: "sarah@email.com", noShowCount: 0, totalBookings: 8, isBlacklisted: false, joinedDate: "2025-09-15" },
  { id: "c2", name: "Aminah Binti Hassan", phone: "60182345678", email: "aminah.h@email.com", noShowCount: 1, totalBookings: 12, isBlacklisted: false, joinedDate: "2025-07-20" },
  { id: "c3", name: "Jessica Wong", phone: "60193456789", noShowCount: 3, totalBookings: 5, isBlacklisted: true, joinedDate: "2025-11-01" },
  { id: "c4", name: "Nurul Izzah", phone: "60174567890", email: "nurul.i@email.com", noShowCount: 0, totalBookings: 15, isBlacklisted: false, joinedDate: "2025-05-10" },
  { id: "c5", name: "Rachel Lim", phone: "60185678901", noShowCount: 2, totalBookings: 6, isBlacklisted: false, joinedDate: "2025-10-22" },
  { id: "c6", name: "Siti Aishah", phone: "60196789012", email: "siti.a@email.com", noShowCount: 0, totalBookings: 3, isBlacklisted: false, joinedDate: "2026-01-05" },
  { id: "c7", name: "Mei Ling Chen", phone: "60177890123", noShowCount: 0, totalBookings: 20, isBlacklisted: false, joinedDate: "2025-03-18" },
  { id: "c8", name: "Farah Abdullah", phone: "60188901234", email: "farah.ab@email.com", noShowCount: 4, totalBookings: 7, isBlacklisted: true, notes: "Repeat no-show. Contacted twice.", joinedDate: "2025-08-30" },
  { id: "c9", name: "Amanda Lee", phone: "60199012345", email: "amanda.l@email.com", noShowCount: 0, totalBookings: 2, isBlacklisted: false, joinedDate: "2026-02-01" },
  { id: "c10", name: "Kavitha Ramasamy", phone: "60170123456", noShowCount: 1, totalBookings: 9, isBlacklisted: false, joinedDate: "2025-06-12" },
  { id: "c11", name: "Zara Othman", phone: "60181234567", email: "zara.o@email.com", noShowCount: 0, totalBookings: 4, isBlacklisted: false, joinedDate: "2025-12-08" },
  { id: "c12", name: "Michelle Ng", phone: "60192345678", noShowCount: 0, totalBookings: 11, isBlacklisted: false, joinedDate: "2025-04-25" },
  { id: "c13", name: "Putri Zainal", phone: "60173456789", email: "putri.z@email.com", noShowCount: 2, totalBookings: 3, isBlacklisted: false, joinedDate: "2025-12-20" },
  { id: "c14", name: "Lily Chong", phone: "60184567890", noShowCount: 0, totalBookings: 1, isBlacklisted: false, joinedDate: "2026-02-14" },
  { id: "c15", name: "Halimah Yusof", phone: "60195678901", email: "halimah.y@email.com", noShowCount: 0, totalBookings: 6, isBlacklisted: false, joinedDate: "2025-10-01" },
];

// ─── Bookings ────────────────────────────────────────
export const mockBookings: MockBooking[] = [
  // Today (2026-02-20)
  { id: "b1", customerId: "c1", stylistId: "st1", serviceId: "svc1", date: "2026-02-20", startTime: "10:00", endTime: "10:45", status: "confirmed", createdBy: "customer" },
  { id: "b2", customerId: "c2", stylistId: "st2", serviceId: "svc2", date: "2026-02-20", startTime: "11:00", endTime: "13:00", status: "confirmed", createdBy: "customer" },
  { id: "b3", customerId: "c4", stylistId: "st1", serviceId: "svc3", date: "2026-02-20", startTime: "11:00", endTime: "12:00", status: "customer_confirmed", createdBy: "customer" },
  { id: "b4", customerId: "c7", stylistId: "st3", serviceId: "svc1", date: "2026-02-20", startTime: "14:00", endTime: "14:45", status: "confirmed", createdBy: "admin" },
  { id: "b5", customerId: "c10", stylistId: "st4", serviceId: "svc4", date: "2026-02-20", startTime: "14:30", endTime: "15:00", status: "pending_approval", createdBy: "customer" },
  { id: "b6", customerId: "c6", stylistId: "st2", serviceId: "svc1", date: "2026-02-20", startTime: "15:00", endTime: "15:45", status: "pending_approval", createdBy: "customer" },
  { id: "b7", customerId: "c12", stylistId: "st1", serviceId: "svc5", date: "2026-02-20", startTime: "15:00", endTime: "18:00", status: "confirmed", createdBy: "customer" },
  // Yesterday
  { id: "b8", customerId: "c5", stylistId: "st2", serviceId: "svc1", date: "2026-02-19", startTime: "10:00", endTime: "10:45", status: "completed", createdBy: "customer" },
  { id: "b9", customerId: "c3", stylistId: "st3", serviceId: "svc3", date: "2026-02-19", startTime: "11:00", endTime: "12:00", status: "no_show", createdBy: "customer" },
  { id: "b10", customerId: "c1", stylistId: "st1", serviceId: "svc2", date: "2026-02-19", startTime: "13:00", endTime: "15:00", status: "completed", createdBy: "customer" },
  { id: "b11", customerId: "c9", stylistId: "st4", serviceId: "svc4", date: "2026-02-19", startTime: "14:00", endTime: "14:30", status: "completed", createdBy: "admin" },
  // Tomorrow
  { id: "b12", customerId: "c11", stylistId: "st1", serviceId: "svc1", date: "2026-02-21", startTime: "10:00", endTime: "10:45", status: "confirmed", createdBy: "customer" },
  { id: "b13", customerId: "c15", stylistId: "st2", serviceId: "svc3", date: "2026-02-21", startTime: "11:00", endTime: "12:00", status: "confirmed", createdBy: "customer" },
  { id: "b14", customerId: "c4", stylistId: "st3", serviceId: "svc5", date: "2026-02-21", startTime: "13:00", endTime: "16:00", status: "pending_approval", createdBy: "customer" },
  // This week
  { id: "b15", customerId: "c7", stylistId: "st1", serviceId: "svc2", date: "2026-02-22", startTime: "10:00", endTime: "12:00", status: "confirmed", createdBy: "customer" },
  { id: "b16", customerId: "c2", stylistId: "st4", serviceId: "svc1", date: "2026-02-22", startTime: "14:00", endTime: "14:45", status: "confirmed", createdBy: "customer" },
  { id: "b17", customerId: "c13", stylistId: "st2", serviceId: "svc4", date: "2026-02-23", startTime: "10:00", endTime: "10:30", status: "confirmed", createdBy: "customer" },
  // Past week
  { id: "b18", customerId: "c10", stylistId: "st3", serviceId: "svc1", date: "2026-02-18", startTime: "10:00", endTime: "10:45", status: "completed", createdBy: "customer" },
  { id: "b19", customerId: "c8", stylistId: "st1", serviceId: "svc3", date: "2026-02-18", startTime: "14:00", endTime: "15:00", status: "no_show", createdBy: "customer" },
  { id: "b20", customerId: "c12", stylistId: "st2", serviceId: "svc2", date: "2026-02-17", startTime: "11:00", endTime: "13:00", status: "completed", createdBy: "admin" },
  { id: "b21", customerId: "c4", stylistId: "st4", serviceId: "svc1", date: "2026-02-17", startTime: "15:00", endTime: "15:45", status: "completed", createdBy: "customer" },
  { id: "b22", customerId: "c6", stylistId: "st1", serviceId: "svc4", date: "2026-02-16", startTime: "10:00", endTime: "10:30", status: "completed", createdBy: "customer" },
  { id: "b23", customerId: "c5", stylistId: "st3", serviceId: "svc5", date: "2026-02-16", startTime: "13:00", endTime: "16:00", status: "cancelled_customer", createdBy: "customer" },
  { id: "b24", customerId: "c1", stylistId: "st2", serviceId: "svc1", date: "2026-02-15", startTime: "11:00", endTime: "11:45", status: "completed", createdBy: "customer" },
  { id: "b25", customerId: "c14", stylistId: "st1", serviceId: "svc3", date: "2026-02-15", startTime: "14:00", endTime: "15:00", status: "completed", createdBy: "customer" },
  { id: "b26", customerId: "c7", stylistId: "st4", serviceId: "svc1", date: "2026-02-14", startTime: "10:00", endTime: "10:45", status: "completed", createdBy: "admin" },
  { id: "b27", customerId: "c2", stylistId: "st2", serviceId: "svc2", date: "2026-02-14", startTime: "13:00", endTime: "15:00", status: "cancelled_admin", createdBy: "customer" },
  { id: "b28", customerId: "c11", stylistId: "st3", serviceId: "svc4", date: "2026-02-13", startTime: "15:00", endTime: "15:30", status: "completed", createdBy: "customer" },
  { id: "b29", customerId: "c9", stylistId: "st1", serviceId: "svc1", date: "2026-02-13", startTime: "10:00", endTime: "10:45", status: "completed", createdBy: "customer" },
  { id: "b30", customerId: "c15", stylistId: "st4", serviceId: "svc3", date: "2026-02-12", startTime: "11:00", endTime: "12:00", status: "completed", createdBy: "customer" },
];

// ─── Activity Feed ───────────────────────────────────
export const mockActivities: MockActivity[] = [
  { id: "a1", type: "booking", message: "Sarah Tan requested a Haircut for today at 10:00 AM", timestamp: "2026-02-20T08:30:00" },
  { id: "a2", type: "booking", message: "Aminah Hassan requested Hair Coloring for today", timestamp: "2026-02-20T08:15:00" },
  { id: "a3", type: "new_customer", message: "Lily Chong registered as a new customer", timestamp: "2026-02-20T07:45:00" },
  { id: "a4", type: "booking", message: "Kavitha Ramasamy requested Blow Dry for today", timestamp: "2026-02-20T07:20:00" },
  { id: "a5", type: "completed", message: "Rachel Lim's Haircut marked as completed", timestamp: "2026-02-19T11:00:00" },
  { id: "a6", type: "no_show", message: "Jessica Wong did not show up for Hair Treatment", timestamp: "2026-02-19T12:15:00" },
  { id: "a7", type: "completed", message: "Sarah Tan's Hair Coloring completed", timestamp: "2026-02-19T15:10:00" },
  { id: "a8", type: "cancellation", message: "Rachel Lim cancelled Rebonding appointment", timestamp: "2026-02-16T09:30:00" },
  { id: "a9", type: "completed", message: "Siti Aishah's Blow Dry completed", timestamp: "2026-02-16T10:35:00" },
  { id: "a10", type: "booking", message: "Zara Othman requested Haircut for Feb 21", timestamp: "2026-02-15T16:00:00" },
];

// ─── Trend Data (30 days) ────────────────────────────
export const bookingTrendData: TrendDataPoint[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(2026, 0, 22 + i); // Jan 22 to Feb 20
  const dayOfWeek = date.getDay();
  const base = dayOfWeek === 0 ? 0 : dayOfWeek === 6 ? 5 : 7;
  const variance = Math.floor(Math.random() * 5) - 2;
  return {
    date: date.toISOString().split("T")[0],
    value: Math.max(0, base + variance),
  };
});

export const revenueTrendData: TrendDataPoint[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(2026, 0, 22 + i);
  const dayOfWeek = date.getDay();
  const base = dayOfWeek === 0 ? 0 : dayOfWeek === 6 ? 250 : 400;
  const variance = Math.floor(Math.random() * 200) - 80;
  return {
    date: date.toISOString().split("T")[0],
    value: Math.max(0, base + variance),
  };
});

// ─── Service Popularity ──────────────────────────────
export const servicePopularityData = [
  { name: "Haircut", bookings: 42 },
  { name: "Hair Coloring", bookings: 28 },
  { name: "Hair Treatment", bookings: 22 },
  { name: "Rebonding", bookings: 15 },
  { name: "Blow Dry", bookings: 12 },
];

// ─── Peak Hours Heatmap ──────────────────────────────
export const peakHoursData: PeakHourCell[] = (() => {
  const data: PeakHourCell[] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 9; hour <= 20; hour++) {
      let count = 0;
      if (day === 0) { count = 0; } // Sunday closed
      else if (hour >= 11 && hour <= 14) { count = Math.floor(Math.random() * 4) + 2; } // lunch rush
      else if (hour >= 16 && hour <= 18) { count = Math.floor(Math.random() * 3) + 2; } // after-work rush
      else if (day === 6) { count = Math.floor(Math.random() * 5) + 1; } // Saturday busy
      else { count = Math.floor(Math.random() * 3); }
      data.push({ day, hour, count });
    }
  }
  return data;
})();

// ─── Stylist Performance ─────────────────────────────
export const stylistPerformanceData = [
  { name: "Aisha", bookings: 38, completed: 35, noShows: 1 },
  { name: "Wei Lin", bookings: 30, completed: 27, noShows: 2 },
  { name: "Priya", bookings: 25, completed: 23, noShows: 1 },
  { name: "Daniel", bookings: 22, completed: 20, noShows: 0 },
];

// ─── Booking Funnel ──────────────────────────────────
export const bookingFunnelData = [
  { stage: "Requested", count: 145 },
  { stage: "Confirmed", count: 128 },
  { stage: "Reminded", count: 115 },
  { stage: "Completed", count: 108 },
];

// ─── Customer Retention ──────────────────────────────
export const customerRetentionData = [
  { name: "Returning", value: 68 },
  { name: "New", value: 32 },
];

// ─── Helper to look up names ─────────────────────────
export function getCustomerName(customerId: string): string {
  return mockCustomers.find((c) => c.id === customerId)?.name ?? "Unknown";
}

export function getServiceName(serviceId: string): string {
  return mockServices.find((s) => s.id === serviceId)?.name ?? "Unknown";
}

export function getStylistName(stylistId: string): string {
  return mockStylists.find((s) => s.id === stylistId)?.name ?? "Unknown";
}

export function getServicePrice(serviceId: string): number {
  return mockServices.find((s) => s.id === serviceId)?.priceRM ?? 0;
}
