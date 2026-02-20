import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign } from "lucide-react";
import type { MockService } from "@/lib/mock-data";

export default function ServiceCard({ service }: { service: MockService }) {
  return (
    <Card className="shadow-sm border-border/60 hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">{service.name}</h3>
            {service.nameBM && (
              <p className="text-xs text-muted-foreground mt-0.5">{service.nameBM}</p>
            )}
          </div>
          <Badge
            variant="outline"
            className={`text-[11px] ${
              service.isActive
                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                : "bg-gray-100 text-gray-500 border-gray-200"
            }`}
          >
            {service.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <DollarSign className="w-3.5 h-3.5" />
            <span className="font-semibold text-foreground">RM {service.priceRM}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>{service.durationMinutes} min</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
