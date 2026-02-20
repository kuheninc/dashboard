import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { mockCustomers } from "@/lib/mock-data";

export default function NoShowAlerts() {
  const offenders = mockCustomers
    .filter((c) => c.noShowCount >= 2)
    .sort((a, b) => b.noShowCount - a.noShowCount);

  return (
    <Card className="shadow-sm border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          No-Show Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {offenders.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No alerts</p>
        ) : (
          offenders.map((customer) => (
            <div
              key={customer.id}
              className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50/50 border border-amber-100"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{customer.name}</p>
                <p className="text-xs text-muted-foreground">+{customer.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-red-600">{customer.noShowCount}x</p>
                <p className="text-[10px] text-muted-foreground">no-shows</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
