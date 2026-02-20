import type { Doc } from "@/convex/_generated/dataModel";

export default function ServiceCard({ service }: { service: Doc<"services"> }) {
  return (
    <div className="bg-card border border-border rounded-[14px] hover:shadow-[0_4px_16px_rgba(42,36,32,0.06)] transition-shadow">
      <div className="px-[22px] py-[18px]">
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0">
            <h3 className="font-display text-[17px] text-foreground">{service.name}</h3>
            {service.nameBM && (
              <p className="text-[13px] text-muted-foreground mt-0.5">{service.nameBM}</p>
            )}
          </div>
          <span
            className={`text-[11px] font-medium px-2.5 py-1 rounded-full shrink-0 ml-3 ${
              service.isActive
                ? "bg-[rgba(90,154,110,0.08)] text-[#5a9a6e]"
                : "bg-[rgba(42,36,32,0.05)] text-[#9c9184]"
            }`}
          >
            {service.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] text-muted-foreground">RM</span>
            <span className="font-display text-[14px] text-foreground">{service.priceRM}</span>
          </div>
          <div className="w-px h-3 bg-border" />
          <div className="flex items-center gap-1.5">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#9c9184]"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-[13px] text-muted-foreground">{service.durationMinutes} min</span>
          </div>
        </div>
      </div>
    </div>
  );
}
