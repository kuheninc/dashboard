"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, parseISO } from "date-fns";

interface BookingTrendChartProps {
  data: { date: string; value: number }[];
}

export default function BookingTrendChart({ data: rawData }: BookingTrendChartProps) {
  const data = rawData.map((d) => ({
    ...d,
    label: format(parseISO(d.date), "MMM d"),
  }));

  return (
    <div className="bg-card border border-border rounded-xl">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-display text-[15px] text-foreground">Booking Trends</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">Daily bookings over the last 30 days</p>
      </div>
      <div className="px-5 py-4">
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="bookingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(166,139,107,0.2)" stopOpacity={1} />
                  <stop offset="100%" stopColor="rgba(166,139,107,0)" stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,36,32,0.04)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9c9184", fontFamily: "'JetBrains Mono', monospace" }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: "#9c9184", fontFamily: "'JetBrains Mono', monospace" }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: "#faf7f2", border: "1px solid rgba(42,36,32,0.06)", borderRadius: "8px", fontSize: "12px", boxShadow: "0 4px 12px rgba(42,36,32,0.06)", fontFamily: "'Inter', sans-serif" }} labelStyle={{ fontWeight: 600, marginBottom: 4 }} />
              <Area type="monotone" dataKey="value" name="Bookings" stroke="#a68b6b" strokeWidth={2} fill="url(#bookingGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
