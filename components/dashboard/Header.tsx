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
    <header className="flex items-center justify-between px-4 sm:px-6 lg:px-10 py-4 lg:py-5 flex-wrap gap-3">
      {/* Left: mobile menu + greeting */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-muted rounded-lg"
        >
          <Menu className="w-5 h-5 text-muted-foreground" />
        </button>

        <div>
          <div className="text-[12px] text-[#9c9184] font-medium tracking-wide">{getGreeting()}</div>
          <div className="font-display text-[20px] sm:text-[24px] text-foreground">
            {title}
          </div>
        </div>
      </div>

      {/* Right: search + notification + new booking */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        <div className="hidden md:flex items-center gap-2 px-3.5 py-2 bg-card/80 backdrop-blur-sm border border-border rounded-lg min-w-[220px] transition-colors hover:border-[rgba(42,36,32,0.12)] cursor-text">
          <Search className="w-[14px] h-[14px] text-[#9c9184]" />
          <span className="text-[12px] text-[#9c9184]">Search clients, bookings&hellip;</span>
          <span className="ml-auto font-mono text-[10px] px-1.5 py-0.5 bg-background rounded border border-border text-[#9c9184]">
            /K
          </span>
        </div>

        <button className="relative w-[34px] h-[34px] flex items-center justify-center bg-card border border-border rounded-lg hover:border-[rgba(42,36,32,0.12)] hover:bg-white transition-all">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-[6px] h-[6px] bg-[#c4983e] rounded-full border-2 border-card" />
        </button>

        <button className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg text-[12px] font-medium hover:bg-[#8a7055] transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          <span className="hidden sm:inline">New Booking</span>
        </button>
      </div>
    </header>
  );
}
