"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface StylistPerformanceChartProps {
  data: { name: string; bookings: number; completed: number; noShows: number }[];
}

export default function StylistPerformanceChart({ data }: StylistPerformanceChartProps) {
  return (
    <Card className="shadow-sm border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Stylist Performance</CardTitle>
        <p className="text-xs text-muted-foreground">Bookings and completions this month</p>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(220, 9%, 46%)" }}
                tickLine={false}
                axisLine={false}
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
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
              />
              <Bar dataKey="completed" name="Completed" fill="hsl(220, 100%, 50%)" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="noShows" name="No Shows" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
