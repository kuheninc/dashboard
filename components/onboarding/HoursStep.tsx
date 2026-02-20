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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Opening Hours</h2>
      <p className="text-sm text-gray-500">
        Set your salon&apos;s operating hours for each day of the week.
      </p>

      <div className="space-y-3">
        {data.openingHours.map((entry) => (
          <div
            key={entry.day}
            className={`flex items-center gap-4 p-3 rounded-lg ${
              entry.isClosed ? "bg-gray-50" : "bg-white border border-gray-200"
            }`}
          >
            <div className="w-28 font-medium text-gray-700">
              {DAY_NAMES[entry.day]}
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={entry.isClosed}
                onChange={(e) =>
                  updateHour(entry.day, "isClosed", e.target.checked)
                }
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-600">Closed</span>
            </label>

            {!entry.isClosed && (
              <>
                <input
                  type="time"
                  value={entry.open}
                  onChange={(e) =>
                    updateHour(entry.day, "open", e.target.value)
                  }
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="time"
                  value={entry.close}
                  onChange={(e) =>
                    updateHour(entry.day, "close", e.target.value)
                  }
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
