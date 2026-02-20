"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = ["#a68b6b", "#c4a67e", "#5a9a6e"];

interface BookingFunnelChartProps {
  data: { stage: string; count: number }[];
}

export default function BookingFunnelChart({ data }: BookingFunnelChartProps) {
  return (
    <div className="bg-card border border-border rounded-[14px]">
      <div className="px-[22px] py-[18px] border-b border-border">
        <h3 className="font-display text-[17px] text-foreground">Booking Funnel</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Request to completion pipeline this month</p>
      </div>
      <div className="px-[22px] py-[18px]">
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
              <XAxis
                dataKey="stage"
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
              <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={48}>
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
