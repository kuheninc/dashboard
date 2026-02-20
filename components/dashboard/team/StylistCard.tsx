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
    <div className="bg-card border border-border rounded-[14px] hover:shadow-[0_4px_16px_rgba(42,36,32,0.06)] transition-shadow">
      <div className="px-[22px] py-[18px]">
        <div className="flex items-start gap-3 mb-4">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-[#a68b6b] to-[#8a7055] flex items-center justify-center text-[14px] font-semibold text-white shrink-0">
            {stylist.name.slice(0, 2).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-[17px] text-foreground truncate">{stylist.name}</h3>
              <span
                className={`text-[11px] font-medium px-2.5 py-1 rounded-full shrink-0 ml-3 ${
                  stylist.isActive
                    ? "bg-[rgba(90,154,110,0.08)] text-[#5a9a6e]"
                    : "bg-[rgba(42,36,32,0.05)] text-[#9c9184]"
                }`}
              >
                {stylist.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            {stylist.phone && (
              <div className="flex items-center gap-1.5 mt-1">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#9c9184]"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span className="text-[12px] text-[#9c9184] font-mono">+{stylist.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Performance stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 rounded-[10px] bg-[rgba(166,139,107,0.05)] text-center">
            <div className="font-display text-[14px] text-foreground">{stats?.bookings ?? 0}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Bookings</p>
          </div>
          <div className="p-2.5 rounded-[10px] bg-[rgba(166,139,107,0.05)] text-center">
            <div className="font-display text-[14px] text-foreground">{completionRate}%</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Completed</p>
          </div>
          <div className="p-2.5 rounded-[10px] bg-[rgba(166,139,107,0.05)] text-center">
            <div className="font-display text-[14px] text-foreground">{stylist.availability.length}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Days/wk</p>
          </div>
        </div>
      </div>
    </div>
  );
}
