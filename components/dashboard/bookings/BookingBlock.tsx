"use client";

import { useCallback, useRef, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { EnrichedBooking } from "@/lib/dashboard-helpers";

export interface StylistColor {
  bg: string;
  border: string;
  text: string;
}

interface BookingBlockProps {
  booking: EnrichedBooking;
  stylistColor: StylistColor;
  top: number;
  height: number;
  left: string;
  width: string;
  isDraggable: boolean;
  isPast: boolean;
  onClick: (e: React.MouseEvent) => void;
  onResize?: (bookingId: string, newEndTime: string) => void;
  rowHeight: number;
}

export default function BookingBlock({
  booking,
  stylistColor,
  top,
  height,
  left,
  width,
  isDraggable: canDrag,
  isPast,
  onClick,
  onResize,
  rowHeight,
}: BookingBlockProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: booking._id,
      disabled: !canDrag,
      data: { booking },
    });

  const [isResizing, setIsResizing] = useState(false);
  const [resizeDelta, setResizeDelta] = useState(0);
  const resizeStartY = useRef(0);
  const resizeStartHeight = useRef(0);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      if (!canDrag || !onResize) return;
      e.stopPropagation();
      e.preventDefault();
      setIsResizing(true);
      resizeStartY.current = e.clientY;
      resizeStartHeight.current = height;
      setResizeDelta(0);

      const handleMove = (ev: MouseEvent) => {
        const delta = ev.clientY - resizeStartY.current;
        // Snap to 15-min increments
        const snapped = Math.round(delta / rowHeight) * rowHeight;
        setResizeDelta(snapped);
      };

      const handleUp = (ev: MouseEvent) => {
        window.removeEventListener("mousemove", handleMove);
        window.removeEventListener("mouseup", handleUp);
        setIsResizing(false);

        const delta = ev.clientY - resizeStartY.current;
        const snapped = Math.round(delta / rowHeight) * rowHeight;
        const newHeight = Math.max(rowHeight, resizeStartHeight.current + snapped);
        const durationMinutes = (newHeight / rowHeight) * 15;

        // Calculate new end time
        const [h, m] = booking.startTime.split(":").map(Number);
        const totalMinutes = h * 60 + m + durationMinutes;
        const endH = Math.floor(totalMinutes / 60) % 24;
        const endM = totalMinutes % 60;
        const newEndTime = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;

        if (newEndTime !== booking.endTime) {
          onResize(booking._id, newEndTime);
        }
        setResizeDelta(0);
      };

      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleUp);
    },
    [canDrag, onResize, height, rowHeight, booking.startTime, booking.endTime, booking._id]
  );

  const style: React.CSSProperties = {
    position: "absolute",
    top,
    left,
    width,
    height: isResizing
      ? Math.max(rowHeight, height + resizeDelta)
      : height,
    zIndex: isDragging ? 50 : isResizing ? 40 : 10,
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    opacity: isDragging ? 0.5 : isPast ? 0.5 : 1,
    transition: isResizing ? "none" : undefined,
  };

  const isCompact = height < 40;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group cursor-pointer select-none"
      onClick={onClick}
      {...(canDrag ? { ...attributes, ...listeners } : {})}
    >
      <div
        className="h-full rounded-md overflow-hidden border-l-[3px] px-1.5 py-0.5"
        style={{
          backgroundColor: stylistColor.bg,
          borderLeftColor: stylistColor.border,
        }}
      >
        {isCompact ? (
          <div className="flex items-center gap-1 h-full">
            <span
              className="text-[10px] font-medium truncate"
              style={{ color: stylistColor.text }}
            >
              {booking.customerName}
            </span>
            <span className="text-[9px] text-muted-foreground truncate">
              {booking.serviceName}
            </span>
          </div>
        ) : (
          <>
            <p
              className="text-[11px] font-medium truncate leading-tight"
              style={{ color: stylistColor.text }}
            >
              {booking.customerName}
            </p>
            <p className="text-[10px] text-muted-foreground truncate leading-tight">
              {booking.serviceName}
            </p>
            {height >= 56 && (
              <p className="text-[9px] text-muted-foreground font-data leading-tight">
                {booking.startTime} – {booking.endTime}
              </p>
            )}
          </>
        )}
      </div>

      {/* Resize handle */}
      {canDrag && onResize && (
        <div
          className="absolute bottom-0 left-0 right-0 h-1.5 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ backgroundColor: stylistColor.border }}
          onMouseDown={handleResizeStart}
        />
      )}
    </div>
  );
}
