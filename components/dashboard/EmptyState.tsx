"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="bg-card border border-border rounded-xl py-12 px-6 text-center cadence-animate">
      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6 text-[#9c9184]" />
      </div>
      <h3 className="font-display text-[15px] text-foreground mb-1.5">{title}</h3>
      <p className="text-[13px] text-muted-foreground max-w-sm mx-auto mb-5">{description}</p>
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-medium text-[#1c1720] bg-gradient-to-r from-[#d1b799] to-[#c4a67e] hover:from-[#dcc5a8] hover:to-[#d1b799] transition-all shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

interface SetupChecklistProps {
  serviceCount: number;
  stylistCount: number;
  customerCount: number;
}

export function SetupChecklist({ serviceCount, stylistCount, customerCount }: SetupChecklistProps) {
  const items = [
    { label: "Connect WhatsApp webhook", done: false, href: "/dashboard/settings" },
    { label: "Add at least 3 services", done: serviceCount >= 3, href: "/dashboard/services" },
    { label: "Add your team members", done: stylistCount >= 1, href: "/dashboard/team" },
    { label: "Get your first customer", done: customerCount >= 1, href: "/dashboard/customers" },
  ];

  const completedCount = items.filter((i) => i.done).length;

  if (completedCount === items.length) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-5 cadence-animate cadence-delay-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-[15px] text-foreground">Complete your setup</h3>
        <span className="text-[12px] font-medium text-muted-foreground">
          {completedCount}/{items.length}
        </span>
      </div>
      <div className="space-y-2.5">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-colors ${
              item.done
                ? "bg-[rgba(90,154,110,0.06)]"
                : "bg-[rgba(166,139,107,0.04)] hover:bg-[rgba(166,139,107,0.08)]"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] ${
                item.done
                  ? "bg-[#5a9a6e] text-white"
                  : "border-2 border-border"
              }`}
            >
              {item.done ? "\u2713" : ""}
            </div>
            <span
              className={`text-[13px] ${
                item.done
                  ? "text-[#5a9a6e] line-through"
                  : "text-foreground font-medium"
              }`}
            >
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
