import { CalendarPlus, XCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { EnrichedBooking } from "@/lib/dashboard-helpers";

type ActivityType = "booking" | "cancellation" | "no_show" | "completed";

interface ActivityItem {
  id: string;
  type: ActivityType;
  message: string;
  timestamp: number;
}

const typeConfig = {
  booking: {
    icon: CalendarPlus,
    color: "#c4983e",
    bg: "rgba(196,152,62,0.08)",
  },
  cancellation: {
    icon: XCircle,
    color: "#9c9184",
    bg: "rgba(166,139,107,0.05)",
  },
  no_show: {
    icon: AlertTriangle,
    color: "#c45a5a",
    bg: "rgba(196,90,90,0.08)",
  },
  completed: {
    icon: CheckCircle2,
    color: "#5a9a6e",
    bg: "rgba(90,154,110,0.08)",
  },
};

function deriveActivities(bookings: EnrichedBooking[]): ActivityItem[] {
  return bookings.map((b) => {
    let type: ActivityType;
    let message: string;

    if (b.status === "completed") {
      type = "completed";
      message = `${b.customerName}'s ${b.serviceName} marked as completed`;
    } else if (b.status === "no_show") {
      type = "no_show";
      message = `${b.customerName} did not show up for ${b.serviceName}`;
    } else if (b.status === "cancelled_customer" || b.status === "cancelled_admin") {
      type = "cancellation";
      message = `${b.customerName} cancelled ${b.serviceName} appointment`;
    } else {
      // pending_approval, confirmed, reminder_sent, customer_confirmed
      type = "booking";
      message = `${b.customerName} requested ${b.serviceName} for ${b.date} at ${b.startTime}`;
    }

    // Use the booking date + startTime to derive a timestamp for sorting
    const ts = new Date(`${b.date}T${b.startTime}:00`).getTime();

    return {
      id: b._id,
      type,
      message,
      timestamp: ts,
    };
  });
}

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString("en-MY", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

interface ActivityFeedProps {
  bookings: EnrichedBooking[];
}

export default function ActivityFeed({ bookings }: ActivityFeedProps) {
  const activities = deriveActivities(bookings)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 8);

  return (
    <div className="bg-card border border-border rounded-[14px] transition-shadow hover:shadow-[0_4px_16px_rgba(42,36,32,0.06)]">
      <div className="px-[22px] py-[18px] border-b border-border flex items-center justify-between">
        <h3 className="font-display text-[17px] text-foreground">
          Recent Activity
        </h3>
        {activities.length > 0 && (
          <span className="text-[12px] text-primary font-medium hover:text-[#8a7055] cursor-default">
            {activities.length} events
          </span>
        )}
      </div>

      <div className="px-[22px] py-[18px] space-y-4">
        {activities.length === 0 ? (
          <p className="text-[13px] text-muted-foreground text-center py-6">
            No recent activity
          </p>
        ) : (
          activities.map((activity) => {
            const config = typeConfig[activity.type];
            const Icon = config.icon;
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div
                  className="p-1.5 rounded-lg mt-0.5 flex-shrink-0"
                  style={{ backgroundColor: config.bg }}
                >
                  <Icon
                    className="w-3.5 h-3.5"
                    style={{ color: config.color }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-foreground leading-snug">
                    {activity.message}
                  </p>
                  <p className="text-[11px] text-[#9c9184] mt-0.5">
                    {formatTimestamp(activity.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
