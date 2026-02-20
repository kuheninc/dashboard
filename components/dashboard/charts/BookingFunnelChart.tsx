"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = [
  "hsl(220, 100%, 50%)",
  "hsl(200, 80%, 50%)",
  "hsl(180, 70%, 45%)",
  "hsl(160, 84%, 39%)",
];

interface BookingFunnelChartProps {
  data: { stage: string; count: number }[];
}

export default function BookingFunnelChart({ data }: BookingFunnelChartProps) {
  return (
    <Card className="shadow-sm border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Booking Funnel</CardTitle>
        <p className="text-xs text-muted-foreground">Request to completion pipeline this month</p>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
              <XAxis
                dataKey="stage"
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
              <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={48}>
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
