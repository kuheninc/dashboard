"use client";

import BookingStatusBadge from "@/components/dashboard/BookingStatusBadge";
import type { BookingStatus } from "@/components/dashboard/BookingStatusBadge";
import { enrichBookings } from "@/lib/dashboard-helpers";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { User, Phone, Mail, Calendar, AlertTriangle } from "lucide-react";

interface CustomerProfileProps {
  customerId: Id<"customers"> | null;
  customers: Doc<"customers">[];
  services: Doc<"services">[];
  stylists: Doc<"stylists">[];
}

export default function CustomerProfile({ customerId, customers, services, stylists }: CustomerProfileProps) {
  const rawBookings = useQuery(
    api.bookings.queries.getByCustomer,
    customerId ? { customerId } : "skip"
  );

  if (!customerId) {
    return (
      <div className="bg-card border border-border rounded-[14px]">
        <div className="py-12 text-center">
          <User className="w-10 h-10 text-[#9c9184] opacity-30 mx-auto mb-2" />
          <p className="text-[13px] text-muted-foreground">Select a customer to view details</p>
        </div>
      </div>
    );
  }

  const customer = customers.find((c) => c._id === customerId);
  if (!customer) return null;

  const bookings = rawBookings
    ? enrichBookings(rawBookings, customers, services, stylists).sort(
        (a, b) => b.date.localeCompare(a.date)
      )
    : [];

  const showRate =
    customer.totalBookings > 0
      ? Math.round(((customer.totalBookings - customer.noShowCount) / customer.totalBookings) * 100)
      : 0;

  return (
    <div className="bg-card border border-border rounded-[14px]">
      {/* Header */}
      <div className="px-[22px] py-[18px] border-b border-border">
        <div className="flex items-start justify-between">
          <span className="font-display text-[17px] text-foreground">{customer.name}</span>
          {customer.isBlacklisted ? (
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[rgba(196,90,90,0.08)] text-[#c45a5a]">
              Blacklisted
            </span>
          ) : (
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[rgba(90,154,110,0.08)] text-[#5a9a6e]">
              Active
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-[22px] py-[18px] space-y-5">
        {/* Contact info */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <Phone className="w-3.5 h-3.5 text-[#9c9184]" />
            <span className="font-mono text-[13px]">+{customer.phone}</span>
          </div>
          {customer.email && (
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <Mail className="w-3.5 h-3.5 text-[#9c9184]" />
              <span className="text-[13px]">{customer.email}</span>
            </div>
          )}
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <Calendar className="w-3.5 h-3.5 text-[#9c9184]" />
            <span className="text-[13px]">
              Member since{" "}
              {new Date(customer._creationTime).toLocaleDateString("en-MY", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-2.5 rounded-[10px] bg-[rgba(166,139,107,0.05)] text-center">
            <p className="font-display text-[18px] text-foreground">{customer.totalBookings}</p>
            <p className="text-[10px] text-[#9c9184] mt-0.5">Bookings</p>
          </div>
          <div className="p-2.5 rounded-[10px] bg-[rgba(166,139,107,0.05)] text-center">
            <p className={`font-display text-[18px] ${customer.noShowCount > 0 ? "text-[#c45a5a]" : "text-foreground"}`}>
              {customer.noShowCount}
            </p>
            <p className="text-[10px] text-[#9c9184] mt-0.5">No-Shows</p>
          </div>
          <div className="p-2.5 rounded-[10px] bg-[rgba(166,139,107,0.05)] text-center">
            <p className="font-display text-[18px] text-foreground">{showRate}%</p>
            <p className="text-[10px] text-[#9c9184] mt-0.5">Show Rate</p>
          </div>
        </div>

        {/* No-show warning */}
        {customer.noShowCount >= 2 && (
          <div className="flex items-start gap-2.5 p-3 bg-[rgba(196,152,62,0.08)] border border-[rgba(196,152,62,0.15)] rounded-[10px]">
            <AlertTriangle className="w-4 h-4 text-[#c4983e] mt-0.5 shrink-0" />
            <div>
              <p className="text-[13px] font-medium text-[#c4983e]">
                {customer.noShowCount} no-shows recorded
              </p>
              {customer.notes && (
                <p className="text-[12px] text-[#c4983e] opacity-80 mt-0.5">{customer.notes}</p>
              )}
            </div>
          </div>
        )}

        {/* Booking history */}
        <div>
          <p className="text-[11px] tracking-[1px] uppercase text-[#9c9184] font-medium mb-3">
            Recent Bookings
          </p>
          <div className="space-y-2">
            {rawBookings === undefined ? (
              <p className="text-[13px] text-muted-foreground text-center py-4">Loading...</p>
            ) : bookings.length === 0 ? (
              <p className="text-[13px] text-muted-foreground text-center py-4">No bookings yet</p>
            ) : (
              bookings.slice(0, 6).map((b) => (
                <div
                  key={b._id}
                  className="flex items-center justify-between py-2.5 px-3 rounded-[10px] bg-[rgba(166,139,107,0.05)]"
                >
                  <div>
                    <p className="text-[13px] font-medium text-foreground">{b.serviceName}</p>
                    <p className="text-[11px] text-[#9c9184] mt-0.5">
                      {b.date} &middot; {b.startTime} &middot; {b.stylistName}
                    </p>
                  </div>
                  <BookingStatusBadge status={b.status as BookingStatus} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
