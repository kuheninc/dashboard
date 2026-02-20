"use client";

import { useState, useMemo } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import type { Id } from "@/convex/_generated/dataModel";
import StatCard from "@/components/dashboard/StatCard";
import CustomerTable from "@/components/dashboard/customers/CustomerTable";
import CustomerProfile from "@/components/dashboard/customers/CustomerProfile";
import NoShowAlerts from "@/components/dashboard/customers/NoShowAlerts";
import { Users, UserCheck, UserX } from "lucide-react";

export default function CustomersPage() {
  const { customers, services, stylists } = useDashboard();
  const [selectedCustomerId, setSelectedCustomerId] = useState<Id<"customers"> | null>(null);

  const stats = useMemo(() => {
    const total = customers.length;
    const blacklisted = customers.filter((c) => c.isBlacklisted).length;
    const active = customers.filter((c) => !c.isBlacklisted && c.totalBookings > 0).length;
    return { total, active, blacklisted };
  }, [customers]);

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-xl font-bold text-foreground">Customers</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          View customer profiles, booking history, and no-show tracking.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Customers" value={String(stats.total)} icon={Users} iconColor="text-primary" />
        <StatCard
          label="Active"
          value={String(stats.active)}
          icon={UserCheck}
          iconColor="text-emerald-600"
        />
        <StatCard label="Blacklisted" value={String(stats.blacklisted)} icon={UserX} iconColor="text-red-500" />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <CustomerTable
            customers={customers}
            onSelectCustomer={setSelectedCustomerId}
            selectedCustomerId={selectedCustomerId}
          />
        </div>

        <div className="space-y-4">
          <CustomerProfile
            customerId={selectedCustomerId}
            customers={customers}
            services={services}
            stylists={stylists}
          />
          <NoShowAlerts customers={customers} />
        </div>
      </div>
    </div>
  );
}
