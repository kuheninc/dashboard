"use client";

import { OnboardingFormData, DAY_NAMES } from "@/lib/types";

interface Props {
  data: OnboardingFormData;
}

export default function ReviewStep({ data }: Props) {
  return (
    <div className="space-y-5">
      {/* Salon Details */}
      <div className="p-4 bg-background border border-border rounded-xl space-y-3">
        <h3 className="font-display text-[15px] text-foreground">Salon Details</h3>
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[13px]">
          <span className="text-muted-foreground">Name</span>
          <span className="text-foreground">{data.name}</span>
          <span className="text-muted-foreground">Address</span>
          <span className="text-foreground">{data.address}</span>
          {data.googleMapsLink && (
            <>
              <span className="text-muted-foreground">Maps</span>
              <span className="text-foreground truncate">{data.googleMapsLink}</span>
            </>
          )}
        </div>
      </div>

      {/* Admin Accounts */}
      <div className="p-4 bg-background border border-border rounded-xl space-y-3">
        <h3 className="font-display text-[15px] text-foreground">
          Admin Accounts ({data.admins.filter((a) => a.username).length})
        </h3>
        <div className="space-y-2">
          {data.admins
            .filter((a) => a.username)
            .map((a, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-[13px]"
              >
                <div>
                  <span className="font-medium text-foreground">{a.username}</span>
                  <span className="text-muted-foreground ml-2 font-mono text-[12px]">
                    {a.phone}
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${
                    a.role === "owner"
                      ? "bg-[rgba(209,183,153,0.15)] text-[#a68b6b]"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {a.role}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Opening Hours */}
      <div className="p-4 bg-background border border-border rounded-xl space-y-3">
        <h3 className="font-display text-[15px] text-foreground">Opening Hours</h3>
        <div className="space-y-1.5">
          {data.openingHours.map((h) => (
            <div key={h.day} className="flex gap-2 text-[13px]">
              <span className="w-24 text-muted-foreground">{DAY_NAMES[h.day]}</span>
              <span className="text-foreground">
                {h.isClosed ? (
                  <span className="text-muted-foreground/60">Closed</span>
                ) : (
                  <span className="font-mono text-[12px]">{h.open} – {h.close}</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Services */}
      <div className="p-4 bg-background border border-border rounded-xl space-y-3">
        <h3 className="font-display text-[15px] text-foreground">
          Services ({data.services.filter((s) => s.name).length})
        </h3>
        <div className="space-y-1.5">
          {data.services
            .filter((s) => s.name)
            .map((s, i) => (
              <div key={i} className="flex justify-between text-[13px]">
                <span className="text-foreground">
                  {s.name}
                  {s.nameBM ? ` (${s.nameBM})` : ""}{" "}
                  <span className="text-muted-foreground">— {s.durationMinutes} min</span>
                </span>
                <span className="font-mono text-[12px] font-medium text-foreground">
                  RM{s.priceRM}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Stylists */}
      <div className="p-4 bg-background border border-border rounded-xl space-y-3">
        <h3 className="font-display text-[15px] text-foreground">
          Stylists ({data.stylists.filter((s) => s.name).length})
        </h3>
        <div className="space-y-2">
          {data.stylists
            .filter((s) => s.name)
            .map((s, i) => (
              <div key={i} className="text-[13px]">
                <span className="font-medium text-foreground">{s.name}</span>
                <span className="text-muted-foreground ml-2">
                  {s.availability.map((a) => DAY_NAMES[a.day].slice(0, 3)).join(", ")}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
