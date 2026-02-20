"use client";

import { cn } from "@/lib/utils";
import type { Doc } from "@/convex/_generated/dataModel";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const COLORS = [
  "bg-[rgba(166,139,107,0.15)]",
  "bg-[rgba(90,154,110,0.15)]",
  "bg-[rgba(196,152,62,0.15)]",
  "bg-[rgba(138,112,85,0.15)]",
];
const LEGEND_DOTS = [
  "bg-[rgba(166,139,107,0.4)]",
  "bg-[rgba(90,154,110,0.4)]",
  "bg-[rgba(196,152,62,0.4)]",
  "bg-[rgba(138,112,85,0.4)]",
];

interface AvailabilityGridProps {
  stylists: Doc<"stylists">[];
}

export default function AvailabilityGrid({ stylists }: AvailabilityGridProps) {
  return (
    <div className="bg-card border border-border rounded-[14px]">
      <div className="px-4 lg:px-[22px] py-[18px] border-b border-border">
        <h3 className="font-display text-[17px] text-foreground">Weekly Availability</h3>
        <p className="text-[13px] text-muted-foreground mt-0.5">All stylists&apos; working hours</p>
      </div>

      <div className="px-4 lg:px-[22px] py-[18px]">
        <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
          <div className="min-w-[500px]">
            {/* Day headers */}
            <div className="grid grid-cols-8 gap-1 lg:gap-1.5 mb-2">
              <div />
              {days.map((d) => (
                <div key={d} className="text-center text-[11px] font-medium text-[#9c9184]">
                  {d}
                </div>
              ))}
            </div>

            {/* Stylist rows */}
            {stylists.map((stylist, i) => (
              <div key={stylist._id} className="grid grid-cols-8 gap-1 lg:gap-1.5 mb-1.5">
                <div className="text-[12px] font-medium text-foreground flex items-center truncate pr-1">
                  {stylist.name}
                </div>
                {days.map((_, dayIndex) => {
                  const avail = stylist.availability.find((a) => a.day === dayIndex);
                  return (
                    <div key={dayIndex} className="h-9 lg:h-10 relative">
                      {avail ? (
                        <div
                          className={cn(
                            "h-full rounded-[6px] lg:rounded-[8px] flex items-center justify-center",
                            COLORS[i % COLORS.length]
                          )}
                        >
                          <span className="text-[9px] lg:text-[10px] font-medium text-foreground/70">
                            {avail.startTime}-{avail.endTime}
                          </span>
                        </div>
                      ) : (
                        <div className="h-full rounded-[6px] lg:rounded-[8px] border border-dashed border-border" />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-border">
              {stylists.map((stylist, i) => (
                <div key={stylist._id} className="flex items-center gap-1.5">
                  <div className={cn("w-3 h-3 rounded-[4px]", LEGEND_DOTS[i % LEGEND_DOTS.length])} />
                  <span className="text-[11px] text-muted-foreground">{stylist.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
