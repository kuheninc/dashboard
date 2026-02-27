"use client";

import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  CalendarCheck,
  Users,
  BarChart3,
  ArrowRight,
  Settings2,
  Wifi,
  Sparkles,
} from "lucide-react";

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

const FEATURES = [
  {
    icon: MessageSquare,
    title: "AI WhatsApp Booking",
    description:
      "Customers book appointments through WhatsApp with a smart AI assistant that speaks BM, English, and Manglish.",
  },
  {
    icon: CalendarCheck,
    title: "Smart Scheduling",
    description:
      "Auto-assign stylists, prevent double bookings, and manage your calendar with drag-and-drop ease.",
  },
  {
    icon: Users,
    title: "Customer Management",
    description:
      "Track customer history, manage no-shows, and build lasting relationships with your regulars.",
  },
  {
    icon: BarChart3,
    title: "Business Analytics",
    description:
      "Revenue trends, booking patterns, and stylist performance — all the insights you need to grow.",
  },
];

const STEPS = [
  {
    number: "1",
    icon: Settings2,
    title: "Set up your salon",
    description: "Add your services, team, and opening hours in minutes.",
  },
  {
    number: "2",
    icon: Wifi,
    title: "Connect WhatsApp",
    description: "Link your WhatsApp Business number with one simple webhook.",
  },
  {
    number: "3",
    icon: Sparkles,
    title: "Start receiving bookings",
    description: "Customers message your number and the AI handles the rest.",
  },
];

export default function Home() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) {
      router.replace("/dashboard");
    } else {
      setReady(true);
    }
  }, [isAuthenticated, isLoading, router]);

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#d1b799] to-[#a68b6b] flex items-center justify-center animate-pulse">
            <CadenceIcon className="w-[22px] h-[16px] text-[#1c1720]" />
          </div>
          <span className="font-display text-[15px] text-[#9c9184]">
            Cadence
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#d1b799] to-[#a68b6b] flex items-center justify-center">
              <CadenceIcon className="w-[16px] h-[12px] text-[#1c1720]" />
            </div>
            <span className="font-display text-[16px] text-foreground">
              Cadence
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="px-4 py-2 rounded-xl text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/onboarding"
              className="px-4 py-2 rounded-xl text-[13px] font-medium text-[#1c1720] bg-gradient-to-r from-[#d1b799] to-[#c4a67e] hover:from-[#dcc5a8] hover:to-[#d1b799] transition-all shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 sm:pb-20">
        <div className="max-w-2xl mx-auto text-center cadence-animate">
          <h1 className="font-display text-[32px] sm:text-[44px] leading-[1.1] text-foreground mb-4">
            Your salon,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a68b6b] to-[#c4983e]">
              on autopilot
            </span>
          </h1>
          <p className="text-[15px] sm:text-[17px] text-muted-foreground leading-relaxed mb-8 max-w-lg mx-auto">
            Let AI handle your bookings through WhatsApp while you focus on what
            you do best. Built for hair salons in Malaysia.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/onboarding"
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-medium text-[#1c1720] bg-gradient-to-r from-[#d1b799] to-[#c4a67e] hover:from-[#dcc5a8] hover:to-[#d1b799] transition-all shadow-[0_2px_8px_rgba(166,139,107,0.3)]"
            >
              Get started free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/sign-in"
              className="px-6 py-3 rounded-xl text-[14px] font-medium text-foreground border border-border hover:bg-secondary transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="text-center mb-10 cadence-animate cadence-delay-2">
          <p className="font-label text-primary mb-2">Features</p>
          <h2 className="font-display text-[22px] sm:text-[28px] text-foreground">
            Everything you need to run your salon
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map((feature, i) => (
            <div
              key={feature.title}
              className={`bg-card rounded-2xl border border-border p-6 card-glow cadence-animate cadence-delay-${i + 2}`}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d1b799]/20 to-[#c4a67e]/10 flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display text-[15px] text-foreground mb-1.5">
                {feature.title}
              </h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="text-center mb-10 cadence-animate">
          <p className="font-label text-primary mb-2">How it works</p>
          <h2 className="font-display text-[22px] sm:text-[28px] text-foreground">
            Up and running in 10 minutes
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className={`relative bg-card rounded-2xl border border-border p-6 text-center cadence-animate cadence-delay-${i + 2}`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#d1b799] to-[#a68b6b] flex items-center justify-center text-[13px] font-semibold text-[#1c1720] mx-auto mb-4">
                {step.number}
              </div>
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-3">
                <step.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <h3 className="font-display text-[15px] text-foreground mb-1.5">
                {step.title}
              </h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="bg-[#1c1720] rounded-2xl p-8 sm:p-12 text-center cadence-animate">
          <h2 className="font-display text-[22px] sm:text-[28px] text-[#f2ebe0] mb-3">
            Ready to transform your salon?
          </h2>
          <p className="text-[14px] text-[#9c9184] mb-6 max-w-md mx-auto">
            Join salons across KL that are saving hours every week with automated WhatsApp bookings.
          </p>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-medium text-[#1c1720] bg-gradient-to-r from-[#d1b799] to-[#c4a67e] hover:from-[#dcc5a8] hover:to-[#d1b799] transition-all shadow-[0_2px_8px_rgba(166,139,107,0.3)]"
          >
            Get started free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#d1b799] to-[#a68b6b] flex items-center justify-center">
              <CadenceIcon className="w-[12px] h-[9px] text-[#1c1720]" />
            </div>
            <span className="text-[12px] text-muted-foreground">
              Cadence
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Built for salons in Malaysia
          </p>
        </div>
      </footer>
    </div>
  );
}
