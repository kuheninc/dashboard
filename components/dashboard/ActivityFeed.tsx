import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarPlus, XCircle, AlertTriangle, UserPlus, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockActivities } from "@/lib/mock-data";
import { format, parseISO } from "date-fns";

const typeConfig = {
  booking: { icon: CalendarPlus, color: "text-blue-500", bg: "bg-blue-50" },
  cancellation: { icon: XCircle, color: "text-gray-500", bg: "bg-gray-50" },
  no_show: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50" },
  new_customer: { icon: UserPlus, color: "text-emerald-500", bg: "bg-emerald-50" },
  completed: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
};

export default function ActivityFeed() {
  return (
    <Card className="shadow-sm border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockActivities.slice(0, 8).map((activity) => {
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
                  {format(parseISO(activity.timestamp), "MMM d, h:mm a")}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
