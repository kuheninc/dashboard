"use client";

import { Bell, Search, Menu } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useDashboard } from "@/lib/dashboard-context";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { salon } = useDashboard();
  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-border flex items-center justify-between px-6">
      {/* Left: hamburger + search */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-muted rounded-lg"
        >
          <Menu className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="hidden sm:flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 w-[280px]">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search bookings, customers..."
            className="bg-transparent text-sm outline-none placeholder:text-muted-foreground w-full"
          />
        </div>
      </div>

      {/* Right: notifications + profile */}
      <div className="flex items-center gap-3">
        <button className="relative p-2 hover:bg-muted rounded-lg">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <Badge className="absolute -top-0.5 -right-0.5 h-5 min-w-5 px-1.5 text-[10px] bg-primary text-primary-foreground border-2 border-white">
            3
          </Badge>
        </button>

        <div className="h-8 w-px bg-border" />

        <div className="flex items-center gap-2.5">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              AD
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-foreground leading-none">Admin</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{salon.name}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
