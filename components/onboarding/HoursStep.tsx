"use client";

import { OnboardingFormData, DAY_NAMES } from "@/lib/types";

interface Props {
  data: OnboardingFormData;
  onChange: (data: OnboardingFormData) => void;
}

export default function HoursStep({ data, onChange }: Props) {
  const updateHour = (
    dayIndex: number,
    field: "open" | "close" | "isClosed",
    value: string | boolean
  ) => {
    const hours = data.openingHours.map((h) =>
      h.day === dayIndex ? { ...h, [field]: value } : h
    );
    onChange({ ...data, openingHours: hours });
  };

  return (
    <div className="space-y-4">
      {data.openingHours.map((entry) => (
        <div
          key={entry.day}
          className={`flex items-center gap-4 p-3.5 rounded-xl transition-colors ${
            entry.isClosed
              ? "bg-secondary/50"
              : "bg-background border border-border"
          }`}
        >
          <div className="w-24 text-[13px] font-medium text-foreground">
            {DAY_NAMES[entry.day]}
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={entry.isClosed}
              onChange={(e) =>
                updateHour(entry.day, "isClosed", e.target.checked)
              }
              className="rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-[12px] text-muted-foreground">Closed</span>
          </label>

          {!entry.isClosed && (
            <>
              <input
                type="time"
                value={entry.open}
                onChange={(e) =>
                  updateHour(entry.day, "open", e.target.value)
                }
                className="px-3 py-1.5 rounded-lg bg-card border border-border text-[13px] text-foreground font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
              <span className="text-[12px] text-muted-foreground">to</span>
              <input
                type="time"
                value={entry.close}
                onChange={(e) =>
                  updateHour(entry.day, "close", e.target.value)
                }
                className="px-3 py-1.5 rounded-lg bg-card border border-border text-[13px] text-foreground font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </>
          )}
        </div>
      ))}
    </div>
  );
}
