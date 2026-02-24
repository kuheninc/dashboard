export type BookingStatus =
  | "pending_approval"
  | "confirmed"
  | "reminder_sent"
  | "customer_confirmed"
  | "completed"
  | "no_show"
  | "cancelled_customer"
  | "cancelled_admin";

const statusConfig: Record<
  BookingStatus,
  { label: string; color: string; bg: string }
> = {
  pending_approval: {
    label: "Pending",
    color: "#c4983e",
    bg: "rgba(196,152,62,0.08)",
  },
  confirmed: {
    label: "Confirmed",
    color: "#5a9a6e",
    bg: "rgba(90,154,110,0.08)",
  },
  reminder_sent: {
    label: "Reminded",
    color: "#5a9a6e",
    bg: "rgba(90,154,110,0.08)",
  },
  customer_confirmed: {
    label: "Customer OK",
    color: "#5a9a6e",
    bg: "rgba(90,154,110,0.08)",
  },
  completed: {
    label: "Completed",
    color: "#5a9a6e",
    bg: "rgba(90,154,110,0.08)",
  },
  no_show: {
    label: "No Show",
    color: "#c45a5a",
    bg: "rgba(196,90,90,0.08)",
  },
  cancelled_customer: {
    label: "Cancelled",
    color: "#c45a5a",
    bg: "rgba(196,90,90,0.06)",
  },
  cancelled_admin: {
    label: "Cancelled",
    color: "#c45a5a",
    bg: "rgba(196,90,90,0.06)",
  },
};

const fallbackConfig = {
  label: "",
  color: "#9c9184",
  bg: "rgba(166,139,107,0.05)",
};

export default function BookingStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as BookingStatus] ?? {
    ...fallbackConfig,
    label: status,
  };

  return (
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded-md inline-flex items-center gap-1 uppercase tracking-wider"
      style={{ color: config.color, backgroundColor: config.bg }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.color }} />
      {config.label}
    </span>
  );
}
