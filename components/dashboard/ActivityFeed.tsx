import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarPlus, XCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EnrichedBooking } from "@/lib/dashboard-helpers";

type ActivityType = "booking" | "cancellation" | "no_show" | "completed";

interface ActivityItem {
  id: string;
  type: ActivityType;
  message: string;
  timestamp: number;
}

const typeConfig = {
  booking: { icon: CalendarPlus, color: "text-blue-500", bg: "bg-blue-50" },
  cancellation: { icon: XCircle, color: "text-gray-500", bg: "bg-gray-50" },
  no_show: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50" },
  completed: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
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
    <Card className="shadow-sm border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
        ) : (
          activities.map((activity) => {
            const config = typeConfig[activity.type];
            const Icon = config.icon;
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={cn("p-1.5 rounded-lg mt-0.5", config.bg)}>
                  <Icon className={cn("w-3.5 h-3.5", config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-snug">{activity.message}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {formatTimestamp(activity.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
