"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = [
  "hsl(220, 100%, 50%)",
  "hsl(220, 80%, 60%)",
  "hsl(220, 60%, 68%)",
  "hsl(220, 40%, 75%)",
  "hsl(220, 25%, 82%)",
];

interface ServicePopularityChartProps {
  data: { name: string; bookings: number }[];
}

export default function ServicePopularityChart({ data }: ServicePopularityChartProps) {
  return (
    <Card className="shadow-sm border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Top Services</CardTitle>
        <p className="text-xs text-muted-foreground">By booking count this month</p>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 10, bottom: 0, left: 0 }}
            >
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "hsl(220, 9%, 46%)" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }}
                tickLine={false}
                axisLine={false}
                width={90}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid hsl(220, 13%, 91%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
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
      </CardContent>
    </Card>
  );
}
