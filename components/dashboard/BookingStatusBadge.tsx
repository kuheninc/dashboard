import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/lib/mock-data";

const statusConfig: Record<BookingStatus, { label: string; className: string }> = {
  pending_approval: { label: "Pending", className: "bg-amber-100 text-amber-700 border-amber-200" },
  confirmed: { label: "Confirmed", className: "bg-blue-100 text-blue-700 border-blue-200" },
  reminder_sent: { label: "Reminded", className: "bg-sky-100 text-sky-700 border-sky-200" },
  customer_confirmed: { label: "Customer OK", className: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  completed: { label: "Completed", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  no_show: { label: "No Show", className: "bg-red-100 text-red-700 border-red-200" },
  cancelled_customer: { label: "Cancelled", className: "bg-gray-100 text-gray-600 border-gray-200" },
  cancelled_admin: { label: "Cancelled", className: "bg-gray-100 text-gray-600 border-gray-200" },
};

export default function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={cn("text-[11px] font-medium px-2 py-0.5", config.className)}>
      {config.label}
    </Badge>
  );
}
