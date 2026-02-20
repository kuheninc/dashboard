"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/lib/dashboard-context";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  BarChart3,
  Scissors,
  UserCog,
  MessageCircle,
  X,
} from "lucide-react";

const mainNav = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Bookings", href: "/dashboard/bookings", icon: CalendarDays },
  { label: "Customers", href: "/dashboard/customers", icon: Users },
];

const manageNav = [
  { label: "Services", href: "/dashboard/services", icon: Scissors },
  { label: "Team", href: "/dashboard/team", icon: UserCog },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { salon } = useDashboard();

  const initials = salon.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function renderNavItem(item: (typeof mainNav)[0]) {
    const isActive =
      item.href === "/dashboard"
        ? pathname === "/dashboard"
        : pathname.startsWith(item.href);

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onClose}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[14px] transition-all duration-200 mb-0.5",
          isActive
            ? "bg-[rgba(209,183,153,0.12)] text-[#c4a67e] font-medium"
            : "text-[rgba(242,235,224,0.55)] hover:bg-[#2a2430] hover:text-[rgba(242,235,224,0.8)]"
        )}
      >
        <item.icon className={cn("w-[18px] h-[18px]", isActive ? "opacity-100" : "opacity-70")} />
        {item.label}
      </Link>
    );
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-[260px] flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto flex-shrink-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ background: "#1c1720", padding: "28px 16px" }}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-3 mb-9">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d1b799] to-[#a68b6b] flex items-center justify-center flex-shrink-0">
              <Scissors className="w-5 h-5 text-[#1c1720]" />
            </div>
            <span className="font-display text-[22px] text-[#f2ebe0] tracking-[-0.3px]">
              {salon.name}
            </span>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 hover:bg-[#2a2430] rounded-md">
            <X className="w-5 h-5 text-[rgba(242,235,224,0.5)]" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1">
          <div className="text-[10px] tracking-[2px] uppercase text-[rgba(242,235,224,0.5)] px-3 mb-2.5">
            Main
          </div>
          {mainNav.map(renderNavItem)}

          <div className="text-[10px] tracking-[2px] uppercase text-[rgba(242,235,224,0.5)] px-3 mb-2.5 mt-7">
            Manage
          </div>
          {manageNav.map(renderNavItem)}
        </nav>

        {/* WhatsApp Bot Status */}
        <div className="pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] bg-[rgba(209,183,153,0.06)]">
            <div className="relative">
              <MessageCircle className="w-[18px] h-[18px] text-[rgba(242,235,224,0.55)]" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#5a9a6e] rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-[#f2ebe0]">WhatsApp Bot</p>
              <p className="text-[11px] text-[rgba(242,235,224,0.5)]">Active</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-3 pt-4 mt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#a68b6b] to-[#8a7055] flex items-center justify-center text-[13px] font-semibold text-[#f2ebe0] flex-shrink-0">
            {initials}
          </div>
          <div>
            <div className="text-[13px] font-medium text-[#f2ebe0]">{salon.name}</div>
            <div className="text-[11px] text-[rgba(242,235,224,0.5)]">Owner</div>
          </div>
        </div>
      </aside>
    </>
  );
}
