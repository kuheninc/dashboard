"use client";

import { OnboardingFormData, DAY_NAMES } from "@/lib/types";

interface Props {
  data: OnboardingFormData;
}

export default function ReviewStep({ data }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Review & Submit</h2>
      <p className="text-sm text-gray-500">
        Please review your salon details before submitting.
      </p>

      {/* Salon Details */}
      <div className="p-4 bg-white border border-gray-200 rounded-lg space-y-2">
        <h3 className="font-semibold text-gray-800">Salon Details</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <span className="text-gray-500">Name:</span>
          <span>{data.name}</span>
          <span className="text-gray-500">Address:</span>
          <span>{data.address}</span>
          {data.googleMapsLink && (
            <>
              <span className="text-gray-500">Maps:</span>
              <span className="truncate">{data.googleMapsLink}</span>
            </>
          )}
          <span className="text-gray-500">Admin phones:</span>
          <span>{data.adminPhones.filter(Boolean).join(", ")}</span>
        </div>
      </div>

      {/* Opening Hours */}
      <div className="p-4 bg-white border border-gray-200 rounded-lg space-y-2">
        <h3 className="font-semibold text-gray-800">Opening Hours</h3>
        <div className="text-sm space-y-1">
          {data.openingHours.map((h) => (
            <div key={h.day} className="flex gap-2">
              <span className="w-24 text-gray-500">{DAY_NAMES[h.day]}:</span>
              <span>
                {h.isClosed ? (
                  <span className="text-gray-400">Closed</span>
                ) : (
                  `${h.open} - ${h.close}`
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Services */}
      <div className="p-4 bg-white border border-gray-200 rounded-lg space-y-2">
        <h3 className="font-semibold text-gray-800">
          Services ({data.services.filter((s) => s.name).length})
        </h3>
        <div className="text-sm space-y-1">
          {data.services
            .filter((s) => s.name)
            .map((s, i) => (
              <div key={i} className="flex justify-between">
                <span>
                  {s.name}
                  {s.nameBM ? ` (${s.nameBM})` : ""} — {s.durationMinutes} min
                </span>
                <span className="font-medium">RM{s.priceRM}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Stylists */}
      <div className="p-4 bg-white border border-gray-200 rounded-lg space-y-2">
        <h3 className="font-semibold text-gray-800">
          Stylists ({data.stylists.filter((s) => s.name).length})
        </h3>
        <div className="text-sm space-y-2">
          {data.stylists
            .filter((s) => s.name)
            .map((s, i) => (
              <div key={i}>
                <span className="font-medium">{s.name}</span>
                <span className="text-gray-400 ml-2">
                  {s.availability.map((a) => DAY_NAMES[a.day].slice(0, 3)).join(", ")}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
