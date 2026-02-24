import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  trend?: { value: string; positive: boolean };
  icon: LucideIcon;
  iconColor?: string;
  href?: string;
  accentColor?: string;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function StatCard({ label, value, trend, icon: Icon, iconColor = "text-primary", href, accentColor }: StatCardProps) {
  const content = (
    <div
      className={cn(
        "bg-card border border-border rounded-xl p-4 card-glow group relative",
        href && "cursor-pointer hover:border-primary/30 transition-colors"
      )}
      style={{
        ...(accentColor ? { borderLeftWidth: 3, borderLeftColor: accentColor } : {}),
        ...(accentColor ? { backgroundColor: hexToRgba(accentColor, 0.04) } : {}),
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-label text-[#9c9184]">{label}</span>
        <div className="flex items-center gap-1">
          <Icon className={cn("w-3.5 h-3.5", iconColor)} />
          {href && (
            <ArrowUpRight className="w-3 h-3 text-[#9c9184] opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      </div>
      <div className="font-data text-[26px] text-foreground leading-none mb-1.5">
        {value}
      </div>
      {trend && (
        <span
          className={cn(
            "inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md",
            trend.positive
              ? "bg-[rgba(90,154,110,0.08)] text-[#5a9a6e]"
              : "bg-[rgba(196,90,90,0.08)] text-[#c45a5a]"
          )}
        >
          {trend.positive ? "\u2191" : "\u2193"} {trend.value}
        </span>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}
