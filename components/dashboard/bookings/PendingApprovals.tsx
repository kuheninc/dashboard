"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock } from "lucide-react";
import { useDashboard } from "@/lib/dashboard-context";
import { enrichBookings } from "@/lib/dashboard-helpers";

export default function PendingApprovals() {
  const { salonId, customers, services, stylists } = useDashboard();
  const bookings = useQuery(api.bookings.queries.getPendingApproval, { salonId });

  // Still loading
  if (bookings === undefined) return null;

  const enriched = enrichBookings(bookings, customers, services, stylists);

  if (enriched.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-foreground">Pending Approval</h3>
        <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[11px]">
          {enriched.length}
        </Badge>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {enriched.map((booking) => (
          <Card key={booking._id} className="shadow-sm border-amber-200/60 bg-amber-50/30 min-w-[260px] flex-shrink-0">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {booking.customerName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {booking.serviceName}
                  </p>
                </div>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                <span>{booking.date}</span>
                <span>&middot;</span>
                <span>{booking.startTime} - {booking.endTime}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Stylist: {booking.stylistName}
              </p>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1 h-8 text-xs bg-emerald-600 hover:bg-emerald-700">
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Approve
                </Button>
                <Button size="sm" variant="outline" className="flex-1 h-8 text-xs text-red-600 border-red-200 hover:bg-red-50">
                  <X className="w-3.5 h-3.5 mr-1" />
                  Decline
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
