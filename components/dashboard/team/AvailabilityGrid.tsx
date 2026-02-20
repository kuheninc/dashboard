"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Doc } from "@/convex/_generated/dataModel";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const COLORS = [
  "bg-blue-200 border-blue-300",
  "bg-violet-200 border-violet-300",
  "bg-emerald-200 border-emerald-300",
  "bg-amber-200 border-amber-300",
];

interface AvailabilityGridProps {
  stylists: Doc<"stylists">[];
}

export default function AvailabilityGrid({ stylists }: AvailabilityGridProps) {
  return (
    <Card className="shadow-sm border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Weekly Availability</CardTitle>
        <p className="text-xs text-muted-foreground">All stylists&apos; working hours</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Day headers */}
            <div className="grid grid-cols-8 gap-1 mb-2">
              <div className="text-xs font-medium text-muted-foreground" />
              {days.map((d) => (
                <div key={d} className="text-center text-xs font-medium text-muted-foreground">
                  {d}
                </div>
              ))}
            </div>

            {/* Stylist rows */}
            {stylists.map((stylist, i) => (
              <div key={stylist._id} className="grid grid-cols-8 gap-1 mb-1.5">
                <div className="text-xs font-medium text-foreground flex items-center">{stylist.name}</div>
                {days.map((_, dayIndex) => {
                  const avail = stylist.availability.find((a) => a.day === dayIndex);
                  return (
                    <div key={dayIndex} className="h-10 relative">
                      {avail ? (
                        <div
                          className={cn(
                            "h-full rounded-md border flex items-center justify-center",
                            COLORS[i % COLORS.length]
                          )}
                        >
                          <span className="text-[10px] font-medium text-foreground/70">
                            {avail.startTime}-{avail.endTime}
                          </span>
                        </div>
                      ) : (
                        <div className="h-full rounded-md bg-muted/20 border border-dashed border-border/40" />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-border/40">
              {stylists.map((stylist, i) => (
                <div key={stylist._id} className="flex items-center gap-1.5">
                  <div className={cn("w-3 h-3 rounded-sm", COLORS[i % COLORS.length].split(" ")[0])} />
                  <span className="text-[11px] text-muted-foreground">{stylist.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
