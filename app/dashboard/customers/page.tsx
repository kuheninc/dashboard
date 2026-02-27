"use client";

import { useState, useMemo, useCallback } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import StatCard from "@/components/dashboard/StatCard";
import CustomerTable from "@/components/dashboard/customers/CustomerTable";
import CustomerProfile from "@/components/dashboard/customers/CustomerProfile";
import NoShowAlerts from "@/components/dashboard/customers/NoShowAlerts";
import EmptyState from "@/components/dashboard/EmptyState";
import { Users, UserCheck, UserX, Download, Search } from "lucide-react";

type Segment = "all" | "new" | "regular" | "vip" | "at_risk" | "blacklisted";

const SEGMENTS: { label: string; value: Segment }[] = [
  { label: "All", value: "all" },
  { label: "New", value: "new" },
  { label: "Regular", value: "regular" },
  { label: "VIP", value: "vip" },
  { label: "At-Risk", value: "at_risk" },
  { label: "Blacklisted", value: "blacklisted" },
];

function getSegment(customer: Doc<"customers">): Segment {
  if (customer.isBlacklisted) return "blacklisted";
  if (customer.totalBookings >= 6) return "vip";
  if (customer.totalBookings >= 2) return "regular";
  return "new";
}

function getSegmentBadge(segment: Segment) {
  switch (segment) {
    case "vip":
      return { label: "VIP", className: "bg-[rgba(196,152,62,0.1)] text-[#c4983e]" };
    case "regular":
      return { label: "Regular", className: "bg-[rgba(90,154,110,0.08)] text-[#5a9a6e]" };
    case "new":
      return { label: "New", className: "bg-[rgba(80,140,180,0.1)] text-[#508cb4]" };
    case "at_risk":
      return { label: "At Risk", className: "bg-[rgba(196,90,90,0.08)] text-[#c45a5a]" };
    case "blacklisted":
      return { label: "Blacklisted", className: "bg-[rgba(196,90,90,0.08)] text-[#c45a5a]" };
    default:
      return { label: "", className: "" };
  }
}

export default function CustomersPage() {
  const { customers, services, stylists } = useDashboard();
  const [selectedCustomerId, setSelectedCustomerId] = useState<Id<"customers"> | null>(null);
  const [segment, setSegment] = useState<Segment>("all");
  const [search, setSearch] = useState("");

  const stats = useMemo(() => {
    const total = customers.length;
    const blacklisted = customers.filter((c) => c.isBlacklisted).length;
    const active = customers.filter((c) => !c.isBlacklisted && c.totalBookings > 0).length;
    return { total, active, blacklisted };
  }, [customers]);

  // Compute at-risk: no booking in 30+ days — use _creationTime as proxy
  // (in production you'd use last booking date from a query, but we approximate here)
  const thirtyDaysAgo = useMemo(() => Date.now() - 30 * 24 * 60 * 60 * 1000, []);

  const filteredCustomers = useMemo(() => {
    let result = customers;

    // Segment filter
    if (segment !== "all") {
      if (segment === "at_risk") {
        // At-risk: had bookings before but last activity was 30+ days ago
        result = result.filter(
          (c) => !c.isBlacklisted && c.totalBookings > 0 && c._creationTime < thirtyDaysAgo
        );
      } else {
        result = result.filter((c) => getSegment(c) === segment);
      }
    }

    // Search filter
    if (search) {
      const term = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.phone.includes(term) ||
          (c.email && c.email.toLowerCase().includes(term))
      );
    }

    return result;
  }, [customers, segment, search, thirtyDaysAgo]);

  const segmentCounts = useMemo(() => {
    const counts: Record<Segment, number> = {
      all: customers.length,
      new: 0,
      regular: 0,
      vip: 0,
      at_risk: 0,
      blacklisted: 0,
    };
    for (const c of customers) {
      const seg = getSegment(c);
      counts[seg]++;
      if (!c.isBlacklisted && c.totalBookings > 0 && c._creationTime < thirtyDaysAgo) {
        counts.at_risk++;
      }
    }
    return counts;
  }, [customers, thirtyDaysAgo]);

  const handleExportCSV = useCallback(() => {
    const headers = ["Name", "Phone", "Email", "Total Bookings", "No-Shows", "Segment", "Blacklisted"];
    const rows = filteredCustomers.map((c) => [
      c.name,
      `+${c.phone}`,
      c.email ?? "",
      String(c.totalBookings),
      String(c.noShowCount),
      getSegment(c),
      c.isBlacklisted ? "Yes" : "No",
    ]);

    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredCustomers]);

  return (
    <div className="space-y-5 max-w-[1400px]">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="cadence-animate cadence-delay-1">
          <StatCard label="Total Customers" value={String(stats.total)} icon={Users} iconColor="text-primary" />
        </div>
        <div className="cadence-animate cadence-delay-2">
          <StatCard label="Active" value={String(stats.active)} icon={UserCheck} iconColor="text-[#5a9a6e]" />
        </div>
        <div className="cadence-animate cadence-delay-3">
          <StatCard label="Blacklisted" value={String(stats.blacklisted)} icon={UserX} iconColor="text-[#c45a5a]" />
        </div>
      </div>

      {/* Empty state */}
      {customers.length === 0 && (
        <EmptyState
          icon={Users}
          title="No customers yet"
          description="Customers are automatically added when they message your WhatsApp number. Share your number to get started."
        />
      )}

      {/* Filters & Segments */}
      {customers.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cadence-animate cadence-delay-3">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-3.5 h-3.5 text-[#9c9184]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customers..."
                className="bg-card border border-border rounded-lg pl-9 pr-3 py-2 text-[12px] text-foreground placeholder:text-[#9c9184] outline-none focus:ring-1 focus:ring-primary/30 w-[200px]"
              />
            </div>

            {/* Segment tabs */}
            <div className="flex gap-1 bg-muted/40 p-0.5 rounded-lg border border-border overflow-x-auto">
              {SEGMENTS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSegment(s.value)}
                  className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap ${
                    segment === s.value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s.label}
                  <span className="ml-1 opacity-60">{segmentCounts[s.value]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Export */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      )}

      {/* Main content */}
      {customers.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 cadence-animate cadence-delay-4">
          <div className="lg:col-span-2">
            <CustomerTable
              customers={filteredCustomers}
              onSelectCustomer={setSelectedCustomerId}
              selectedCustomerId={selectedCustomerId}
              getSegment={getSegment}
              getSegmentBadge={getSegmentBadge}
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
      )}
    </div>
  );
}
