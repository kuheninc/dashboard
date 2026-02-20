"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { DashboardProvider } from "@/lib/dashboard-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <DashboardProvider>
      <div className="flex h-screen overflow-hidden bg-muted/20">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(true)} />

          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}
