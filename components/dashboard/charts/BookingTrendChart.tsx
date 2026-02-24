"use client";

import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, parseISO } from "date-fns";

interface BookingTrendChartProps {
  data: { date: string; value: number }[];
}

type Range = "7d" | "14d" | "30d";

export default function BookingTrendChart({ data: rawData }: BookingTrendChartProps) {
  const hasActivity = rawData.some((d) => d.value > 0);
  const activeDays = rawData.filter((d) => d.value > 0).length;

  // Auto-select range: if few active days, default to 14d
  const defaultRange: Range = activeDays <= 5 ? "14d" : "30d";
  const [range, setRange] = useState<Range>(defaultRange);

  const sliceCount = range === "7d" ? 7 : range === "14d" ? 14 : 30;
  const data = useMemo(() => {
    const sliced = rawData.slice(-sliceCount);
    return sliced.map((d) => ({
      ...d,
      label: format(parseISO(d.date), "MMM d"),
    }));
  }, [rawData, sliceCount]);

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="bg-card border border-border rounded-xl">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-display text-[15px] text-foreground">Booking Trends</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Daily bookings</p>
        </div>
        <div className="flex gap-1 bg-muted/40 p-0.5 rounded-lg border border-border">
          {(["7d", "14d", "30d"] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${
                range === r
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <div className="px-5 py-4">
        <div className="h-[240px]">
          {!hasActivity ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-[13px] text-[#9c9184]">No bookings in this period</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,36,32,0.04)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "#9c9184", fontFamily: "'JetBrains Mono', monospace" }}
                  tickLine={false}
                  axisLine={false}
                  interval={range === "30d" ? 4 : range === "14d" ? 1 : 0}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#9c9184", fontFamily: "'JetBrains Mono', monospace" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  domain={[0, Math.max(maxValue + 1, 5)]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#faf7f2",
                    border: "1px solid rgba(42,36,32,0.06)",
                    borderRadius: "8px",
                    fontSize: "12px",
                    boxShadow: "0 4px 12px rgba(42,36,32,0.06)",
                    fontFamily: "'Inter', sans-serif",
                  }}
                  labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                />
                <Bar dataKey="value" name="Bookings" fill="#a68b6b" radius={[3, 3, 0, 0]} barSize={range === "30d" ? 8 : range === "14d" ? 14 : 24} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
