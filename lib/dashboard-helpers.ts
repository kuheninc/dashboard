import type { Doc } from "../convex/_generated/dataModel";

// Enriched booking with resolved names
export interface EnrichedBooking {
  _id: string;
  customerId: string;
  stylistId: string;
  serviceId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  createdBy: "customer" | "admin";
  customerName: string;
  serviceName: string;
  stylistName: string;
  servicePrice: number;
}

export function enrichBookings(
  bookings: Doc<"bookings">[],
  customers: Doc<"customers">[],
  services: Doc<"services">[],
  stylists: Doc<"stylists">[]
): EnrichedBooking[] {
  const customerMap = new Map(customers.map((c) => [c._id, c]));
  const serviceMap = new Map(services.map((s) => [s._id, s]));
  const stylistMap = new Map(stylists.map((s) => [s._id, s]));

  return bookings.map((b) => ({
    _id: b._id,
    customerId: b.customerId,
    stylistId: b.stylistId,
    serviceId: b.serviceId,
    date: b.date,
    startTime: b.startTime,
    endTime: b.endTime,
    status: b.status,
    createdBy: b.createdBy,
    customerName: customerMap.get(b.customerId)?.name ?? "Unknown",
    serviceName: serviceMap.get(b.serviceId)?.name ?? "Unknown",
    stylistName: stylistMap.get(b.stylistId)?.name ?? "Unknown",
    servicePrice: serviceMap.get(b.serviceId)?.priceRM ?? 0,
  }));
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-MY", { month: "short", day: "numeric" });
}

export function getTodayDateStr(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kuala_Lumpur" });
}

export function getDateRangeStr(daysBack: number): { startDate: string; endDate: string } {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - daysBack);
  return {
    startDate: start.toISOString().split("T")[0],
    endDate: now.toISOString().split("T")[0],
  };
}
