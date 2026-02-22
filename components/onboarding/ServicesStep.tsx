"use client";

import { OnboardingFormData, ServiceEntry } from "@/lib/types";
import { X } from "lucide-react";

interface Props {
  data: OnboardingFormData;
  onChange: (data: OnboardingFormData) => void;
}

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120, 150, 180];

export default function ServicesStep({ data, onChange }: Props) {
  const updateService = (
    index: number,
    field: keyof ServiceEntry,
    value: string | number
  ) => {
    const services = data.services.map((s, i) =>
      i === index ? { ...s, [field]: value } : s
    );
    onChange({ ...data, services });
  };

  const addService = () => {
    onChange({
      ...data,
      services: [
        ...data.services,
        { name: "", nameBM: "", durationMinutes: 30, priceRM: 0 },
      ],
    });
  };

  const removeService = (index: number) => {
    if (data.services.length <= 1) return;
    onChange({
      ...data,
      services: data.services.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-5">
      {data.services.map((service, index) => (
        <div
          key={index}
          className="p-4 bg-background border border-border rounded-xl space-y-4"
        >
          <div className="flex justify-between items-center">
            <span className="font-label text-muted-foreground">
              Service {index + 1}
            </span>
            {data.services.length > 1 && (
              <button
                type="button"
                onClick={() => removeService(index)}
                className="p-1 rounded-lg text-[#c45a5a] hover:bg-[rgba(196,90,90,0.08)] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-label text-muted-foreground mb-1.5 block">
                Name (English) *
              </label>
              <input
                type="text"
                value={service.name}
                onChange={(e) => updateService(index, "name", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-card border border-border text-[14px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                placeholder="e.g. Haircut"
              />
            </div>

            <div>
              <label className="font-label text-muted-foreground mb-1.5 block">
                Name (BM)
              </label>
              <input
                type="text"
                value={service.nameBM}
                onChange={(e) => updateService(index, "nameBM", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-card border border-border text-[14px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                placeholder="e.g. Potong Rambut"
              />
            </div>

            <div>
              <label className="font-label text-muted-foreground mb-1.5 block">
                Duration *
              </label>
              <select
                value={service.durationMinutes}
                onChange={(e) =>
                  updateService(index, "durationMinutes", Number(e.target.value))
                }
                className="w-full px-4 py-2.5 rounded-xl bg-card border border-border text-[14px] text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              >
                {DURATION_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d >= 60 ? `${d / 60}h${d % 60 ? ` ${d % 60}min` : ""}` : `${d} min`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-label text-muted-foreground mb-1.5 block">
                Price (RM) *
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={service.priceRM || ""}
                onChange={(e) =>
                  updateService(index, "priceRM", Number(e.target.value))
                }
                className="w-full px-4 py-2.5 rounded-xl bg-card border border-border text-[14px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-mono"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addService}
        className="text-[13px] font-medium text-primary hover:text-[#8a7055] transition-colors"
      >
        + Add another service
      </button>
    </div>
  );
}
