"use client";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const hours = Array.from({ length: 12 }, (_, i) => i + 9); // 9 AM to 8 PM

const INTENSITY_COLORS = [
  "rgba(166,139,107,0.04)",
  "rgba(166,139,107,0.15)",
  "rgba(166,139,107,0.30)",
  "rgba(166,139,107,0.50)",
  "rgba(166,139,107,0.70)",
  "rgba(166,139,107,1)",
];

function getIntensityColor(count: number): string {
  if (count === 0) return INTENSITY_COLORS[0];
  if (count <= 1) return INTENSITY_COLORS[1];
  if (count <= 2) return INTENSITY_COLORS[2];
  if (count <= 3) return INTENSITY_COLORS[3];
  if (count <= 4) return INTENSITY_COLORS[4];
  return INTENSITY_COLORS[5];
}

interface PeakHoursHeatmapProps {
  data: { day: number; hour: number; count: number }[];
}

export default function PeakHoursHeatmap({ data }: PeakHoursHeatmapProps) {
  return (
    <div className="bg-card border border-border rounded-[14px]">
      <div className="px-[22px] py-[18px] border-b border-border">
        <h3 className="font-display text-[17px] text-foreground">Peak Hours</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Booking density by day and hour</p>
      </div>
      <div className="px-[22px] py-[18px]">
        <div className="overflow-x-auto">
          <div className="min-w-[500px]">
            {/* Hour labels */}
            <div className="flex mb-1">
              <div className="w-10" />
              {hours.map((hour) => (
                <div key={hour} className="flex-1 text-center text-[10px]" style={{ color: "#9c9184" }}>
                  {hour > 12 ? `${hour - 12}p` : hour === 12 ? "12p" : `${hour}a`}
                </div>
              ))}
            </div>

            {/* Grid */}
            {days.map((day, dayIndex) => (
              <div key={day} className="flex items-center mb-1">
                <div className="w-10 text-[11px] font-medium" style={{ color: "#9c9184" }}>{day}</div>
                <div className="flex-1 flex gap-0.5">
                  {hours.map((hour) => {
                    const cell = data.find(
                      (c) => c.day === dayIndex && c.hour === hour
                    );
                    return (
                      <div
                        key={hour}
                        className="flex-1 h-7 rounded-sm transition-colors"
                        style={{ backgroundColor: getIntensityColor(cell?.count ?? 0) }}
                        title={`${day} ${hour}:00 — ${cell?.count ?? 0} bookings`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Legend */}
            <div className="flex items-center justify-end gap-1 mt-3">
              <span className="text-[10px] mr-1" style={{ color: "#9c9184" }}>Less</span>
              {INTENSITY_COLORS.map((color) => (
                <div
                  key={color}
                  className="w-4 h-4 rounded-sm"
                  style={{ backgroundColor: color }}
                />
              ))}
              <span className="text-[10px] ml-1" style={{ color: "#9c9184" }}>More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
