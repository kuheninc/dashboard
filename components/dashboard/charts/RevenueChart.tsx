"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, parseISO } from "date-fns";

interface RevenueChartProps {
  data: { date: string; value: number }[];
}

export default function RevenueChart({ data: rawData }: RevenueChartProps) {
  const data = rawData.map((d) => ({
    ...d,
    label: format(parseISO(d.date), "MMM d"),
  }));

  return (
    <div className="bg-card border border-border rounded-xl">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-display text-[15px] text-foreground">Revenue</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">Daily revenue over the last 30 days (RM)</p>
      </div>
      <div className="px-5 py-4">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(90,154,110,0.2)" stopOpacity={1} />
                  <stop offset="100%" stopColor="rgba(90,154,110,0)" stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,36,32,0.04)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9c9184", fontFamily: "'JetBrains Mono', monospace" }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: "#9c9184", fontFamily: "'JetBrains Mono', monospace" }} tickLine={false} axisLine={false} tickFormatter={(v) => `RM${v}`} />
              <Tooltip contentStyle={{ backgroundColor: "#faf7f2", border: "1px solid rgba(42,36,32,0.06)", borderRadius: "8px", fontSize: "12px", boxShadow: "0 4px 12px rgba(42,36,32,0.06)", fontFamily: "'Inter', sans-serif" }} formatter={(value) => [`RM ${value}`, "Revenue"]} />
              <Area type="monotone" dataKey="value" name="Revenue" stroke="#5a9a6e" strokeWidth={2} fill="url(#revenueGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
