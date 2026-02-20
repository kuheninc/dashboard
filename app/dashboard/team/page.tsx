"use client";

import StatCard from "@/components/dashboard/StatCard";
import StylistCard from "@/components/dashboard/team/StylistCard";
import AvailabilityGrid from "@/components/dashboard/team/AvailabilityGrid";
import { mockStylists } from "@/lib/mock-data";
import { UserCog, CheckCircle2, Calendar } from "lucide-react";

export default function TeamPage() {
  const activeStylists = mockStylists.filter((s) => s.isActive);

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-xl font-bold text-foreground">Team</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          View stylist profiles, performance, and availability.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Active Stylists"
          value={String(activeStylists.length)}
          icon={UserCog}
          iconColor="text-primary"
        />
        <StatCard
          label="Avg. Completion Rate"
          value="91%"
          trend={{ value: "+2%", positive: true }}
          icon={CheckCircle2}
          iconColor="text-emerald-600"
        />
        <StatCard
          label="Total Bookings (Month)"
          value="115"
          trend={{ value: "+8%", positive: true }}
          icon={Calendar}
          iconColor="text-violet-600"
        />
      </div>

      {/* Stylist cards */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Stylists</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockStylists.map((stylist) => (
            <StylistCard key={stylist.id} stylist={stylist} />
          ))}
        </div>
      </div>

      {/* Availability grid */}
      <AvailabilityGrid />
    </div>
  );
}
