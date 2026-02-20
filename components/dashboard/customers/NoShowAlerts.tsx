import { AlertTriangle } from "lucide-react";
import type { Doc } from "@/convex/_generated/dataModel";

interface NoShowAlertsProps {
  customers: Doc<"customers">[];
}

export default function NoShowAlerts({ customers }: NoShowAlertsProps) {
  const offenders = customers
    .filter((c) => c.noShowCount >= 2)
    .sort((a, b) => b.noShowCount - a.noShowCount);

  return (
    <div className="bg-card border border-border rounded-[14px]">
      {/* Header */}
      <div className="px-[22px] py-[18px] border-b border-border">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#c4983e]" />
          <span className="font-display text-[17px] text-foreground">No-Show Alerts</span>
        </div>
      </div>

      {/* Content */}
      <div className="px-[22px] py-[18px] space-y-2.5">
        {offenders.length === 0 ? (
          <p className="text-[13px] text-muted-foreground text-center py-4">No alerts</p>
        ) : (
          offenders.map((customer) => (
            <div
              key={customer._id}
              className="flex items-center justify-between p-3 bg-[rgba(196,152,62,0.08)] border border-[rgba(196,152,62,0.15)] rounded-[10px]"
            >
              <div>
                <p className="text-[13px] font-medium text-foreground">{customer.name}</p>
                <p className="text-[11px] text-[#9c9184]">+{customer.phone}</p>
              </div>
              <div className="text-right">
                <p className="font-display text-[18px] text-[#c45a5a]">{customer.noShowCount}x</p>
                <p className="text-[10px] text-[#9c9184]">no-shows</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
