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
    color: "#9c9184",
    bg: "rgba(166,139,107,0.05)",
  },
  cancelled_admin: {
    label: "Cancelled",
    color: "#9c9184",
    bg: "rgba(166,139,107,0.05)",
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
      className="text-[11px] font-medium px-2.5 py-1 rounded-full inline-block"
      style={{ color: config.color, backgroundColor: config.bg }}
    >
      {config.label}
    </span>
  );
}
