"use client";

import {
  OnboardingFormData,
  StylistEntry,
  DAY_NAMES,
  StylistAvailability,
} from "@/lib/types";

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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Stylists</h2>
      <p className="text-sm text-gray-500">
        Add your stylists and set their working days/hours.
      </p>

      <div className="space-y-6">
        {data.stylists.map((stylist, sIndex) => (
          <div
            key={sIndex}
            className="p-4 border border-gray-200 rounded-lg space-y-4"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">
                Stylist {sIndex + 1}
              </span>
              {data.stylists.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeStylist(sIndex)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={stylist.name}
                  onChange={(e) =>
                    updateStylist(sIndex, "name", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g. Ahmad"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone (optional)
                </label>
                <input
                  type="text"
                  value={stylist.phone}
                  onChange={(e) =>
                    updateStylist(sIndex, "phone", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="60123456789"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm">{DAY_NAMES[day]}</span>
                      </label>
                      {avail && (
                        <>
                          <input
                            type="time"
                            value={avail.startTime}
                            onChange={(e) =>
                              updateAvailTime(
                                sIndex,
                                day,
                                "startTime",
                                e.target.value
                              )
                            }
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500"
                          />
                          <span className="text-gray-400 text-sm">to</span>
                          <input
                            type="time"
                            value={avail.endTime}
                            onChange={(e) =>
                              updateAvailTime(
                                sIndex,
                                day,
                                "endTime",
                                e.target.value
                              )
                            }
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500"
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
      </div>

      <button
        type="button"
        onClick={addStylist}
        className="text-sm text-green-600 hover:text-green-700 font-medium"
      >
        + Add another stylist
      </button>
    </div>
  );
}
