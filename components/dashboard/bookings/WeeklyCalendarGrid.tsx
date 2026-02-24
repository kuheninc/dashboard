"use client";

import { useMemo, useRef } from "react";
import { useDroppable } from "@dnd-kit/core";
import type { Doc } from "@/convex/_generated/dataModel";
import type { EnrichedBooking } from "@/lib/dashboard-helpers";
import BookingBlock, { type StylistColor } from "./BookingBlock";
import { format, isToday } from "date-fns";

const START_HOUR = 7;
const END_HOUR = 22;
const TOTAL_SLOTS = (END_HOUR - START_HOUR) * 4; // 60 slots (15-min each)
const ROW_HEIGHT = 16; // px per 15-min slot
const HOUR_HEIGHT = ROW_HEIGHT * 4; // 64px per hour

export const STYLIST_COLORS: StylistColor[] = [
  { bg: "rgba(90,154,110,0.15)", border: "#5a9a6e", text: "#3d7a4f" },
  { bg: "rgba(196,152,62,0.15)", border: "#c4983e", text: "#9a7520" },
  { bg: "rgba(130,120,180,0.15)", border: "#8278b4", text: "#5f5694" },
  { bg: "rgba(80,140,180,0.15)", border: "#508cb4", text: "#3a6f94" },
  { bg: "rgba(196,90,90,0.15)", border: "#c45a5a", text: "#a03f3f" },
  { bg: "rgba(166,139,107,0.15)", border: "#a68b6b", text: "#8a7055" },
  { bg: "rgba(180,140,80,0.15)", border: "#b48c50", text: "#8a6a30" },
  { bg: "rgba(100,170,150,0.15)", border: "#64aa96", text: "#4a8a76" },
];

export function getStylistColor(
  stylistId: string,
  stylists: Doc<"stylists">[]
): StylistColor {
  const sorted = [...stylists]
    .filter((s) => s.isActive)
    .sort((a, b) => a.name.localeCompare(b.name));
  const idx = sorted.findIndex((s) => s._id === stylistId);
  return STYLIST_COLORS[(idx >= 0 ? idx : 0) % STYLIST_COLORS.length];
}

const ACTIVE_STATUSES = [
  "pending_approval",
  "confirmed",
  "reminder_sent",
  "customer_confirmed",
  "reschedule_pending",
];

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTimeStr(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// Layout overlapping bookings in the same column
interface LayoutBlock {
  booking: EnrichedBooking;
  columnIndex: number;
  totalColumns: number;
}

function layoutOverlapping(bookings: EnrichedBooking[]): LayoutBlock[] {
  if (bookings.length === 0) return [];

  const sorted = [...bookings].sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  );

  const result: LayoutBlock[] = [];
  const groups: EnrichedBooking[][] = [];

  // Group overlapping bookings
  let currentGroup: EnrichedBooking[] = [sorted[0]];
  let groupEnd = toMinutes(sorted[0].endTime);

  for (let i = 1; i < sorted.length; i++) {
    const bStart = toMinutes(sorted[i].startTime);
    if (bStart < groupEnd) {
      currentGroup.push(sorted[i]);
      groupEnd = Math.max(groupEnd, toMinutes(sorted[i].endTime));
    } else {
      groups.push(currentGroup);
      currentGroup = [sorted[i]];
      groupEnd = toMinutes(sorted[i].endTime);
    }
  }
  groups.push(currentGroup);

  // Assign columns within each group
  for (const group of groups) {
    const columns: EnrichedBooking[][] = [];
    for (const booking of group) {
      const bStart = toMinutes(booking.startTime);
      let placed = false;
      for (let c = 0; c < columns.length; c++) {
        const lastInCol = columns[c][columns[c].length - 1];
        if (toMinutes(lastInCol.endTime) <= bStart) {
          columns[c].push(booking);
          placed = true;
          break;
        }
      }
      if (!placed) {
        columns.push([booking]);
      }
    }
    for (let c = 0; c < columns.length; c++) {
      for (const booking of columns[c]) {
        result.push({
          booking,
          columnIndex: c,
          totalColumns: columns.length,
        });
      }
    }
  }

  return result;
}

