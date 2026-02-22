"use client";

import { OnboardingFormData } from "@/lib/types";
import { X } from "lucide-react";

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
      <div className="space-y-4">
        <div>
          <label className="font-label text-muted-foreground mb-2 block">
            Salon Name *
          </label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => updateField("name", e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-[14px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            placeholder="e.g. Stylish Cuts KL"
          />
        </div>

        <div>
          <label className="font-label text-muted-foreground mb-2 block">
            Address *
          </label>
          <input
            type="text"
            value={data.address}
            onChange={(e) => updateField("address", e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-[14px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            placeholder="e.g. 123 Jalan Bukit Bintang, KL"
          />
        </div>

        <div>
          <label className="font-label text-muted-foreground mb-2 block">
            Google Maps Link
          </label>
          <input
            type="text"
            value={data.googleMapsLink}
            onChange={(e) => updateField("googleMapsLink", e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-[14px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            placeholder="https://maps.google.com/..."
          />
        </div>
      </div>

      <div className="pt-2 border-t border-border">
        <h3 className="font-display text-[16px] text-foreground mb-1.5">
          WhatsApp Business API
        </h3>
        <p className="text-[13px] text-muted-foreground mb-4">
          These come from your Meta Business dashboard. Leave as placeholder values for testing.
        </p>

        <div className="space-y-4">
          <div>
            <label className="font-label text-muted-foreground mb-2 block">
              Phone Number ID *
            </label>
            <input
              type="text"
              value={data.waPhoneNumberId}
              onChange={(e) => updateField("waPhoneNumberId", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-[14px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-mono text-[13px]"
              placeholder="e.g. 123456789012345"
            />
          </div>

          <div>
            <label className="font-label text-muted-foreground mb-2 block">
              Business Account ID *
            </label>
            <input
              type="text"
              value={data.waBusinessAccountId}
              onChange={(e) => updateField("waBusinessAccountId", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-[14px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-mono text-[13px]"
              placeholder="e.g. 123456789012345"
            />
          </div>

          <div>
            <label className="font-label text-muted-foreground mb-2 block">
              Access Token *
            </label>
            <input
              type="password"
              value={data.waAccessToken}
              onChange={(e) => updateField("waAccessToken", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-[14px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-mono text-[13px]"
              placeholder="EAAxxxxxxx..."
            />
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-border">
        <h3 className="font-display text-[16px] text-foreground mb-1.5">
          Admin Phone Numbers
        </h3>
        <p className="text-[13px] text-muted-foreground mb-4">
          These people can manage the salon via WhatsApp. Use international format (e.g. 60123456789).
        </p>

        <div className="space-y-2">
          {data.adminPhones.map((phone, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={phone}
                onChange={(e) => updateAdminPhone(index, e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-border text-[14px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-mono text-[13px]"
                placeholder="60123456789"
              />
              {data.adminPhones.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAdminPhone(index)}
                  className="px-2.5 rounded-xl text-[#c45a5a] hover:bg-[rgba(196,90,90,0.08)] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {data.adminPhones.length < 2 && (
          <button
            type="button"
            onClick={addAdminPhone}
            className="mt-3 text-[13px] font-medium text-primary hover:text-[#8a7055] transition-colors"
          >
            + Add backup admin
          </button>
        )}
      </div>
    </div>
  );
}
