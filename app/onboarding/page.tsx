"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { OnboardingFormData, INITIAL_FORM_DATA } from "@/lib/types";
import SalonDetailsStep from "@/components/onboarding/SalonDetailsStep";
import HoursStep from "@/components/onboarding/HoursStep";
import ServicesStep from "@/components/onboarding/ServicesStep";
import StylistsStep from "@/components/onboarding/StylistsStep";
import ReviewStep from "@/components/onboarding/ReviewStep";
import { useRouter } from "next/navigation";

const STEPS = ["Salon Details", "Hours", "Services", "Stylists", "Review"];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingFormData>(INITIAL_FORM_DATA);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const createSalon = useMutation(api.salons.mutations.create);
  const createService = useMutation(api.services.mutations.create);
  const createStylist = useMutation(api.stylists.mutations.create);

  const canProceed = (): boolean => {
    switch (step) {
      case 0:
        return !!(
          data.name &&
          data.address &&
          data.waPhoneNumberId &&
          data.waBusinessAccountId &&
          data.waAccessToken &&
          data.adminPhones.some(Boolean)
        );
      case 1:
        return true;
      case 2:
        return data.services.some((s) => s.name && s.priceRM > 0);
      case 3:
        return data.stylists.some((s) => s.name);
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      // 1. Create salon
      const salonId = await createSalon({
        name: data.name,
        address: data.address,
        googleMapsLink: data.googleMapsLink || undefined,
        waPhoneNumberId: data.waPhoneNumberId,
        waBusinessAccountId: data.waBusinessAccountId,
        waAccessToken: data.waAccessToken,
        adminPhones: data.adminPhones.filter(Boolean),
        openingHours: data.openingHours,
        closedDates: [],
        timezone: data.timezone,
      });

      // 2. Create services
      for (const service of data.services.filter((s) => s.name)) {
        await createService({
          salonId,
          name: service.name,
          nameBM: service.nameBM || undefined,
          durationMinutes: service.durationMinutes,
          priceRM: service.priceRM,
        });
      }

      // 3. Create stylists
      for (const stylist of data.stylists.filter((s) => s.name)) {
        await createStylist({
          salonId,
          name: stylist.name,
          phone: stylist.phone || undefined,
          availability: stylist.availability,
        });
      }

      router.push("/onboarding/success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {STEPS.map((label, i) => (
              <span
                key={label}
                className={`text-xs font-medium ${
                  i <= step ? "text-green-600" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          {step === 0 && <SalonDetailsStep data={data} onChange={setData} />}
          {step === 1 && <HoursStep data={data} onChange={setData} />}
          {step === 2 && <ServicesStep data={data} onChange={setData} />}
          {step === 3 && <StylistsStep data={data} onChange={setData} />}
          {step === 4 && <ReviewStep data={data} />}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-0"
          >
            Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create Salon"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
