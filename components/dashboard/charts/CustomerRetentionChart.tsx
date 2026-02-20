"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const COLORS = ["hsl(220, 100%, 50%)", "hsl(220, 60%, 78%)"];

interface CustomerRetentionChartProps {
  data: { name: string; value: number }[];
}

export default function CustomerRetentionChart({ data }: CustomerRetentionChartProps) {
  return (
    <Card className="shadow-sm border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Customer Retention</CardTitle>
        <p className="text-xs text-muted-foreground">New vs returning customers this month</p>
      </CardHeader>
      <CardContent className="pt-2">
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
                  backgroundColor: "white",
                  border: "1px solid hsl(220, 13%, 91%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
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
      </CardContent>
    </Card>
  );
}
