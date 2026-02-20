"use client";

import { Bell, Search, Menu } from "lucide-react";
import { useDashboard } from "@/lib/dashboard-context";
import { usePathname } from "next/navigation";

interface HeaderProps {
  onMenuClick: () => void;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Today's Overview",
  "/dashboard/bookings": "Bookings",
  "/dashboard/customers": "Clients",
  "/dashboard/services": "Services",
  "/dashboard/team": "Team",
  "/dashboard/analytics": "Analytics",
};

export default function Header({ onMenuClick }: HeaderProps) {
  const { salon } = useDashboard();
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "Dashboard";

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 lg:px-10 py-6 lg:py-8 flex-wrap gap-4">
      {/* Left: mobile menu + greeting */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-muted rounded-[10px]"
        >
          <Menu className="w-5 h-5 text-muted-foreground" />
        </button>

        <div>
          <div className="text-[13px] text-[#9c9184]">{getGreeting()}</div>
          <div className="font-display text-[22px] sm:text-[28px] text-foreground tracking-[-0.3px]">
            {title}
          </div>
        </div>
      </div>

      {/* Right: search + notification + new booking */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        <div className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-[10px] min-w-[220px] transition-colors hover:border-[rgba(42,36,32,0.14)] cursor-text">
          <Search className="w-[15px] h-[15px] text-[#9c9184]" />
          <span className="text-[13px] text-[#9c9184]">Search clients, bookings&hellip;</span>
          <span className="ml-auto text-[11px] px-1.5 py-0.5 bg-background rounded border border-border text-[#9c9184]">
            /K
          </span>
        </div>

        <button className="relative w-[38px] h-[38px] flex items-center justify-center bg-card border border-border rounded-[10px] hover:border-[rgba(42,36,32,0.14)] hover:bg-white transition-all">
          <Bell className="w-[18px] h-[18px] text-muted-foreground" />
          <span className="absolute top-2 right-2 w-[7px] h-[7px] bg-[#c4983e] rounded-full border-2 border-card" />
        </button>

        <button className="flex items-center gap-1.5 px-3 sm:px-5 py-2.5 bg-primary text-primary-foreground rounded-[10px] text-[13px] font-medium hover:bg-[#8a7055] transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          <span className="hidden sm:inline">New Booking</span>
        </button>
      </div>
    </header>
  );
}
