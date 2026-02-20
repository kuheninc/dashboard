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
    <div className="bg-card border border-border rounded-[14px] p-5 transition-all hover:shadow-[0_4px_16px_rgba(42,36,32,0.06)] hover:border-[rgba(42,36,32,0.14)]">
      <div className="flex items-center gap-1.5 text-[12px] text-[#9c9184] mb-2">
        <Icon className={cn("w-3.5 h-3.5", iconColor)} />
        {label}
      </div>
      <div className="font-display text-[30px] text-foreground leading-none mb-1.5">
        {value}
      </div>
      {trend && (
        <span
          className={cn(
            "inline-flex items-center gap-1 text-[12px] font-medium px-2 py-0.5 rounded-full",
            trend.positive
              ? "bg-[rgba(90,154,110,0.08)] text-[#5a9a6e]"
              : "bg-[rgba(196,90,90,0.08)] text-[#c45a5a]"
          )}
        >
          {trend.positive ? "↑" : "↓"} {trend.value}
        </span>
      )}
    </div>
  );
}
