"use client";

import { useState } from "react";
import { Menu, LogOut } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useDashboard } from "@/lib/dashboard-context";
import { usePathname, useRouter } from "next/navigation";
import NotificationsDropdown from "./NotificationsDropdown";
import NewBookingModal from "./NewBookingModal";

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
  "/dashboard/settings": "Settings",
};

export default function Header({ onMenuClick }: HeaderProps) {
  const { salon } = useDashboard();
  const { signOut } = useAuthActions();
  const pathname = usePathname();
  const router = useRouter();
  const title = pageTitles[pathname] ?? "Dashboard";
  const [showNewBooking, setShowNewBooking] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
  };

  return (
    <>
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

        {/* Right: notification + new booking + sign out */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <NotificationsDropdown />

          <button
            onClick={() => setShowNewBooking(true)}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg text-[12px] font-medium hover:bg-[#8a7055] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            <span className="hidden sm:inline">New Booking</span>
          </button>

          <button
            onClick={handleSignOut}
            className="w-[34px] h-[34px] flex items-center justify-center bg-card border border-border rounded-lg hover:border-[rgba(196,90,90,0.3)] hover:bg-[rgba(196,90,90,0.04)] transition-all"
            title="Sign out"
          >
            <LogOut className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </header>

      <NewBookingModal
        isOpen={showNewBooking}
        onClose={() => setShowNewBooking(false)}
      />
    </>
  );
}
