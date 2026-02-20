"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const hours = Array.from({ length: 12 }, (_, i) => i + 9); // 9 AM to 8 PM

function getIntensity(count: number): string {
  if (count === 0) return "bg-muted/30";
  if (count <= 1) return "bg-blue-100";
  if (count <= 2) return "bg-blue-200";
  if (count <= 3) return "bg-blue-300";
  if (count <= 4) return "bg-blue-400";
  return "bg-blue-500";
}

interface PeakHoursHeatmapProps {
  data: { day: number; hour: number; count: number }[];
}

export default function PeakHoursHeatmap({ data }: PeakHoursHeatmapProps) {
  return (
    <Card className="shadow-sm border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Peak Hours</CardTitle>
        <p className="text-xs text-muted-foreground">Booking density by day and hour</p>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="overflow-x-auto">
          <div className="min-w-[500px]">
            {/* Hour labels */}
            <div className="flex mb-1">
              <div className="w-10" />
              {hours.map((hour) => (
                <div key={hour} className="flex-1 text-center text-[10px] text-muted-foreground">
                  {hour > 12 ? `${hour - 12}p` : hour === 12 ? "12p" : `${hour}a`}
                </div>
              ))}
            </div>

            {/* Grid */}
            {days.map((day, dayIndex) => (
              <div key={day} className="flex items-center mb-1">
                <div className="w-10 text-[11px] text-muted-foreground font-medium">{day}</div>
                <div className="flex-1 flex gap-0.5">
                  {hours.map((hour) => {
                    const cell = data.find(
                      (c) => c.day === dayIndex && c.hour === hour
                    );
                    return (
                      <div
                        key={hour}
                        className={cn(
                          "flex-1 h-7 rounded-sm transition-colors",
                          getIntensity(cell?.count ?? 0)
                        )}
                        title={`${day} ${hour}:00 — ${cell?.count ?? 0} bookings`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Legend */}
            <div className="flex items-center justify-end gap-1 mt-3">
              <span className="text-[10px] text-muted-foreground mr-1">Less</span>
              {["bg-muted/30", "bg-blue-100", "bg-blue-200", "bg-blue-300", "bg-blue-400", "bg-blue-500"].map(
                (cls) => (
                  <div key={cls} className={cn("w-4 h-4 rounded-sm", cls)} />
                )
              )}
              <span className="text-[10px] text-muted-foreground ml-1">More</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
