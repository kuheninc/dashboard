"use client";

import { AlertTriangle } from "lucide-react";
import type { Doc, Id } from "@/convex/_generated/dataModel";

type Segment = "all" | "new" | "regular" | "vip" | "at_risk" | "blacklisted";

interface CustomerTableProps {
  customers: Doc<"customers">[];
  onSelectCustomer?: (customerId: Id<"customers">) => void;
  selectedCustomerId?: Id<"customers"> | null;
  getSegment?: (customer: Doc<"customers">) => Segment;
  getSegmentBadge?: (segment: Segment) => { label: string; className: string };
}

export default function CustomerTable({
  customers,
  onSelectCustomer,
  selectedCustomerId,
  getSegment,
  getSegmentBadge,
}: CustomerTableProps) {
  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px]">
            <thead>
              <tr className="bg-[rgba(166,139,107,0.05)]">
                <th className="text-left font-label text-[#9c9184] px-4 lg:px-5 py-3">
                  Name
                </th>
                <th className="text-left font-label text-[#9c9184] px-4 lg:px-5 py-3">
                  Phone
                </th>
                <th className="text-center font-label text-[#9c9184] px-4 lg:px-5 py-3 hidden sm:table-cell">
                  Bookings
                </th>
                <th className="text-center font-label text-[#9c9184] px-4 lg:px-5 py-3 hidden sm:table-cell">
                  No-Shows
                </th>
                <th className="text-left font-label text-[#9c9184] px-4 lg:px-5 py-3">
                  Segment
                </th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-[13px] text-muted-foreground py-8">
                    No customers match your filters
                  </td>
                </tr>
              ) : (
                customers.map((customer) => {
                  const seg = getSegment?.(customer);
                  const badge = seg && getSegmentBadge ? getSegmentBadge(seg) : null;

                  return (
                    <tr
                      key={customer._id}
                      className={`cursor-pointer border-t border-border transition-colors ${
                        selectedCustomerId === customer._id
                          ? "bg-[rgba(166,139,107,0.08)]"
                          : "hover:bg-[rgba(166,139,107,0.05)]"
                      }`}
                      onClick={() => onSelectCustomer?.(customer._id)}
                    >
                      <td className="text-[13px] font-medium text-foreground px-4 lg:px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className="truncate max-w-[140px] lg:max-w-none">{customer.name}</span>
                          {customer.noShowCount >= 2 && (
                            <AlertTriangle className="w-3.5 h-3.5 text-[#c4983e] flex-shrink-0" />
                          )}
                        </div>
                      </td>
                      <td className="text-[13px] text-muted-foreground font-mono px-4 lg:px-5 py-3 whitespace-nowrap">
                        +{customer.phone}
                      </td>
                      <td className="text-[13px] text-foreground font-data text-center px-4 lg:px-5 py-3 hidden sm:table-cell">
                        {customer.totalBookings}
                      </td>
                      <td className="text-[13px] font-data text-center px-4 lg:px-5 py-3 hidden sm:table-cell">
                        {customer.noShowCount > 0 ? (
                          <span className="text-[#c45a5a] font-medium">{customer.noShowCount}</span>
                        ) : (
                          <span className="text-[#9c9184]">0</span>
                        )}
                      </td>
                      <td className="px-4 lg:px-5 py-3">
                        {badge ? (
                          <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${badge.className}`}>
                            {badge.label}
                          </span>
                        ) : customer.isBlacklisted ? (
                          <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[rgba(196,90,90,0.08)] text-[#c45a5a]">
                            Blacklisted
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[rgba(90,154,110,0.08)] text-[#5a9a6e]">
                            Active
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
