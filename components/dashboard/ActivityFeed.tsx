import { CalendarPlus, XCircle, AlertTriangle, CheckCircle2, Inbox } from "lucide-react";
import type { EnrichedBooking } from "@/lib/dashboard-helpers";

type ActivityType = "booking" | "cancellation" | "no_show" | "completed";

interface ActivityItem {
  id: string;
  type: ActivityType;
  customerName: string;
  detail: string;
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
    color: "#c45a5a",
    bg: "rgba(196,90,90,0.06)",
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

function friendlyDate(dateStr: string): string {
  const now = new Date();
  const todayStr = now.toLocaleDateString("en-CA", { timeZone: "Asia/Kuala_Lumpur" });
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toLocaleDateString("en-CA", { timeZone: "Asia/Kuala_Lumpur" });
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toLocaleDateString("en-CA", { timeZone: "Asia/Kuala_Lumpur" });

  if (dateStr === todayStr) return "today";
  if (dateStr === yesterdayStr) return "yesterday";
  if (dateStr === tomorrowStr) return "tomorrow";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-MY", { day: "numeric", month: "short" });
}

function formatTime12h(time24: string): string {
  const d = new Date(`2000-01-01T${time24}`);
  return d.toLocaleTimeString("en-MY", { hour: "numeric", minute: "2-digit", hour12: true });
}

function deriveActivities(bookings: EnrichedBooking[]): ActivityItem[] {
  return bookings.map((b) => {
    let type: ActivityType;
    let detail: string;
    const dateFriendly = friendlyDate(b.date);
    const timeFriendly = formatTime12h(b.startTime);

    if (b.status === "completed") {
      type = "completed";
      detail = `${b.serviceName} marked as completed`;
    } else if (b.status === "no_show") {
      type = "no_show";
      detail = `did not show up for ${b.serviceName}`;
    } else if (b.status === "cancelled_customer" || b.status === "cancelled_admin") {
      type = "cancellation";
      detail = `cancelled ${b.serviceName} appointment`;
    } else {
      type = "booking";
      detail = `requested ${b.serviceName} for ${dateFriendly} at ${timeFriendly}`;
    }

    const ts = new Date(`${b.date}T${b.startTime}:00`).getTime();

    return {
      id: b._id,
      type,
      customerName: b.customerName,
      detail,
      timestamp: ts,
    };
  });
}

function formatTimestamp(ts: number): string {
  const now = new Date();
  const diff = now.getTime() - ts;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;

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
    <div className="bg-card border border-border rounded-xl transition-shadow card-glow">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h3 className="font-display text-[17px] text-foreground">
          Recent Activity
        </h3>
        {activities.length > 0 && (
          <span className="text-[12px] text-primary font-medium hover:text-[#8a7055] cursor-default">
            {activities.length} events
          </span>
        )}
      </div>

      <div className="px-5 py-4 space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Inbox className="w-8 h-8 text-[#9c9184] mx-auto mb-2 opacity-40" />
            <p className="text-[13px] text-[#9c9184]">No recent activity</p>
            <p className="text-[11px] text-[#9c9184] mt-0.5 opacity-60">New bookings and updates will appear here</p>
          </div>
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
                    <span className="font-semibold">{activity.customerName}</span>{" "}
                    <span className="text-[#6b6058]">{activity.detail}</span>
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
