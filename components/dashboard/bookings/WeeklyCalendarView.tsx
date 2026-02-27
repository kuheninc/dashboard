"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  useSensor,
  useSensors,
  PointerSensor,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  eachDayOfInterval,
  format,
} from "date-fns";
import { useDashboard } from "@/lib/dashboard-context";
import {
  enrichBookings,
  type EnrichedBooking,
} from "@/lib/dashboard-helpers";
import WeeklyCalendarToolbar from "./WeeklyCalendarToolbar";
import WeeklyCalendarGrid, { getStylistColor } from "./WeeklyCalendarGrid";
import BookingBlock from "./BookingBlock";
import BookingPopover from "./BookingPopover";

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTimeStr(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

interface WeeklyCalendarViewProps {
  onOpenDetail?: (booking: EnrichedBooking) => void;
}

export default function WeeklyCalendarView({ onOpenDetail }: WeeklyCalendarViewProps) {
  const { salonId, salon, customers, services, stylists } = useDashboard();

  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [viewMode, setViewMode] = useState<"unified" | "per-stylist">(
    "unified"
  );

  // Drag state
  const [activeDragBooking, setActiveDragBooking] =
    useState<EnrichedBooking | null>(null);

  // Popover state
  const [popover, setPopover] = useState<{
    booking: EnrichedBooking;
    rect: DOMRect;
  } | null>(null);

  const weekEnd = useMemo(
    () => endOfWeek(currentWeekStart, { weekStartsOn: 1 }),
    [currentWeekStart]
  );

  const days = useMemo(
    () => eachDayOfInterval({ start: currentWeekStart, end: weekEnd }),
    [currentWeekStart, weekEnd]
  );

  const startDate = format(currentWeekStart, "yyyy-MM-dd");
  const endDate = format(weekEnd, "yyyy-MM-dd");

  const bookings = useQuery(api.bookings.queries.getByDateRange, {
    salonId,
    startDate,
    endDate,
  });

  const enriched = useMemo(() => {
    if (!bookings) return [];
    return enrichBookings(bookings, customers, services, stylists);
  }, [bookings, customers, services, stylists]);

  const todayStr = useMemo(
    () =>
      new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Kuala_Lumpur",
      }),
    []
  );

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const bookingId = event.active.id as string;
      const booking = enriched.find((b) => b._id === bookingId);
      if (booking) {
        setActiveDragBooking(booking);
        setPopover(null); // Close popover when dragging
      }
    },
    [enriched]
  );

  const handleDragEnd = useCallback(
    (_event: DragEndEvent) => {
      setActiveDragBooking(null);
    },
    []
  );

  const handleBookingClick = useCallback(
    (booking: EnrichedBooking, rect: DOMRect) => {
      // Don't open popover if we just finished dragging
      if (activeDragBooking) return;
      setPopover({ booking, rect });
    },
    [activeDragBooking]
  );

  const handleBookingResize = useCallback(
    (_bookingId: string, _newEndTime: string) => {
      // Reschedule removed — resize is a no-op
    },
    []
  );

  // Navigation
  const goToday = () =>
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const goPrev = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  const goNext = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden transition-shadow hover:shadow-[0_2px_12px_rgba(42,36,32,0.06)]">
      <WeeklyCalendarToolbar
        weekStart={currentWeekStart}
        weekEnd={weekEnd}
        onPrevWeek={goPrev}
        onNextWeek={goNext}
        onToday={goToday}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div className="relative">
        {bookings === undefined ? (
          <div className="flex items-center justify-center h-full">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="ml-2 text-[13px] text-muted-foreground">
              Loading...
            </span>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <WeeklyCalendarGrid
              days={days}
              bookings={enriched}
              stylists={stylists}
              viewMode={viewMode}
              todayStr={todayStr}
              onBookingClick={handleBookingClick}
              onBookingResize={handleBookingResize}
            />

            <DragOverlay dropAnimation={null}>
              {activeDragBooking && (
                <div style={{ width: 120, opacity: 0.85 }}>
                  <BookingBlock
                    booking={activeDragBooking}
                    stylistColor={getStylistColor(
                      activeDragBooking.stylistId,
                      stylists
                    )}
                    top={0}
                    height={48}
                    left="0"
                    width="100%"
                    isDraggable={false}
                    isPast={false}
                    onClick={() => {}}
                    rowHeight={16}
                  />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Popover */}
      {popover && (
        <BookingPopover
          booking={popover.booking}
          stylistColor={getStylistColor(
            popover.booking.stylistId,
            stylists
          )}
          anchorRect={popover.rect}
          onClose={() => setPopover(null)}
          onOpenDetail={onOpenDetail ? () => {
            setPopover(null);
            onOpenDetail(popover.booking);
          } : undefined}
        />
      )}

    </div>
  );
}
