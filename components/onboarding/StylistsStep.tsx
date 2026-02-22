"use client";

import {
  OnboardingFormData,
  StylistEntry,
  DAY_NAMES,
  StylistAvailability,
} from "@/lib/types";
import { X } from "lucide-react";

interface Props {
  data: OnboardingFormData;
  onChange: (data: OnboardingFormData) => void;
}

const DEFAULT_AVAILABILITY: StylistAvailability[] = [
  { day: 1, startTime: "10:00", endTime: "20:00" },
  { day: 2, startTime: "10:00", endTime: "20:00" },
  { day: 3, startTime: "10:00", endTime: "20:00" },
  { day: 4, startTime: "10:00", endTime: "20:00" },
  { day: 5, startTime: "10:00", endTime: "20:00" },
  { day: 6, startTime: "10:00", endTime: "20:00" },
];

export default function StylistsStep({ data, onChange }: Props) {
  const updateStylist = (
    index: number,
    field: keyof StylistEntry,
    value: string | StylistAvailability[]
  ) => {
    const stylists = data.stylists.map((s, i) =>
      i === index ? { ...s, [field]: value } : s
    );
    onChange({ ...data, stylists });
  };

  const toggleDay = (stylistIndex: number, day: number) => {
    const stylist = data.stylists[stylistIndex];
    const hasDay = stylist.availability.some((a) => a.day === day);
    let newAvail: StylistAvailability[];

    if (hasDay) {
      newAvail = stylist.availability.filter((a) => a.day !== day);
    } else {
      newAvail = [
        ...stylist.availability,
        { day, startTime: "10:00", endTime: "20:00" },
      ].sort((a, b) => a.day - b.day);
    }
    updateStylist(stylistIndex, "availability", newAvail);
  };

  const updateAvailTime = (
    stylistIndex: number,
    day: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    const stylist = data.stylists[stylistIndex];
    const newAvail = stylist.availability.map((a) =>
      a.day === day ? { ...a, [field]: value } : a
    );
    updateStylist(stylistIndex, "availability", newAvail);
  };

  const addStylist = () => {
    onChange({
      ...data,
      stylists: [
        ...data.stylists,
        { name: "", phone: "", availability: [...DEFAULT_AVAILABILITY] },
      ],
    });
  };

  const removeStylist = (index: number) => {
    if (data.stylists.length <= 1) return;
    onChange({
      ...data,
      stylists: data.stylists.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-5">
      {data.stylists.map((stylist, sIndex) => (
        <div
          key={sIndex}
          className="p-4 bg-background border border-border rounded-xl space-y-4"
        >
          <div className="flex justify-between items-center">
            <span className="font-label text-muted-foreground">
              Stylist {sIndex + 1}
            </span>
            {data.stylists.length > 1 && (
              <button
                type="button"
                onClick={() => removeStylist(sIndex)}
                className="p-1 rounded-lg text-[#c45a5a] hover:bg-[rgba(196,90,90,0.08)] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-label text-muted-foreground mb-1.5 block">
                Name *
              </label>
              <input
                type="text"
                value={stylist.name}
                onChange={(e) =>
                  updateStylist(sIndex, "name", e.target.value)
                }
                className="w-full px-4 py-2.5 rounded-xl bg-card border border-border text-[14px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                placeholder="e.g. Ahmad"
              />
            </div>

            <div>
              <label className="font-label text-muted-foreground mb-1.5 block">
                Phone (optional)
              </label>
              <input
                type="text"
                value={stylist.phone}
                onChange={(e) =>
                  updateStylist(sIndex, "phone", e.target.value)
                }
                className="w-full px-4 py-2.5 rounded-xl bg-card border border-border text-[14px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-mono text-[13px]"
                placeholder="60123456789"
              />
            </div>
          </div>

          <div>
            <label className="font-label text-muted-foreground mb-2.5 block">
              Working Days
            </label>
            <div className="space-y-2">
              {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                const avail = stylist.availability.find((a) => a.day === day);
                return (
                  <div key={day} className="flex items-center gap-3">
                    <label className="flex items-center gap-2 w-28 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!avail}
                        onChange={() => toggleDay(sIndex, day)}
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                      <span className="text-[13px] text-foreground">
                        {DAY_NAMES[day]}
                      </span>
                    </label>
                    {avail && (
                      <>
                        <input
                          type="time"
                          value={avail.startTime}
                          onChange={(e) =>
                            updateAvailTime(sIndex, day, "startTime", e.target.value)
                          }
                          className="px-2.5 py-1.5 rounded-lg bg-card border border-border text-[12px] text-foreground font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        />
                        <span className="text-[12px] text-muted-foreground">to</span>
                        <input
                          type="time"
                          value={avail.endTime}
                          onChange={(e) =>
                            updateAvailTime(sIndex, day, "endTime", e.target.value)
                          }
                          className="px-2.5 py-1.5 rounded-lg bg-card border border-border text-[12px] text-foreground font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addStylist}
        className="text-[13px] font-medium text-primary hover:text-[#8a7055] transition-colors"
      >
        + Add another stylist
      </button>
    </div>
  );
}
