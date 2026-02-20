import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  trend?: { value: string; positive: boolean };
  icon: LucideIcon;
  iconColor?: string;
}

export default function StatCard({ label, value, trend, icon: Icon, iconColor = "text-primary" }: StatCardProps) {
  return (
    <Card className="shadow-sm border-border/60">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
            {trend && (
              <div className="flex items-center gap-1">
                {trend.positive ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                )}
                <span
                  className={cn(
                    "text-xs font-medium",
                    trend.positive ? "text-emerald-600" : "text-red-600"
                  )}
                >
                  {trend.value}
                </span>
                <span className="text-xs text-muted-foreground">vs last period</span>
              </div>
            )}
          </div>
          <div className={cn("p-2.5 rounded-xl bg-primary/5", iconColor.replace("text-", "bg-").replace(/\d+/, "50"))}>
            <Icon className={cn("w-5 h-5", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
