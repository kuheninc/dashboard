"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AlertTriangle, Shield, ShieldOff } from "lucide-react";
import type { Doc } from "@/convex/_generated/dataModel";

interface NoShowAlertsProps {
  customers: Doc<"customers">[];
}

export default function NoShowAlerts({ customers }: NoShowAlertsProps) {
  const toggleBlacklist = useMutation(api.customers.mutations.toggleBlacklist);

  const offenders = customers
    .filter((c) => c.noShowCount >= 2)
    .sort((a, b) => b.noShowCount - a.noShowCount);

  return (
    <div className="bg-card border border-border rounded-xl">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#c4983e]" />
          <span className="font-display text-[17px] text-foreground">No-Show Alerts</span>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-4 space-y-2.5">
        {offenders.length === 0 ? (
          <p className="text-[13px] text-muted-foreground text-center py-4">No alerts</p>
        ) : (
          offenders.map((customer) => (
            <div
              key={customer._id}
              className="flex items-center justify-between p-3 bg-[rgba(196,152,62,0.08)] border border-[rgba(196,152,62,0.15)] rounded-lg"
            >
              <div>
                <p className="text-[13px] font-medium text-foreground">{customer.name}</p>
                <p className="text-[11px] text-[#9c9184]">+{customer.phone}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-display font-data text-[18px] text-[#c45a5a]">{customer.noShowCount}x</p>
                  <p className="text-[10px] text-[#9c9184]">no-shows</p>
                </div>
                <button
                  onClick={() => toggleBlacklist({ customerId: customer._id })}
                  className={`p-1.5 rounded-md transition-colors ${
                    customer.isBlacklisted
                      ? "text-[#5a9a6e] hover:bg-[rgba(90,154,110,0.08)]"
                      : "text-[#c45a5a] hover:bg-[rgba(196,90,90,0.08)]"
                  }`}
                  title={customer.isBlacklisted ? "Remove from blacklist" : "Blacklist customer"}
                >
                  {customer.isBlacklisted ? (
                    <ShieldOff className="w-4 h-4" />
                  ) : (
                    <Shield className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
