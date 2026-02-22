"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface StylistPerformanceChartProps {
  data: { name: string; bookings: number; completed: number; noShows: number }[];
}

export default function StylistPerformanceChart({ data }: StylistPerformanceChartProps) {
  return (
    <div className="bg-card border border-border rounded-xl">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-display text-[15px] text-foreground">Stylist Performance</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">Bookings and completions this month</p>
      </div>
      <div className="px-5 py-4">
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9c9184", fontFamily: "'Inter', sans-serif" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9c9184", fontFamily: "'JetBrains Mono', monospace" }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: "#faf7f2", border: "1px solid rgba(42,36,32,0.06)", borderRadius: "8px", fontSize: "12px", boxShadow: "0 4px 12px rgba(42,36,32,0.06)", fontFamily: "'Inter', sans-serif" }} />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: "10px", paddingTop: "8px", fontFamily: "'Inter', sans-serif" }} />
              <Bar dataKey="completed" name="Completed" fill="#a68b6b" radius={[3, 3, 0, 0]} barSize={18} />
              <Bar dataKey="noShows" name="No Shows" fill="#c45a5a" radius={[3, 3, 0, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
