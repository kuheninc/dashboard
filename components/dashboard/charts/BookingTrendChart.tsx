"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, parseISO } from "date-fns";

interface BookingTrendChartProps {
  data: { date: string; value: number }[];
}

export default function BookingTrendChart({ data: rawData }: BookingTrendChartProps) {
  const data = rawData.map((d) => ({
    ...d,
    label: format(parseISO(d.date), "MMM d"),
  }));

  return (
    <Card className="shadow-sm border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Booking Trends</CardTitle>
        <p className="text-xs text-muted-foreground">Daily bookings over the last 30 days</p>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="bookingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(220, 100%, 50%)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="hsl(220, 100%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "hsl(220, 9%, 46%)" }}
                tickLine={false}
                axisLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(220, 9%, 46%)" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid hsl(220, 13%, 91%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
                labelStyle={{ fontWeight: 600, marginBottom: 4 }}
              />
              <Area
                type="monotone"
                dataKey="value"
                name="Bookings"
                stroke="hsl(220, 100%, 50%)"
                strokeWidth={2}
                fill="url(#bookingGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
