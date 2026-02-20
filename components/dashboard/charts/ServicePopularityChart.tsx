"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = ["#a68b6b", "#c4a67e", "#8a7055", "#d1b799", "#6b6058"];

interface ServicePopularityChartProps {
  data: { name: string; bookings: number }[];
}

export default function ServicePopularityChart({ data }: ServicePopularityChartProps) {
  return (
    <div className="bg-card border border-border rounded-[14px]">
      <div className="px-[22px] py-[18px] border-b border-border">
        <h3 className="font-display text-[17px] text-foreground">Top Services</h3>
        <p className="text-xs text-muted-foreground mt-0.5">By booking count this month</p>
      </div>
      <div className="px-[22px] py-[18px]">
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 10, bottom: 0, left: 0 }}
            >
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "#9c9184" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12, fill: "#9c9184" }}
                tickLine={false}
                axisLine={false}
                width={90}
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
              <Bar dataKey="bookings" radius={[0, 6, 6, 0]} barSize={22}>
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
