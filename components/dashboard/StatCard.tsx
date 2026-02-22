import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  trend?: { value: string; positive: boolean };
  icon: LucideIcon;
  iconColor?: string;
}

export default function StatCard({ label, value, trend, icon: Icon, iconColor = "text-primary" }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 card-glow">
      <div className="flex items-center justify-between mb-3">
        <span className="font-label text-[#9c9184]">{label}</span>
        <Icon className={cn("w-3.5 h-3.5", iconColor)} />
      </div>
      <div className="font-data text-[26px] text-foreground leading-none mb-1.5">
        {value}
      </div>
      {trend && (
        <span
          className={cn(
            "inline-flex items-center gap-1 text-[11px] font-medium font-data px-2 py-0.5 rounded-md",
            trend.positive
              ? "bg-[rgba(90,154,110,0.08)] text-[#5a9a6e]"
              : "bg-[rgba(196,90,90,0.08)] text-[#c45a5a]"
          )}
        >
          {trend.positive ? "+" : ""}{trend.value}
        </span>
      )}
    </div>
  );
}
