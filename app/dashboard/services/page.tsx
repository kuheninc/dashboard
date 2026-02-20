"use client";

import StatCard from "@/components/dashboard/StatCard";
import ServiceCard from "@/components/dashboard/services/ServiceCard";
import { mockServices } from "@/lib/mock-data";
import { Scissors, DollarSign, Clock } from "lucide-react";

export default function ServicesPage() {
  const activeServices = mockServices.filter((s) => s.isActive);
  const avgPrice = Math.round(
    activeServices.reduce((sum, s) => sum + s.priceRM, 0) / activeServices.length
  );
  const avgDuration = Math.round(
    activeServices.reduce((sum, s) => sum + s.durationMinutes, 0) / activeServices.length
  );

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

      {/* Service cards */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Active Services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>

      {/* Inactive services */}
      {mockServices.some((s) => !s.isActive) && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Inactive Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockServices
              .filter((s) => !s.isActive)
              .map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
