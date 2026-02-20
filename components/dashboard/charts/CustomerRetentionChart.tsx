"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const COLORS = ["#a68b6b", "#d1b799"];

interface CustomerRetentionChartProps {
  data: { name: string; value: number }[];
}

export default function CustomerRetentionChart({ data }: CustomerRetentionChartProps) {
  return (
    <div className="bg-card border border-border rounded-[14px]">
      <div className="px-[22px] py-[18px] border-b border-border">
        <h3 className="font-display text-[17px] text-foreground">Customer Retention</h3>
        <p className="text-xs text-muted-foreground mt-0.5">New vs returning customers this month</p>
      </div>
      <div className="px-[22px] py-[18px]">
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#faf7f2",
                  border: "1px solid rgba(42,36,32,0.08)",
                  borderRadius: "10px",
                  fontSize: "12px",
                  boxShadow: "0 4px 16px rgba(42,36,32,0.06)",
                  fontFamily: "'General Sans', sans-serif",
                }}
                formatter={(value) => [`${value}%`, ""]}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "12px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
