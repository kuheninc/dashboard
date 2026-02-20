"use client";

import { useState } from "react";
import StatCard from "@/components/dashboard/StatCard";
import CustomerTable from "@/components/dashboard/customers/CustomerTable";
import CustomerProfile from "@/components/dashboard/customers/CustomerProfile";
import NoShowAlerts from "@/components/dashboard/customers/NoShowAlerts";
import { Users, UserCheck, UserX } from "lucide-react";

export default function CustomersPage() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

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
        <StatCard label="Total Customers" value="15" icon={Users} iconColor="text-primary" />
        <StatCard
          label="Active (30 days)"
          value="9"
          trend={{ value: "+3", positive: true }}
          icon={UserCheck}
          iconColor="text-emerald-600"
        />
        <StatCard label="Blacklisted" value="2" icon={UserX} iconColor="text-red-500" />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Customer table */}
        <div className="lg:col-span-2">
          <CustomerTable
            onSelectCustomer={setSelectedCustomerId}
            selectedCustomerId={selectedCustomerId}
          />
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          <CustomerProfile customerId={selectedCustomerId} />
          <NoShowAlerts />
        </div>
      </div>
    </div>
  );
}
