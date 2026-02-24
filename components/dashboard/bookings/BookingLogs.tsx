"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import BookingStatusBadge from "@/components/dashboard/BookingStatusBadge";
import { useDashboard } from "@/lib/dashboard-context";
import { enrichBookings } from "@/lib/dashboard-helpers";
import { Search, Filter, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";

type BookingStatus =
  | "pending_approval"
  | "confirmed"
  | "reminder_sent"
  | "customer_confirmed"
  | "completed"
  | "no_show"
  | "cancelled_customer"
  | "cancelled_admin"
  | "rejected";

const statusOptions: { label: string; value: BookingStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Completed", value: "completed" },
  { label: "No Show", value: "no_show" },
  { label: "Cancelled", value: "cancelled_customer" },
  { label: "Rejected", value: "rejected" },
];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const SHORT_DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const avatarColors = [
  "bg-[rgba(90,154,110,0.12)] text-[#5a9a6e]",
  "bg-[rgba(196,152,62,0.12)] text-[#c4983e]",
  "bg-[rgba(166,139,107,0.12)] text-[#a68b6b]",
  "bg-[rgba(130,120,180,0.12)] text-[#8278b4]",
  "bg-[rgba(196,90,90,0.12)] text-[#c45a5a]",
  "bg-[rgba(80,140,180,0.12)] text-[#508cb4]",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-MY", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function MiniCalendar({
  year,
  month,
  onPrev,
  onNext,
}: {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const isCurrentOrFuture = year > currentYear || (year === currentYear && month >= currentMonth);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const todayStr = now.toLocaleDateString("en-CA", { timeZone: "Asia/Kuala_Lumpur" });

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="bg-card border border-border rounded-xl p-3 w-fit">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={onPrev}
          className="p-1 rounded-md hover:bg-[rgba(166,139,107,0.08)] transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-[#9c9184]" />
        </button>
        <span className="text-[13px] font-semibold text-foreground">
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          onClick={onNext}
          disabled={isCurrentOrFuture}
          className={`p-1 rounded-md transition-colors ${
            isCurrentOrFuture
              ? "opacity-30 cursor-not-allowed"
              : "hover:bg-[rgba(166,139,107,0.08)]"
          }`}
        >
          <ChevronRight className="w-4 h-4 text-[#9c9184]" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0">
        {SHORT_DAY_NAMES.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-[#9c9184] py-1">
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="w-7 h-7" />;
          }
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isToday = dateStr === todayStr;
          return (
            <div
              key={day}
              className={`w-7 h-7 flex items-center justify-center text-[11px] rounded-md ${
                isToday
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function BookingLogs() {
  const { salonId, customers, services, stylists } = useDashboard();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"time" | "stylist">("time");

  const todayStr = useMemo(() => {
    return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kuala_Lumpur" });
  }, []);

  const { startDate, endDate } = useMemo(() => {
    const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const end = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    return { startDate: start, endDate: end };
  }, [year, month]);

  const bookings = useQuery(api.bookings.queries.getByDateRange, {
    salonId,
    startDate,
    endDate,
  });

  function goToPrevMonth() {
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
    } else {
      setMonth(month - 1);
    }
  }

  function goToNextMonth() {
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const isCurrentOrFuture = year > currentYear || (year === currentYear && month >= currentMonth);
    if (isCurrentOrFuture) return;

    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
    } else {
      setMonth(month + 1);
    }
  }

  if (bookings === undefined) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-12">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="ml-2 text-[13px] text-muted-foreground">Loading booking logs...</span>
        </div>
      </div>
    );
  }

  // Only past bookings (date before today)
  const enriched = enrichBookings(bookings, customers, services, stylists)
    .filter((b) => b.date < todayStr);

  const filtered = enriched
    .filter((b) => {
      if (statusFilter === "all") return true;
      if (statusFilter === "cancelled_customer") {
        return b.status === "cancelled_customer" || b.status === "cancelled_admin";
      }
      return b.status === statusFilter;
    })
    .filter((b) => {
      if (!search) return true;
      const term = search.toLowerCase();
      return (
        b.customerName.toLowerCase().includes(term) ||
        b.serviceName.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      // Most recent first
      const dateComp = b.date.localeCompare(a.date);
      if (dateComp !== 0) return dateComp;
      if (sortBy === "stylist") {
        const stylistComp = a.stylistName.localeCompare(b.stylistName);
        if (stylistComp !== 0) return stylistComp;
      }
      return a.startTime.localeCompare(b.startTime);
    });

  // Group by date
  const grouped = new Map<string, typeof filtered>();
  for (const booking of filtered) {
    const existing = grouped.get(booking.date);
    if (existing) {
      existing.push(booking);
    } else {
      grouped.set(booking.date, [booking]);
    }
  }

  const sortedDates = Array.from(grouped.keys()).sort().reverse();

  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Mini calendar */}
        <div className="flex-shrink-0">
          <MiniCalendar
            year={year}
            month={month}
            onPrev={goToPrevMonth}
            onNext={goToNextMonth}
          />
        </div>

        {/* Filters */}
        <div className="flex-1 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex items-center flex-1 max-w-sm">
              <Search className="absolute left-4 w-4 h-4 text-[#9c9184]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by customer or service..."
                className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2.5 text-[13px] text-foreground placeholder:text-[#9c9184] outline-none focus:ring-1 focus:ring-primary/30 transition-shadow"
              />
            </div>
            <div className="flex items-center gap-2.5 overflow-x-auto">
              <Filter className="w-4 h-4 text-[#9c9184] flex-shrink-0" />
              <div className="flex gap-1.5 flex-wrap">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setStatusFilter(opt.value)}
                    className={`px-2.5 py-1 text-[11px] font-medium transition-colors whitespace-nowrap ${
                      statusFilter === opt.value
                        ? "bg-primary text-primary-foreground rounded-md"
                        : "bg-muted text-muted-foreground rounded-md hover:bg-[rgba(166,139,107,0.08)]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="h-4 w-px bg-border flex-shrink-0 mx-1" />
              <button
                onClick={() => setSortBy(sortBy === "time" ? "stylist" : "time")}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap ${
                  sortBy === "stylist"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-[rgba(166,139,107,0.08)]"
                }`}
              >
                <ArrowUpDown className="w-3 h-3" />
                Stylist
              </button>
            </div>
          </div>

          <p className="text-[12px] text-[#9c9184]">
            {filtered.length} booking{filtered.length !== 1 ? "s" : ""} in {MONTH_NAMES[month]} {year}
          </p>
        </div>
      </div>

      {/* Day-grouped sections */}
      {sortedDates.length === 0 ? (
        <div className="bg-card border border-border rounded-xl py-12 text-center text-[13px] text-[#9c9184]">
          No past bookings for {MONTH_NAMES[month]} {year}
        </div>
      ) : (
        <div className="space-y-8">
          {sortedDates.map((dateStr) => {
            const dayBookings = grouped.get(dateStr)!;
            const label = getDayLabel(dateStr);

            return (
              <div key={dateStr}>
                {/* Day header */}
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-[13px] font-semibold text-foreground">
                    {label}
                  </h3>
                  <span className="text-[11px] text-[#9c9184] font-medium">
                    {dayBookings.length} booking{dayBookings.length !== 1 ? "s" : ""}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Table for this day */}
                <div className="bg-card border border-border rounded-xl overflow-hidden transition-shadow hover:shadow-[0_2px_12px_rgba(42,36,32,0.06)]">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr className="bg-[rgba(166,139,107,0.05)]">
                          <th className="text-left font-label text-[#9c9184] px-4 lg:px-5 py-2.5">
                            Time
                          </th>
                          <th className="text-left font-label text-[#9c9184] px-4 lg:px-5 py-2.5">
                            Customer
                          </th>
                          <th className="text-left font-label text-[#9c9184] px-4 lg:px-5 py-2.5">
                            Service
                          </th>
                          <th className="text-left font-label text-[#9c9184] px-4 lg:px-5 py-2.5 hidden lg:table-cell">
                            Stylist
                          </th>
                          <th className="text-left font-label text-[#9c9184] px-4 lg:px-5 py-2.5 hidden sm:table-cell">
                            Price
                          </th>
                          <th className="text-left font-label text-[#9c9184] px-4 lg:px-5 py-2.5">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {dayBookings.map((booking) => (
                          <tr
                            key={booking._id}
                            className="border-t border-border hover:bg-[rgba(166,139,107,0.05)] transition-colors"
                          >
                            <td className="text-[13px] px-4 lg:px-5 py-3 whitespace-nowrap">
                              <span className="font-medium text-foreground font-data">
                                {booking.startTime}
                              </span>
                              <span className="text-[#9c9184] mx-1">-</span>
                              <span className="font-medium text-foreground font-data">
                                {booking.endTime}
                              </span>
                            </td>
                            <td className="text-[13px] px-4 lg:px-5 py-3">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`w-7 h-7 rounded-md flex items-center justify-center text-[12px] font-semibold flex-shrink-0 ${getAvatarColor(booking.customerName)}`}
                                >
                                  {getInitials(booking.customerName)}
                                </div>
                                <span className="font-medium text-foreground truncate max-w-[120px] lg:max-w-none">
                                  {booking.customerName}
                                </span>
                              </div>
                            </td>
                            <td className="text-[13px] text-muted-foreground px-4 lg:px-5 py-3 truncate max-w-[140px]">
                              {booking.serviceName}
                            </td>
                            <td className="text-[13px] text-muted-foreground px-4 lg:px-5 py-3 hidden lg:table-cell">
                              {booking.stylistName}
                            </td>
                            <td className="text-[13px] text-foreground font-data px-4 lg:px-5 py-3 hidden sm:table-cell whitespace-nowrap">
                              RM {booking.servicePrice}
                            </td>
                            <td className="text-[13px] px-4 lg:px-5 py-3">
                              <BookingStatusBadge status={booking.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
