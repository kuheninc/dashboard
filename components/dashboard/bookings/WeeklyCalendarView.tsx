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
import RescheduleConfirmDialog from "./RescheduleConfirmDialog";

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTimeStr(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export default function WeeklyCalendarView() {
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

  // Reschedule dialog state
  const [rescheduleDialog, setRescheduleDialog] = useState<{
    booking: EnrichedBooking;
    newDate: string;
    newStartTime: string;
    newEndTime: string;
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
    (event: DragEndEvent) => {
      setActiveDragBooking(null);

      const { active, over } = event;
      if (!over) return;

      const bookingId = active.id as string;
      const dropId = over.id as string;

      // Parse drop target: "drop_{date}_{time}"
      const parts = dropId.split("_");
      if (parts.length < 3 || parts[0] !== "drop") return;
      const newDate = parts[1];
      const newTime = parts[2];

      const booking = enriched.find((b) => b._id === bookingId);
      if (!booking) return;

      // Block dropping on past time slots
      const now = new Date();
      const myt = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kuala_Lumpur" }));
      const nowDateStr = `${myt.getFullYear()}-${String(myt.getMonth() + 1).padStart(2, "0")}-${String(myt.getDate()).padStart(2, "0")}`;
      const nowTimeStr = `${String(myt.getHours()).padStart(2, "0")}:${String(myt.getMinutes()).padStart(2, "0")}`;
      if (newDate < nowDateStr || (newDate === nowDateStr && newTime <= nowTimeStr)) return;

      // Calculate new end time preserving original duration
      const originalDuration =
        toMinutes(booking.endTime) - toMinutes(booking.startTime);
      const newEndTime = minutesToTimeStr(
        toMinutes(newTime) + originalDuration
      );

      // If nothing changed, bail
      if (newDate === booking.date && newTime === booking.startTime) return;

      // Open reschedule confirmation dialog
      setRescheduleDialog({
        booking,
        newDate,
        newStartTime: newTime,
        newEndTime,
      });
    },
    [enriched]
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
    (bookingId: string, newEndTime: string) => {
      const booking = enriched.find((b) => b._id === bookingId);
      if (!booking) return;
      if (newEndTime === booking.endTime) return;

      setRescheduleDialog({
        booking,
        newDate: booking.date,
        newStartTime: booking.startTime,
        newEndTime,
      });
    },
    [enriched]
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
        />
      )}

      {/* Reschedule confirmation dialog */}
      {salon && rescheduleDialog && (
        <RescheduleConfirmDialog
          isOpen={true}
          onClose={() => setRescheduleDialog(null)}
          booking={rescheduleDialog.booking}
          newDate={rescheduleDialog.newDate}
          newStartTime={rescheduleDialog.newStartTime}
          newEndTime={rescheduleDialog.newEndTime}
          stylists={stylists}
          salon={salon}
          salonId={salonId}
        />
      )}
    </div>
  );
}
