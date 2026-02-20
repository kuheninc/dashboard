"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
      <Card className="shadow-sm border-border/60">
        <CardContent className="py-12 text-center">
          <User className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Select a customer to view details</p>
        </CardContent>
      </Card>
    );
  }

  const customer = customers.find((c) => c._id === customerId);
  if (!customer) return null;

  const bookings = rawBookings
    ? enrichBookings(rawBookings, customers, services, stylists).sort(
        (a, b) => b.date.localeCompare(a.date)
      )
    : [];

  return (
    <Card className="shadow-sm border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-semibold">{customer.name}</CardTitle>
          {customer.isBlacklisted ? (
            <Badge variant="outline" className="text-[11px] bg-red-100 text-red-700 border-red-200">
              Blacklisted
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[11px] bg-emerald-100 text-emerald-700 border-emerald-200">
              Active
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contact info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-3.5 h-3.5" />
            <span className="font-mono text-xs">+{customer.phone}</span>
          </div>
          {customer.email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-3.5 h-3.5" />
              <span>{customer.email}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>
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
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 rounded-lg bg-muted/30 text-center">
            <p className="text-lg font-bold text-foreground">{customer.totalBookings}</p>
            <p className="text-[10px] text-muted-foreground">Bookings</p>
          </div>
          <div className="p-2.5 rounded-lg bg-muted/30 text-center">
            <p className={`text-lg font-bold ${customer.noShowCount > 0 ? "text-red-600" : "text-foreground"}`}>
              {customer.noShowCount}
            </p>
            <p className="text-[10px] text-muted-foreground">No-Shows</p>
          </div>
          <div className="p-2.5 rounded-lg bg-muted/30 text-center">
            <p className="text-lg font-bold text-foreground">
              {customer.totalBookings > 0
                ? Math.round(((customer.totalBookings - customer.noShowCount) / customer.totalBookings) * 100)
                : 0}%
            </p>
            <p className="text-[10px] text-muted-foreground">Show Rate</p>
          </div>
        </div>

        {/* No-show warning */}
        {customer.noShowCount >= 2 && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-amber-700">
                {customer.noShowCount} no-shows recorded
              </p>
              {customer.notes && (
                <p className="text-xs text-amber-600 mt-0.5">{customer.notes}</p>
              )}
            </div>
          </div>
        )}

        {/* Booking history */}
        <div>
          <p className="text-xs font-semibold text-foreground mb-2">Recent Bookings</p>
          <div className="space-y-1.5">
            {rawBookings === undefined ? (
              <p className="text-xs text-muted-foreground text-center py-4">Loading...</p>
            ) : bookings.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No bookings yet</p>
            ) : (
              bookings.slice(0, 6).map((b) => (
                <div key={b._id} className="flex items-center justify-between py-1.5 px-2 rounded bg-muted/20">
                  <div>
                    <p className="text-xs font-medium">{b.serviceName}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {b.date} &middot; {b.startTime} &middot; {b.stylistName}
                    </p>
                  </div>
                  <BookingStatusBadge status={b.status as BookingStatus} />
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
