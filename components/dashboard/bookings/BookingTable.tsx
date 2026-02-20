"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import BookingStatusBadge from "@/components/dashboard/BookingStatusBadge";
import {
  mockBookings,
  getCustomerName,
  getServiceName,
  getStylistName,
  getServicePrice,
  type BookingStatus,
} from "@/lib/mock-data";
import { Search, Filter } from "lucide-react";

const statusOptions: { label: string; value: BookingStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending_approval" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Completed", value: "completed" },
  { label: "No Show", value: "no_show" },
  { label: "Cancelled", value: "cancelled_customer" },
];

export default function BookingTable() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");

  const filtered = mockBookings
    .filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (search) {
        const customerName = getCustomerName(b.customerId).toLowerCase();
        const serviceName = getServiceName(b.serviceId).toLowerCase();
        return customerName.includes(search.toLowerCase()) || serviceName.includes(search.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime));

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer or service..."
            className="bg-transparent text-sm outline-none placeholder:text-muted-foreground w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <div className="flex gap-1.5">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  statusFilter === opt.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="text-xs font-semibold">Date</TableHead>
              <TableHead className="text-xs font-semibold">Time</TableHead>
              <TableHead className="text-xs font-semibold">Customer</TableHead>
              <TableHead className="text-xs font-semibold">Service</TableHead>
              <TableHead className="text-xs font-semibold">Stylist</TableHead>
              <TableHead className="text-xs font-semibold">Price</TableHead>
              <TableHead className="text-xs font-semibold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((booking) => (
              <TableRow key={booking.id} className="hover:bg-muted/20">
                <TableCell className="text-sm">{booking.date}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {booking.startTime} - {booking.endTime}
                </TableCell>
                <TableCell className="text-sm font-medium">
                  {getCustomerName(booking.customerId)}
                </TableCell>
                <TableCell className="text-sm">{getServiceName(booking.serviceId)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {getStylistName(booking.stylistId)}
                </TableCell>
                <TableCell className="text-sm">RM {getServicePrice(booking.serviceId)}</TableCell>
                <TableCell>
                  <BookingStatusBadge status={booking.status} />
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-sm text-muted-foreground">
                  No bookings found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
