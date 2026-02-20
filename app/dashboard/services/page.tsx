"use client";

import { useMemo } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import StatCard from "@/components/dashboard/StatCard";
import ServiceCard from "@/components/dashboard/services/ServiceCard";
import { Scissors, DollarSign, Clock } from "lucide-react";

export default function ServicesPage() {
  const { services } = useDashboard();

  const { activeServices, inactiveServices, avgPrice, avgDuration } = useMemo(() => {
    const active = services.filter((s) => s.isActive);
    const inactive = services.filter((s) => !s.isActive);
    const price = active.length > 0
      ? Math.round(active.reduce((sum, s) => sum + s.priceRM, 0) / active.length)
      : 0;
    const duration = active.length > 0
      ? Math.round(active.reduce((sum, s) => sum + s.durationMinutes, 0) / active.length)
      : 0;
    return { activeServices: active, inactiveServices: inactive, avgPrice: price, avgDuration: duration };
  }, [services]);

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-xl font-bold text-foreground">Services</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          View and manage salon service offerings.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Active Services"
          value={String(activeServices.length)}
          icon={Scissors}
          iconColor="text-primary"
        />
        <StatCard
          label="Average Price"
          value={`RM ${avgPrice}`}
          icon={DollarSign}
          iconColor="text-emerald-600"
        />
        <StatCard
          label="Average Duration"
          value={`${avgDuration} min`}
          icon={Clock}
          iconColor="text-violet-600"
        />
      </div>

      {/* Active service cards */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Active Services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeServices.map((service) => (
            <ServiceCard key={service._id} service={service} />
          ))}
        </div>
      </div>

      {/* Inactive services */}
      {inactiveServices.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Inactive Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {inactiveServices.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
