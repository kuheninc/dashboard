"use client";

import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useDashboard } from "@/lib/dashboard-context";
import { Bell, X } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

export default function NotificationToast() {
  const { salonId } = useDashboard();
  const notifications = useQuery(api.notifications.queries.getBySalon, { salonId });
  const markRead = useMutation(api.notifications.mutations.markRead);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const seenRef = useRef<Set<string>>(new Set());

  // Find the latest unread notification that hasn't been dismissed
  const latest = notifications?.find((n) => !n.read && !dismissed.has(n._id));

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (!latest) return;
    // Don't re-trigger timer for already-seen notifications
    if (seenRef.current.has(latest._id)) return;
    seenRef.current.add(latest._id);

    const timer = setTimeout(() => {
      setDismissed((prev) => new Set(prev).add(latest._id));
    }, 5000);
    return () => clearTimeout(timer);
  }, [latest]);

  if (!latest) return null;

  return (
    <div className="fixed top-4 right-4 z-[200] animate-in slide-in-from-top-2 fade-in duration-300">
      <div className="flex items-start gap-3 bg-card border border-border rounded-xl shadow-lg px-4 py-3 max-w-[340px]">
        <div
          className="p-1.5 rounded-lg mt-0.5 flex-shrink-0"
          style={{ backgroundColor: "rgba(196,152,62,0.08)" }}
        >
          <Bell className="w-3.5 h-3.5" style={{ color: "#c4983e" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-foreground truncate">
            {latest.title}
          </p>
          <p className="text-[12px] text-muted-foreground truncate">
            {latest.body}
          </p>
        </div>
        <button
          onClick={() => {
            markRead({ notificationId: latest._id as Id<"notifications"> });
            setDismissed((prev) => new Set(prev).add(latest._id));
          }}
          className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:bg-muted/60 transition-colors flex-shrink-0 mt-0.5"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
