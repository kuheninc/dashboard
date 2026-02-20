"use client";

import { OnboardingFormData } from "@/lib/types";

interface Props {
  data: OnboardingFormData;
  onChange: (data: OnboardingFormData) => void;
}

export default function SalonDetailsStep({ data, onChange }: Props) {
  const updateField = (field: keyof OnboardingFormData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const updateAdminPhone = (index: number, value: string) => {
    const phones = [...data.adminPhones];
    phones[index] = value;
    onChange({ ...data, adminPhones: phones });
  };

  const addAdminPhone = () => {
    onChange({ ...data, adminPhones: [...data.adminPhones, ""] });
  };

  const removeAdminPhone = (index: number) => {
    if (data.adminPhones.length <= 1) return;
    onChange({
      ...data,
      adminPhones: data.adminPhones.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Salon Details</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Salon Name *
          </label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => updateField("name", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="e.g. Stylish Cuts KL"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address *
          </label>
          <input
            type="text"
            value={data.address}
            onChange={(e) => updateField("address", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="e.g. 123 Jalan Bukit Bintang, KL"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Google Maps Link
          </label>
          <input
            type="text"
            value={data.googleMapsLink}
            onChange={(e) => updateField("googleMapsLink", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="https://maps.google.com/..."
          />
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            WhatsApp Business API
          </h3>
          <p className="text-sm text-gray-500 mb-3">
            These come from your Meta Business dashboard. Leave as placeholder
            values for testing.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number ID *
              </label>
              <input
                type="text"
                value={data.waPhoneNumberId}
                onChange={(e) => updateField("waPhoneNumberId", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g. 123456789012345"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Account ID *
              </label>
              <input
                type="text"
                value={data.waBusinessAccountId}
                onChange={(e) =>
                  updateField("waBusinessAccountId", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g. 123456789012345"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Access Token *
              </label>
              <input
                type="password"
                value={data.waAccessToken}
                onChange={(e) => updateField("waAccessToken", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="EAAxxxxxxx..."
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Admin Phone Numbers
          </h3>
          <p className="text-sm text-gray-500 mb-3">
            These people can manage the salon via WhatsApp. Use international
            format (e.g. 60123456789).
          </p>

          {data.adminPhones.map((phone, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={phone}
                onChange={(e) => updateAdminPhone(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="60123456789"
              />
              {data.adminPhones.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAdminPhone(index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          {data.adminPhones.length < 2 && (
            <button
              type="button"
              onClick={addAdminPhone}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              + Add backup admin
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
