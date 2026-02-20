import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Phone, Calendar, CheckCircle2 } from "lucide-react";
import type { Doc } from "@/convex/_generated/dataModel";

interface StylistCardProps {
  stylist: Doc<"stylists">;
  stats?: { bookings: number; completed: number; noShows: number };
}

export default function StylistCard({ stylist, stats }: StylistCardProps) {
  const completionRate =
    stats && stats.bookings > 0
      ? Math.round((stats.completed / stats.bookings) * 100)
      : 0;

  return (
    <Card className="shadow-sm border-border/60 hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              {stylist.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">{stylist.name}</h3>
              <Badge
                variant="outline"
                className={`text-[11px] ${
                  stylist.isActive
                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                    : "bg-gray-100 text-gray-500 border-gray-200"
                }`}
              >
                {stylist.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            {stylist.phone && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                <Phone className="w-3 h-3" />
                <span className="font-mono">+{stylist.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Performance stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 rounded-lg bg-muted/30 text-center">
            <div className="flex items-center justify-center gap-1">
              <Calendar className="w-3 h-3 text-primary" />
              <span className="text-sm font-bold text-foreground">{stats?.bookings ?? 0}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Bookings</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/30 text-center">
            <div className="flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span className="text-sm font-bold text-foreground">{completionRate}%</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Completed</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/30 text-center">
            <span className="text-sm font-bold text-foreground">{stylist.availability.length}</span>
            <p className="text-[10px] text-muted-foreground mt-0.5">Days/wk</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
