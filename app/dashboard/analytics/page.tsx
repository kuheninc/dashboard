"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatCard from "@/components/dashboard/StatCard";
import RevenueChart from "@/components/dashboard/charts/RevenueChart";
import ServicePopularityChart from "@/components/dashboard/charts/ServicePopularityChart";
import BookingFunnelChart from "@/components/dashboard/charts/BookingFunnelChart";
import PeakHoursHeatmap from "@/components/dashboard/charts/PeakHoursHeatmap";
import StylistPerformanceChart from "@/components/dashboard/charts/StylistPerformanceChart";
import CustomerRetentionChart from "@/components/dashboard/charts/CustomerRetentionChart";
import BookingTrendChart from "@/components/dashboard/charts/BookingTrendChart";
import { DollarSign, TrendingUp, BarChart3, Users } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Insights on revenue, bookings, and customer behavior.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Monthly Revenue"
          value="RM 8,450"
          trend={{ value: "+12%", positive: true }}
          icon={DollarSign}
          iconColor="text-emerald-600"
        />
        <StatCard
          label="Avg. Booking Value"
          value="RM 78"
          trend={{ value: "+5%", positive: true }}
          icon={TrendingUp}
          iconColor="text-primary"
        />
        <StatCard
          label="Completion Rate"
          value="92%"
          trend={{ value: "+3%", positive: true }}
          icon={BarChart3}
          iconColor="text-violet-600"
        />
        <StatCard
          label="Returning Customers"
          value="68%"
          trend={{ value: "+7%", positive: true }}
          icon={Users}
          iconColor="text-amber-600"
        />
      </div>

      <Tabs defaultValue="revenue">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="revenue" className="text-xs">Revenue</TabsTrigger>
          <TabsTrigger value="bookings" className="text-xs">Bookings</TabsTrigger>
          <TabsTrigger value="customers" className="text-xs">Customers</TabsTrigger>
        </TabsList>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="mt-4 space-y-4">
          <RevenueChart />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ServicePopularityChart />
            <StylistPerformanceChart />
          </div>
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <BookingFunnelChart />
            <BookingTrendChart />
          </div>
          <PeakHoursHeatmap />
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CustomerRetentionChart />
            <StylistPerformanceChart />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
