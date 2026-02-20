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
    <div className="space-y-7 max-w-[1400px]">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="cadence-animate cadence-delay-1">
          <StatCard label="Active Services" value={String(activeServices.length)} icon={Scissors} iconColor="text-primary" />
        </div>
        <div className="cadence-animate cadence-delay-2">
          <StatCard label="Average Price" value={`RM ${avgPrice}`} icon={DollarSign} iconColor="text-[#5a9a6e]" />
        </div>
        <div className="cadence-animate cadence-delay-3">
          <StatCard label="Average Duration" value={`${avgDuration} min`} icon={Clock} iconColor="text-[#8a7055]" />
        </div>
      </div>

      {/* Active services */}
      <div className="cadence-animate cadence-delay-4">
        <h2 className="font-display text-[17px] text-foreground mb-4">Active Services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeServices.map((service) => (
            <ServiceCard key={service._id} service={service} />
          ))}
        </div>
      </div>

      {/* Inactive services */}
      {inactiveServices.length > 0 && (
        <div className="cadence-animate cadence-delay-5">
          <h2 className="font-display text-[17px] text-[#9c9184] mb-4">Inactive Services</h2>
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
