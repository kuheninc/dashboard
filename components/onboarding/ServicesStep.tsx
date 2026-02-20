"use client";

import { OnboardingFormData, ServiceEntry } from "@/lib/types";

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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Services</h2>
      <p className="text-sm text-gray-500">
        Add the services your salon offers with pricing and duration.
      </p>

      <div className="space-y-4">
        {data.services.map((service, index) => (
          <div
            key={index}
            className="p-4 border border-gray-200 rounded-lg space-y-3"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">
                Service {index + 1}
              </span>
              {data.services.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeService(index)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (English) *
                </label>
                <input
                  type="text"
                  value={service.name}
                  onChange={(e) =>
                    updateService(index, "name", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g. Haircut"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (BM)
                </label>
                <input
                  type="text"
                  value={service.nameBM}
                  onChange={(e) =>
                    updateService(index, "nameBM", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g. Potong Rambut"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration *
                </label>
                <select
                  value={service.durationMinutes}
                  onChange={(e) =>
                    updateService(
                      index,
                      "durationMinutes",
                      Number(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {DURATION_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d >= 60 ? `${d / 60}h${d % 60 ? ` ${d % 60}min` : ""}` : `${d} min`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addService}
        className="text-sm text-green-600 hover:text-green-700 font-medium"
      >
        + Add another service
      </button>
    </div>
  );
}
