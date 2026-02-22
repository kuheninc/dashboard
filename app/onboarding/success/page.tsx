"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";

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

export default function OnboardingSuccess() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center space-y-8 cadence-animate">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#d1b799] to-[#a68b6b] flex items-center justify-center">
            <CadenceIcon className="w-[18px] h-[13px] text-[#1c1720]" />
          </div>
          <span className="font-display text-[18px] text-foreground">
            Cadence
          </span>
        </div>

        {/* Success icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-[rgba(90,154,110,0.1)] border border-[rgba(90,154,110,0.2)] flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-[#5a9a6e]" />
          </div>
        </div>

        <div>
          <h1 className="font-display text-[24px] text-foreground mb-2">
            You're all set!
          </h1>
          <p className="text-[14px] text-muted-foreground">
            Your salon has been created. Here's what to do next.
          </p>
        </div>

        {/* Next steps card */}
        <div className="bg-card rounded-2xl border border-border p-6 text-left space-y-4">
          <h3 className="font-display text-[15px] text-foreground">
            Connect your WhatsApp webhook
          </h3>
          <ol className="text-[13px] text-muted-foreground space-y-2.5 list-decimal list-inside leading-relaxed">
            <li>
              Go to your Meta Business dashboard &rarr; WhatsApp &rarr; Configuration
            </li>
            <li>
              Set the <strong className="text-foreground">Callback URL</strong> to your
              Convex HTTP endpoint (found in your Convex dashboard under &quot;HTTP Actions&quot;)
            </li>
            <li>
              Set the <strong className="text-foreground">Verify Token</strong> to the
              value in your{" "}
              <code className="px-1.5 py-0.5 rounded-md bg-secondary text-foreground font-mono text-[12px]">
                .env.local
              </code>{" "}
              file
            </li>
            <li>
              Subscribe to the <strong className="text-foreground">messages</strong> webhook field
            </li>
          </ol>
        </div>

        {/* CTA */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-medium text-[#1c1720] bg-gradient-to-r from-[#d1b799] to-[#c4a67e] hover:from-[#dcc5a8] hover:to-[#d1b799] transition-all shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
        >
          Take me to my dashboard
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
