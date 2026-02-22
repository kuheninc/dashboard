"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const COLORS = ["#a68b6b", "#d1b799"];

interface CustomerRetentionChartProps {
  data: { name: string; value: number }[];
}

export default function CustomerRetentionChart({ data }: CustomerRetentionChartProps) {
  return (
    <div className="bg-card border border-border rounded-xl">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-display text-[15px] text-foreground">Customer Retention</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">New vs returning customers this month</p>
      </div>
      <div className="px-5 py-4">
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="45%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" strokeWidth={0}>
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#faf7f2", border: "1px solid rgba(42,36,32,0.06)", borderRadius: "8px", fontSize: "12px", boxShadow: "0 4px 12px rgba(42,36,32,0.06)", fontFamily: "'Inter', sans-serif" }} formatter={(value) => [`${value}%`, ""]} />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: "11px", fontFamily: "'Inter', sans-serif" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
