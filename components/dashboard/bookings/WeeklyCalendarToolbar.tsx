"use client";

import { ChevronLeft, ChevronRight, Users, LayoutGrid } from "lucide-react";
import { format } from "date-fns";

interface WeeklyCalendarToolbarProps {
  weekStart: Date;
  weekEnd: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  viewMode: "unified" | "per-stylist";
  onViewModeChange: (mode: "unified" | "per-stylist") => void;
}

export default function WeeklyCalendarToolbar({
  weekStart,
  weekEnd,
  onPrevWeek,
  onNextWeek,
  onToday,
  viewMode,
  onViewModeChange,
}: WeeklyCalendarToolbarProps) {
  const rangeLabel =
    weekStart.getMonth() === weekEnd.getMonth()
      ? `${format(weekStart, "MMM d")} – ${format(weekEnd, "d, yyyy")}`
      : `${format(weekStart, "MMM d")} – ${format(weekEnd, "MMM d, yyyy")}`;

  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-border">
      {/* Left: navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToday}
          className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Today
        </button>
        <div className="flex gap-0.5">
          <button
            onClick={onPrevWeek}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-[rgba(166,139,107,0.08)] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onNextWeek}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-[rgba(166,139,107,0.08)] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <h3 className="font-display text-[15px] text-foreground ml-2">
          {rangeLabel}
        </h3>
      </div>

      {/* Right: view toggle */}
      <div className="flex gap-0.5 bg-muted/40 p-0.5 rounded-lg border border-border">
        <button
          onClick={() => onViewModeChange("unified")}
          className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
            viewMode === "unified"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <LayoutGrid className="w-3 h-3" />
          Unified
        </button>
        <button
          onClick={() => onViewModeChange("per-stylist")}
          className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
            viewMode === "per-stylist"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="w-3 h-3" />
          By Stylist
        </button>
      </div>
    </div>
  );
}
