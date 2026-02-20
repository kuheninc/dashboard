"use client";

import { useState } from "react";
import { Search, AlertTriangle } from "lucide-react";
import type { Doc, Id } from "@/convex/_generated/dataModel";

interface CustomerTableProps {
  customers: Doc<"customers">[];
  onSelectCustomer?: (customerId: Id<"customers">) => void;
  selectedCustomerId?: Id<"customers"> | null;
}

export default function CustomerTable({ customers, onSelectCustomer, selectedCustomerId }: CustomerTableProps) {
  const [search, setSearch] = useState("");

  const filtered = customers.filter((c) => {
    if (!search) return true;
    return (
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-2 bg-card border border-border rounded-[10px] px-4 py-2.5 max-w-sm">
        <Search className="w-4 h-4 text-[#9c9184]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers..."
          className="bg-transparent text-[13px] text-foreground outline-none placeholder:text-[#9c9184] w-full"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-[14px] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[rgba(166,139,107,0.05)]">
              <th className="text-left text-[11px] tracking-[1px] uppercase text-[#9c9184] font-medium px-[22px] py-[14px]">
                Name
              </th>
              <th className="text-left text-[11px] tracking-[1px] uppercase text-[#9c9184] font-medium px-[22px] py-[14px]">
                Phone
              </th>
              <th className="text-left text-[11px] tracking-[1px] uppercase text-[#9c9184] font-medium px-[22px] py-[14px] hidden md:table-cell">
                Email
              </th>
              <th className="text-center text-[11px] tracking-[1px] uppercase text-[#9c9184] font-medium px-[22px] py-[14px]">
                Bookings
              </th>
              <th className="text-center text-[11px] tracking-[1px] uppercase text-[#9c9184] font-medium px-[22px] py-[14px]">
                No-Shows
              </th>
              <th className="text-left text-[11px] tracking-[1px] uppercase text-[#9c9184] font-medium px-[22px] py-[14px]">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((customer) => (
              <tr
                key={customer._id}
                className={`cursor-pointer border-t border-border transition-colors ${
                  selectedCustomerId === customer._id
                    ? "bg-[rgba(166,139,107,0.08)]"
                    : "hover:bg-[rgba(166,139,107,0.05)]"
                }`}
                onClick={() => onSelectCustomer?.(customer._id)}
              >
                <td className="text-[13px] font-medium text-foreground px-[22px] py-[14px]">
                  <div className="flex items-center gap-2">
                    {customer.name}
                    {customer.noShowCount >= 2 && (
                      <AlertTriangle className="w-3.5 h-3.5 text-[#c4983e]" />
                    )}
                  </div>
                </td>
                <td className="text-[13px] text-muted-foreground font-mono px-[22px] py-[14px]">
                  +{customer.phone}
                </td>
                <td className="text-[13px] text-muted-foreground px-[22px] py-[14px] hidden md:table-cell">
                  {customer.email ?? "\u2014"}
                </td>
                <td className="text-[13px] text-foreground text-center px-[22px] py-[14px]">
                  {customer.totalBookings}
                </td>
                <td className="text-[13px] text-center px-[22px] py-[14px]">
                  {customer.noShowCount > 0 ? (
                    <span className="text-[#c45a5a] font-medium">{customer.noShowCount}</span>
                  ) : (
                    <span className="text-[#9c9184]">0</span>
                  )}
                </td>
                <td className="px-[22px] py-[14px]">
                  {customer.isBlacklisted ? (
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
