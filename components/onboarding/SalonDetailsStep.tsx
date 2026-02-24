"use client";

import { OnboardingFormData, AdminEntry } from "@/lib/types";
import { X, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface Props {
  data: OnboardingFormData;
  onChange: (data: OnboardingFormData) => void;
}

export default function SalonDetailsStep({ data, onChange }: Props) {
  const [showPasswords, setShowPasswords] = useState<boolean[]>(
    data.admins.map(() => false)
  );

  const updateField = (field: keyof OnboardingFormData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const updateAdmin = (index: number, field: keyof AdminEntry, value: string) => {
    const admins = [...data.admins];
    admins[index] = { ...admins[index], [field]: value };
    onChange({ ...data, admins });
  };

  const addAdmin = () => {
    if (data.admins.length >= 3) return;
    onChange({
      ...data,
      admins: [
        ...data.admins,
        { email: "", username: "", password: "", phone: "", role: "admin" },
      ],
    });
    setShowPasswords((prev) => [...prev, false]);
  };

  const removeAdmin = (index: number) => {
    if (data.admins.length <= 1) return;
    onChange({
      ...data,
      admins: data.admins.filter((_, i) => i !== index),
    });
    setShowPasswords((prev) => prev.filter((_, i) => i !== index));
  };

  const togglePassword = (index: number) => {
    setShowPasswords((prev) =>
      prev.map((v, i) => (i === index ? !v : v))
    );
  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl bg-background border border-border text-[14px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors";

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
            className={inputClass}
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
            className={inputClass}
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
            className={inputClass}
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
              className={`${inputClass} font-mono text-[13px]`}
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
              className={`${inputClass} font-mono text-[13px]`}
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
              className={`${inputClass} font-mono text-[13px]`}
              placeholder="EAAxxxxxxx..."
            />
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-border">
        <h3 className="font-display text-[16px] text-foreground mb-1.5">
          Admin Accounts
        </h3>
        <p className="text-[13px] text-muted-foreground mb-4">
          Each admin gets a unique login. The first admin should be the owner. Up to 3 admins allowed.
        </p>

        <div className="space-y-4">
          {data.admins.map((admin, index) => (
            <div
              key={index}
              className="p-4 bg-background border border-border rounded-xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-foreground">
                  Admin {index + 1}
                </span>
                {data.admins.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAdmin(index)}
                    className="p-1 rounded-lg text-[#c45a5a] hover:bg-[rgba(196,90,90,0.08)] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-label text-muted-foreground mb-1.5 block text-[12px]">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={admin.email}
                    onChange={(e) =>
                      updateAdmin(index, "email", e.target.value)
                    }
                    className={`${inputClass} text-[13px]`}
                    placeholder="admin@yoursalon.com"
                  />
                </div>

                <div>
                  <label className="font-label text-muted-foreground mb-1.5 block text-[12px]">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={admin.username}
                    onChange={(e) =>
                      updateAdmin(index, "username", e.target.value)
                    }
                    className={`${inputClass} text-[13px]`}
                    placeholder="e.g. sarah_owner"
                  />
                </div>

                <div>
                  <label className="font-label text-muted-foreground mb-1.5 block text-[12px]">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords[index] ? "text" : "password"}
                      value={admin.password}
                      onChange={(e) =>
                        updateAdmin(index, "password", e.target.value)
                      }
                      className={`${inputClass} text-[13px] pr-10`}
                      placeholder="Min 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => togglePassword(index)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPasswords[index] ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-label text-muted-foreground mb-1.5 block text-[12px]">
                    Phone (WhatsApp) *
                  </label>
                  <input
                    type="text"
                    value={admin.phone}
                    onChange={(e) =>
                      updateAdmin(index, "phone", e.target.value)
                    }
                    className={`${inputClass} font-mono text-[13px]`}
                    placeholder="60123456789"
                  />
                </div>

                <div>
                  <label className="font-label text-muted-foreground mb-1.5 block text-[12px]">
                    Role *
                  </label>
                  <select
                    value={admin.role}
                    onChange={(e) =>
                      updateAdmin(
                        index,
                        "role",
                        e.target.value as "owner" | "admin"
                      )
                    }
                    className={`${inputClass} text-[13px]`}
                  >
                    <option value="owner">Owner</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {data.admins.length < 3 && (
          <button
            type="button"
            onClick={addAdmin}
            className="mt-3 text-[13px] font-medium text-primary hover:text-[#8a7055] transition-colors"
          >
            + Add another admin
          </button>
        )}
      </div>
    </div>
  );
}
