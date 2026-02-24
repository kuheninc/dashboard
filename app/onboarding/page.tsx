"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";
import { OnboardingFormData, INITIAL_FORM_DATA } from "@/lib/types";
import SalonDetailsStep from "@/components/onboarding/SalonDetailsStep";
import HoursStep from "@/components/onboarding/HoursStep";
import ServicesStep from "@/components/onboarding/ServicesStep";
import StylistsStep from "@/components/onboarding/StylistsStep";
import ReviewStep from "@/components/onboarding/ReviewStep";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";

function CadenceIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 56 48" fill="none" className={className}>
      <path
        d="M4 36 Q14 6, 24 22 Q34 38, 44 12 Q48 4, 52 8"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

const STEPS = [
  { label: "Salon", title: "Tell us about your salon", subtitle: "The basics — name, location, and how to reach you." },
  { label: "Hours", title: "When are you open?", subtitle: "Set your weekly schedule so customers know when to book." },
  { label: "Services", title: "What do you offer?", subtitle: "Add your services with pricing and duration." },
  { label: "Team", title: "Who's on the team?", subtitle: "Add your stylists and their working schedules." },
  { label: "Review", title: "Looking good — let's confirm", subtitle: "Double-check everything before we set things up." },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingFormData>(INITIAL_FORM_DATA);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { signIn } = useAuthActions();
  const createSalon = useMutation(api.salons.mutations.create);
  const createService = useMutation(api.services.mutations.create);
  const createStylist = useMutation(api.stylists.mutations.create);

  const canProceed = (): boolean => {
    switch (step) {
      case 0: {
        const hasValidAdmin = data.admins.some(
          (a) =>
            a.email.trim() &&
            a.username.trim() &&
            a.password.length >= 8 &&
            a.phone.trim()
        );
        return !!(
          data.name &&
          data.address &&
          data.waPhoneNumberId &&
          data.waBusinessAccountId &&
          data.waAccessToken &&
          hasValidAdmin
        );
      }
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

  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      encoder.encode(password)
    );
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const validAdmins = data.admins.filter(
        (a) => a.email.trim() && a.username.trim() && a.password && a.phone.trim()
      );

      // Check unique usernames
      const usernames = validAdmins.map((a) => a.username.toLowerCase());
      if (new Set(usernames).size !== usernames.length) {
        throw new Error("Each admin must have a unique username");
      }

      // Sign up the owner (first admin) with Convex Auth
      const owner = validAdmins.find((a) => a.role === "owner") ?? validAdmins[0];
      await signIn("password", {
        email: owner.email.trim(),
        password: owner.password,
        flow: "signUp",
      });

      // Hash passwords before sending (for WhatsApp admin matching)
      const adminsWithHash = await Promise.all(
        validAdmins.map(async (a) => ({
          email: a.email.trim(),
          username: a.username.trim(),
          passwordHash: await hashPassword(a.password),
          phone: a.phone.trim(),
          role: a.role,
        }))
      );

      const salonId = await createSalon({
        name: data.name,
        address: data.address,
        googleMapsLink: data.googleMapsLink || undefined,
        waPhoneNumberId: data.waPhoneNumberId,
        waBusinessAccountId: data.waBusinessAccountId,
        waAccessToken: data.waAccessToken,
        admins: adminsWithHash,
        openingHours: data.openingHours,
        closedDates: [],
        timezone: data.timezone,
      });

      for (const service of data.services.filter((s) => s.name)) {
        await createService({
          salonId,
          name: service.name,
          nameBM: service.nameBM || undefined,
          durationMinutes: service.durationMinutes,
          priceRM: service.priceRM,
        });
      }

      for (const stylist of data.stylists.filter((s) => s.name)) {
        await createStylist({
          salonId,
          name: stylist.name,
          phone: stylist.phone || undefined,
          availability: stylist.availability,
        });
      }

      window.location.href = "/onboarding/success";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const currentStep = STEPS[step];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#d1b799] to-[#a68b6b] flex items-center justify-center">
            <CadenceIcon className="w-[18px] h-[13px] text-[#1c1720]" />
          </div>
          <span className="font-display text-[18px] text-foreground">
            Cadence
          </span>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => (
              <div key={s.label} className="flex items-center gap-1.5">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium transition-all ${
                    i < step
                      ? "bg-[#5a9a6e] text-white"
                      : i === step
                        ? "bg-gradient-to-br from-[#d1b799] to-[#a68b6b] text-[#1c1720]"
                        : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {i < step ? "\u2713" : i + 1}
                </div>
                <span
                  className={`hidden sm:inline text-[12px] font-medium transition-colors ${
                    i <= step ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </span>
                {i < STEPS.length - 1 && (
                  <div
                    className={`hidden sm:block w-8 lg:w-14 h-px ml-1.5 transition-colors ${
                      i < step ? "bg-[#5a9a6e]" : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step title */}
        <div className="mb-6">
          <h1 className="font-display text-[22px] text-foreground mb-1">
            {currentStep.title}
          </h1>
          <p className="text-[14px] text-muted-foreground">
            {currentStep.subtitle}
          </p>
        </div>

        {/* Step content */}
        <div className="bg-card rounded-2xl border border-border p-5 sm:p-7 mb-5 cadence-animate">
          {step === 0 && <SalonDetailsStep data={data} onChange={setData} />}
          {step === 1 && <HoursStep data={data} onChange={setData} />}
          {step === 2 && <ServicesStep data={data} onChange={setData} />}
          {step === 3 && <StylistsStep data={data} onChange={setData} />}
          {step === 4 && <ReviewStep data={data} />}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-[rgba(196,90,90,0.08)] border border-[rgba(196,90,90,0.2)]">
            <p className="text-[13px] text-[#c45a5a]">{error}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-0 disabled:pointer-events-none transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Go back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-medium text-[#1c1720] bg-gradient-to-r from-[#d1b799] to-[#c4a67e] hover:from-[#dcc5a8] hover:to-[#d1b799] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
            >
              Continue
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-medium text-[#1c1720] bg-gradient-to-r from-[#d1b799] to-[#c4a67e] hover:from-[#dcc5a8] hover:to-[#d1b799] disabled:opacity-50 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Setting things up...
                </>
              ) : (
                <>
                  Create my salon
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
