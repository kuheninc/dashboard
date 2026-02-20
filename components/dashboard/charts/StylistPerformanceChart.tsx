"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface StylistPerformanceChartProps {
  data: { name: string; bookings: number; completed: number; noShows: number }[];
}

export default function StylistPerformanceChart({ data }: StylistPerformanceChartProps) {
  return (
    <div className="bg-card border border-border rounded-[14px]">
      <div className="px-[22px] py-[18px] border-b border-border">
        <h3 className="font-display text-[17px] text-foreground">Stylist Performance</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Bookings and completions this month</p>
      </div>
      <div className="px-[22px] py-[18px]">
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "#9c9184" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9c9184" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#faf7f2",
                  border: "1px solid rgba(42,36,32,0.08)",
                  borderRadius: "10px",
                  fontSize: "12px",
                  boxShadow: "0 4px 16px rgba(42,36,32,0.06)",
                  fontFamily: "'General Sans', sans-serif",
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
              />
              <Bar dataKey="completed" name="Completed" fill="#a68b6b" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="noShows" name="No Shows" fill="#c45a5a" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
