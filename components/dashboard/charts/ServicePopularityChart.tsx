"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = ["#a68b6b", "#c4a67e", "#8a7055", "#d1b799", "#6b6058"];

interface ServicePopularityChartProps {
  data: { name: string; bookings: number }[];
}

export default function ServicePopularityChart({ data }: ServicePopularityChartProps) {
  return (
    <div className="bg-card border border-border rounded-xl">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-display text-[15px] text-foreground">Top Services</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">By booking count this month</p>
      </div>
      <div className="px-5 py-4">
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
              <XAxis type="number" tick={{ fontSize: 10, fill: "#9c9184", fontFamily: "'JetBrains Mono', monospace" }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#9c9184", fontFamily: "'Inter', sans-serif" }} tickLine={false} axisLine={false} width={90} />
              <Tooltip contentStyle={{ backgroundColor: "#faf7f2", border: "1px solid rgba(42,36,32,0.06)", borderRadius: "8px", fontSize: "12px", boxShadow: "0 4px 12px rgba(42,36,32,0.06)", fontFamily: "'Inter', sans-serif" }} />
              <Bar dataKey="bookings" radius={[0, 4, 4, 0]} barSize={20}>
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