// Droppable cell component
function DropCell({
  id,
}: {
  id: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className="relative"
      style={{
        height: ROW_HEIGHT,
        backgroundColor: isOver ? "rgba(166,139,107,0.08)" : undefined,
      }}
    />
  );
}

interface WeeklyCalendarGridProps {
  days: Date[];
  bookings: EnrichedBooking[];
  stylists: Doc<"stylists">[];
  viewMode: "unified" | "per-stylist";
  todayStr: string;
  onBookingClick: (booking: EnrichedBooking, rect: DOMRect) => void;
  onBookingResize: (bookingId: string, newEndTime: string) => void;
}

export default function WeeklyCalendarGrid({
  days,
  bookings,
  stylists,
  viewMode,
  todayStr,
  onBookingClick,
  onBookingResize,
}: WeeklyCalendarGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeStylistsSorted = useMemo(
    () =>
      [...stylists]
        .filter((s) => s.isActive)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [stylists]
  );

  // Group bookings by date
  const bookingsByDate = useMemo(() => {
    const map = new Map<string, EnrichedBooking[]>();
    for (const b of bookings) {
      const existing = map.get(b.date);
      if (existing) existing.push(b);
      else map.set(b.date, [b]);
    }
    return map;
  }, [bookings]);

  // Filter bookings for display based on date
  const getVisibleBookings = (dateStr: string) => {
    const dayBookings = bookingsByDate.get(dateStr) ?? [];
    const isPast = dateStr < todayStr;
    if (isPast) return dayBookings; // Show all for past
    return dayBookings.filter((b) => ACTIVE_STATUSES.includes(b.status));
  };

  const numColumns =
    viewMode === "per-stylist"
      ? days.length * activeStylistsSorted.length
      : days.length;

  // Current time indicator
  const currentTimeTop = useMemo(() => {
    const now = new Date();
    const myt = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Kuala_Lumpur" })
    );
    const minutes = (myt.getHours() - START_HOUR) * 60 + myt.getMinutes();
    if (minutes < 0 || minutes > (END_HOUR - START_HOUR) * 60) return null;
    return (minutes / 15) * ROW_HEIGHT;
  }, []);

  // Find today's column index for the time indicator
  const todayColStart = useMemo(() => {
    const idx = days.findIndex(
      (d) => format(d, "yyyy-MM-dd") === todayStr
    );
    if (idx < 0) return null;
    if (viewMode === "per-stylist")
      return idx * activeStylistsSorted.length;
    return idx;
  }, [days, todayStr, viewMode, activeStylistsSorted.length]);

  const todayColSpan =
    viewMode === "per-stylist" ? activeStylistsSorted.length : 1;

  const gridTemplateColumns =
    viewMode === "per-stylist"
      ? `60px repeat(${numColumns}, minmax(80px, 1fr))`
      : `60px repeat(7, 1fr)`;

  const hours = Array.from(
    { length: END_HOUR - START_HOUR },
    (_, i) => START_HOUR + i
  );

  return (
    <div className="flex flex-col h-full">
      {/* Day headers */}
      {viewMode === "unified" ? (
        <div
          className="grid border-b border-border shrink-0"
          style={{ gridTemplateColumns }}
        >
          {/* Empty corner */}
          <div className="border-r border-border" />

          {days.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const today = isToday(day);
            return (
              <div
                key={dateStr}
                className={`text-center py-2 border-r border-border last:border-r-0 ${
                  today ? "bg-primary" : ""
                }`}
              >
                <p
                  className={`text-[10px] font-label uppercase ${
                    today ? "text-white/70" : "text-muted-foreground"
                  }`}
                >
                  {format(day, "EEE")}
                </p>
                <p
                  className={`text-[15px] font-data font-medium ${
                    today ? "text-white" : "text-foreground"
                  }`}
                >
                  {format(day, "d")}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <>
          {/* Date row */}
          <div
            className="grid border-b border-border shrink-0"
            style={{ gridTemplateColumns }}
          >
            <div className="border-r border-border" />
            {days.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const today = isToday(day);
              return (
                <div
                  key={dateStr}
                  className={`text-center py-1.5 border-r border-border last:border-r-0 ${
                    today ? "bg-primary" : ""
                  }`}
                  style={{ gridColumn: `span ${activeStylistsSorted.length}` }}
                >
                  <p
                    className={`text-[10px] font-label uppercase ${
                      today ? "text-white/70" : "text-muted-foreground"
                    }`}
                  >
                    {format(day, "EEE")}
                  </p>
                  <p
                    className={`text-[15px] font-data font-medium ${
                      today ? "text-white" : "text-foreground"
                    }`}
                  >
                    {format(day, "d")}
                  </p>
                </div>
              );
            })}
          </div>
          {/* Stylist row */}
          <div
            className="grid border-b border-border shrink-0"
            style={{ gridTemplateColumns }}
          >
            <div className="border-r border-border" />
            {days.flatMap((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const today = isToday(day);
              return activeStylistsSorted.map((stylist) => (
                <div
                  key={`${dateStr}-${stylist._id}`}
                  className={`text-center py-1.5 border-r border-border last:border-r-0 ${
                    today ? "bg-primary" : ""
                  }`}
                >
                  <p
                    className={`text-[10px] font-medium truncate px-1 ${
                      today ? "text-white/90" : ""
                    }`}
                    style={{
                      color: today
                        ? undefined
                        : getStylistColor(stylist._id, stylists).text,
                    }}
                  >
                    {stylist.name}
                  </p>
                </div>
              ));
            })}
          </div>
        </>
      )}

      {/* Scrollable grid body */}
      <div
        ref={scrollRef}
        data-calendar-scroll
        className="overflow-x-auto flex-1 relative pt-6"
      >
        <div
          className="grid relative"
          style={{
            gridTemplateColumns,
            minHeight: TOTAL_SLOTS * ROW_HEIGHT,
          }}
        >
          {/* Time gutter */}
          <div className="border-r border-border relative">
            {hours.map((hour) => (
              <div
                key={hour}
                className="absolute right-2 text-[10px] font-data text-muted-foreground"
                style={{
                  top: (hour - START_HOUR) * HOUR_HEIGHT - 6,
                }}
              >
                {hour === 0
                  ? "12 AM"
                  : hour < 12
                    ? `${hour} AM`
                    : hour === 12
                      ? "12 PM"
                      : `${hour - 12} PM`}
              </div>
            ))}
          </div>

          {/* Day columns with drop cells */}
          {viewMode === "unified"
            ? days.map((day) => {
                const dateStr = format(day, "yyyy-MM-dd");
                const dayBookings = getVisibleBookings(dateStr);
                const isPast = dateStr < todayStr;
                const layoutBlocks = layoutOverlapping(dayBookings);

                return (
                  <div
                    key={dateStr}
                    className="relative border-r border-border last:border-r-0"
                  >
                    {/* Drop cells */}
                    {Array.from({ length: TOTAL_SLOTS }, (_, i) => {
                      const minutes =
                        START_HOUR * 60 + i * 15;
                      const timeStr = minutesToTimeStr(minutes);
                      return (
                        <DropCell
                          key={i}
                          id={`drop_${dateStr}_${timeStr}`}
                        />
                      );
                    })}

                    {/* Booking blocks */}
                    {layoutBlocks.map(
                      ({ booking, columnIndex, totalColumns }) => {
                        const startMin =
                          toMinutes(booking.startTime) -
                          START_HOUR * 60;
                        const endMin =
                          toMinutes(booking.endTime) -
                          START_HOUR * 60;
                        const top =
                          (startMin / 15) * ROW_HEIGHT;
                        const height =
                          ((endMin - startMin) / 15) *
                          ROW_HEIGHT;
                        const widthPct =
                          100 / totalColumns;
                        const leftPct =
                          columnIndex * widthPct;

                        return (
                          <BookingBlock
                            key={booking._id}
                            booking={booking}
                            stylistColor={getStylistColor(
                              booking.stylistId,
                              stylists
                            )}
                            top={top}
                            height={Math.max(
                              ROW_HEIGHT,
                              height
                            )}
                            left={`${leftPct}%`}
                            width={`${widthPct - 1}%`}
                            isDraggable={
                              !isPast &&
                              ACTIVE_STATUSES.includes(
                                booking.status
                              )
                            }
                            isPast={isPast}
                            onClick={(e) => {
                              const rect = (
                                e.currentTarget as HTMLElement
                              ).getBoundingClientRect();
                              onBookingClick(
                                booking,
                                rect
                              );
                            }}
                            onResize={
                              !isPast
                                ? onBookingResize
                                : undefined
                            }
                            rowHeight={ROW_HEIGHT}
                          />
                        );
                      }
                    )}
                  </div>
                );
              })
            : // Per-stylist mode
              days.flatMap((day) => {
                const dateStr = format(day, "yyyy-MM-dd");
                const dayBookings = getVisibleBookings(dateStr);
                const isPast = dateStr < todayStr;

                return activeStylistsSorted.map((stylist) => {
                  const stylistBookings = dayBookings.filter(
                    (b) => b.stylistId === stylist._id
                  );

                  return (
                    <div
                      key={`${dateStr}-${stylist._id}`}
                      className="relative border-r border-border last:border-r-0"
                    >
                      {Array.from(
                        { length: TOTAL_SLOTS },
                        (_, i) => {
                          const minutes =
                            START_HOUR * 60 + i * 15;
                          const timeStr =
                            minutesToTimeStr(minutes);
                          return (
                            <DropCell
                              key={i}
                              id={`drop_${dateStr}_${timeStr}`}
                              rowIdx={i}
                            />
                          );
                        }
                      )}

                      {stylistBookings.map((booking) => {
                        const startMin =
                          toMinutes(booking.startTime) -
                          START_HOUR * 60;
                        const endMin =
                          toMinutes(booking.endTime) -
                          START_HOUR * 60;
                        const top =
                          (startMin / 15) * ROW_HEIGHT;
                        const height =
                          ((endMin - startMin) / 15) *
                          ROW_HEIGHT;

                        return (
                          <BookingBlock
                            key={booking._id}
                            booking={booking}
                            stylistColor={getStylistColor(
                              booking.stylistId,
                              stylists
                            )}
                            top={top}
                            height={Math.max(
                              ROW_HEIGHT,
                              height
                            )}
                            left="0%"
                            width="98%"
                            isDraggable={
                              !isPast &&
                              ACTIVE_STATUSES.includes(
                                booking.status
                              )
                            }
                            isPast={isPast}
                            onClick={(e) => {
                              const rect = (
                                e.currentTarget as HTMLElement
                              ).getBoundingClientRect();
                              onBookingClick(
                                booking,
                                rect
                              );
                            }}
                            onResize={
                              !isPast
                                ? onBookingResize
                                : undefined
                            }
                            rowHeight={ROW_HEIGHT}
                          />
                        );
                      })}
                    </div>
                  );
                });
              })}

          {/* Hour and half-hour grid lines */}
          {hours.flatMap((hour) => {
            const y = (hour - START_HOUR) * HOUR_HEIGHT;
            return [
              <div
                key={`hline-${hour}`}
                className="absolute pointer-events-none"
                style={{
                  top: y,
                  left: 60,
                  right: 0,
                  borderTop: "1px solid var(--color-border)",
                }}
              />,
              <div
                key={`hline-half-${hour}`}
                className="absolute pointer-events-none"
                style={{
                  top: y + HOUR_HEIGHT / 2,
                  left: 60,
                  right: 0,
                  borderTop: "1px dashed rgba(166,139,107,0.12)",
                }}
              />,
            ];
          })}

          {/* Current time indicator */}
          {currentTimeTop !== null && todayColStart !== null && (
            <div
              className="absolute pointer-events-none z-30"
              style={{
                top: currentTimeTop,
                left: `calc(60px + ${todayColStart} * ((100% - 60px) / ${numColumns}))`,
                width: `calc(${todayColSpan} * ((100% - 60px) / ${numColumns}))`,
              }}
            >
              <div className="relative">
                <div className="absolute -left-1.5 -top-1.5 w-3 h-3 rounded-full bg-[#c45a5a]" />
                <div className="h-[2px] bg-[#c45a5a] w-full" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
