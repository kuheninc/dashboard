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
  Sparkles,
  UserCog,
  MessageCircle,
  Settings,
  X,
} from "lucide-react";

function CadenceIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 56 48" fill="none" className={className}>
      <path
        d="M4 36 Q14 6, 24 22 Q34 38, 44 12 Q48 4, 52 8"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

const mainNav = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Bookings", href: "/dashboard/bookings", icon: CalendarDays },
  { label: "Customers", href: "/dashboard/customers", icon: Users },
];

const manageNav = [
  { label: "Services", href: "/dashboard/services", icon: Sparkles },
  { label: "Team", href: "/dashboard/team", icon: UserCog },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
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
          "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all duration-150 mb-0.5",
          isActive
            ? "bg-[rgba(209,183,153,0.12)] text-[#c4a67e] font-medium"
            : "text-[rgba(242,235,224,0.55)] hover:bg-[#2a2430] hover:text-[rgba(242,235,224,0.8)]"
        )}
      >
        <item.icon
          className={cn(
            "w-4 h-4 flex-shrink-0",
            isActive ? "opacity-100" : "opacity-60"
          )}
        />
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
          "fixed top-0 left-0 z-50 h-screen w-[240px] flex flex-col transition-transform duration-200",
          "lg:sticky lg:top-0 lg:z-auto lg:translate-x-0 lg:flex-shrink-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ background: "#1c1720" }}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-5 pt-5 pb-5 flex-shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#d1b799] to-[#a68b6b] flex items-center justify-center flex-shrink-0">
              <CadenceIcon className="w-[18px] h-[13px] text-[#1c1720]" />
            </div>
            <span className="font-display text-[17px] text-[#f2ebe0]">
              Cadence
            </span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1 hover:bg-[#2a2430] rounded-md"
          >
            <X className="w-5 h-5 text-[rgba(242,235,224,0.5)]" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 overflow-y-auto">
          <div className="font-label text-[10px] text-[rgba(242,235,224,0.30)] px-3 mb-2">
            Main
          </div>
          {mainNav.map(renderNavItem)}

          <div className="font-label text-[10px] text-[rgba(242,235,224,0.30)] px-3 mb-2 mt-5">
            Manage
          </div>
          {manageNav.map(renderNavItem)}
        </nav>

        {/* WhatsApp Bot Status */}
        <div className="px-3 pt-3 border-t border-[rgba(255,255,255,0.06)] flex-shrink-0">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[rgba(209,183,153,0.06)]">
            <div className="relative flex-shrink-0">
              <MessageCircle className="w-4 h-4 text-[rgba(242,235,224,0.55)]" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#5a9a6e] rounded-full ring-2 ring-[#1c1720]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-[#f2ebe0]">
                WhatsApp Bot
              </p>
              <p className="text-[10px] text-[rgba(242,235,224,0.65)]">
                Active
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2.5 px-6 py-4 mt-1 border-t border-[rgba(255,255,255,0.06)] flex-shrink-0">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#a68b6b] to-[#8a7055] flex items-center justify-center text-[11px] font-semibold text-[#f2ebe0] flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-medium text-[#f2ebe0] truncate">
              {salon.name}
            </div>
            <div className="text-[10px] text-[rgba(242,235,224,0.55)]">
              Owner
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
