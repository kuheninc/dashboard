"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";

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

type Mode = "signIn" | "signUp" | "forgotPassword" | "resetSent";

export default function SignInPage() {
  const { signIn } = useAuthActions();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const router = useRouter();

  // If already authenticated, go straight to dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      window.location.href = "/dashboard";
    }
  }, [authLoading, isAuthenticated]);

  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (mode === "forgotPassword") {
      setMode("resetSent");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const flow = mode === "signUp" ? "signUp" : "signIn";
      await signIn("password", { email, password, flow });
      // Sign-up → onboarding; Sign-in → dashboard
      window.location.href = mode === "signUp" ? "/onboarding" : "/dashboard";
    } catch (err) {
      const msg =
        mode === "signUp"
          ? "Could not create account. That email may already be in use."
          : "Invalid email or password. Please try again.";
      setError(msg);
      setLoading(false);
    }
  }

  function switchMode(newMode: Mode) {
    setMode(newMode);
    setError("");
    setPassword("");
  }

  const title = {
    signIn: "Welcome back",
    signUp: "Create your account",
    forgotPassword: "Reset your password",
    resetSent: "Check your inbox",
  }[mode];

  const subtitle = {
    signIn: "Sign in to manage your salon",
    signUp: "Set up your email and password to get started",
    forgotPassword: "We'll send you a link to get back in",
    resetSent: `We've sent a reset link to ${email}`,
  }[mode];

  // Show loading while checking auth state to prevent form flash
  if (authLoading || isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#1c1720" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#d1b799] to-[#a68b6b] flex items-center justify-center animate-pulse">
            <CadenceIcon className="w-5 h-3.5 text-[#1c1720]" />
          </div>
          <span className="font-display text-[15px] text-[rgba(242,235,224,0.5)]">Cadence</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: "#1c1720" }}>
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] flex-col justify-between p-12 relative overflow-hidden">
        {/* Ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 70%, rgba(209,183,153,0.08) 0%, transparent 60%), radial-gradient(circle at 70% 30%, rgba(166,139,107,0.05) 0%, transparent 50%)",
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d1b799] to-[#a68b6b] flex items-center justify-center">
              <CadenceIcon className="w-5 h-3.5 text-[#1c1720]" />
            </div>
            <span className="font-display text-[22px] text-[#f2ebe0]">
              Cadence
            </span>
          </div>

          <h2 className="font-display text-[32px] leading-tight text-[#f2ebe0] mb-4">
            Your salon,<br />running on rhythm.
          </h2>
          <p className="text-[15px] leading-relaxed text-[rgba(242,235,224,0.5)] max-w-[360px]">
            Bookings, clients, and WhatsApp — all in one place.
            Let your business flow.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 text-[12px] text-[rgba(242,235,224,0.3)]">
          <div className="w-1.5 h-1.5 rounded-full bg-[#5a9a6e]" />
          All systems operational
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-12">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#d1b799] to-[#a68b6b] flex items-center justify-center">
              <CadenceIcon className="w-[18px] h-[13px] text-[#1c1720]" />
            </div>
            <span className="font-display text-[17px] text-[#f2ebe0]">
              Cadence
            </span>
          </div>

          <h1 className="font-display text-[26px] text-[#f2ebe0] mb-1.5">
            {title}
          </h1>
          <p className="text-[14px] text-[rgba(242,235,224,0.45)] mb-8">
            {subtitle}
          </p>

          {mode === "resetSent" ? (
            <div className="space-y-6">
              <div className="p-4 rounded-xl border border-[rgba(90,154,110,0.3)] bg-[rgba(90,154,110,0.08)]">
                <p className="text-[13px] text-[rgba(242,235,224,0.7)] leading-relaxed">
                  If an account exists with that email, you'll receive a password reset link shortly. Check your spam folder too.
                </p>
              </div>
              <button
                onClick={() => switchMode("signIn")}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[13px] font-medium text-[#f2ebe0] bg-[rgba(242,235,224,0.06)] hover:bg-[rgba(242,235,224,0.1)] transition-colors"
              >
                I remember now, take me back
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-[11px] font-medium text-[rgba(242,235,224,0.4)] uppercase tracking-[0.04em] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@yoursalon.com"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-[rgba(242,235,224,0.06)] border border-[rgba(242,235,224,0.08)] text-[14px] text-[#f2ebe0] placeholder:text-[rgba(242,235,224,0.25)] focus:outline-none focus:border-[#a68b6b] focus:ring-1 focus:ring-[#a68b6b] transition-colors"
                />
              </div>

              {/* Password (hidden for forgot password) */}
              {(mode === "signIn" || mode === "signUp") && (
                <div>
                  <label className="block text-[11px] font-medium text-[rgba(242,235,224,0.4)] uppercase tracking-[0.04em] mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      required
                      className="w-full px-4 py-3 pr-11 rounded-xl bg-[rgba(242,235,224,0.06)] border border-[rgba(242,235,224,0.08)] text-[14px] text-[#f2ebe0] placeholder:text-[rgba(242,235,224,0.25)] focus:outline-none focus:border-[#a68b6b] focus:ring-1 focus:ring-[#a68b6b] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(242,235,224,0.35)] hover:text-[rgba(242,235,224,0.6)] transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="p-3 rounded-xl bg-[rgba(196,90,90,0.12)] border border-[rgba(196,90,90,0.25)]">
                  <p className="text-[12px] text-[#e88a8a]">{error}</p>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 !mt-6 rounded-xl text-[14px] font-medium text-[#1c1720] bg-gradient-to-r from-[#d1b799] to-[#c4a67e] hover:from-[#dcc5a8] hover:to-[#d1b799] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_1px_2px_rgba(0,0,0,0.2)]"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {mode === "signIn" && "Take me to my salon"}
                    {mode === "signUp" && "Create account"}
                    {mode === "forgotPassword" && "Help me get back in"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Mode switcher */}
          <div className="mt-8 pt-6 border-t border-[rgba(242,235,224,0.06)]">
            {mode === "signIn" && (
              <button
                onClick={() => switchMode("forgotPassword")}
                className="w-full text-center text-[13px] text-[rgba(242,235,224,0.5)] hover:text-[rgba(242,235,224,0.75)] transition-colors"
              >
                Can't remember your password?{" "}
                <span className="text-[#c4a67e] font-medium">Reset it</span>
              </button>
            )}

            {(mode === "forgotPassword" || mode === "resetSent") && (
              <button
                onClick={() => switchMode("signIn")}
                className="w-full text-center text-[13px] text-[rgba(242,235,224,0.5)] hover:text-[rgba(242,235,224,0.75)] transition-colors"
              >
                Wait, I remember now —{" "}
                <span className="text-[#c4a67e] font-medium">take me back</span>
              </button>
            )}

            {mode === "signUp" && (
              <button
                onClick={() => switchMode("signIn")}
                className="w-full text-center text-[13px] text-[rgba(242,235,224,0.5)] hover:text-[rgba(242,235,224,0.75)] transition-colors"
              >
                Already have an account?{" "}
                <span className="text-[#c4a67e] font-medium">Sign in</span>
              </button>
            )}
          </div>

          {/* Sign-up CTA */}
          {mode === "signIn" && (
            <div className="mt-6 p-4 rounded-xl bg-[rgba(209,183,153,0.06)] border border-[rgba(209,183,153,0.1)]">
              <p className="text-[13px] text-[rgba(242,235,224,0.5)] mb-2.5">
                New here? Let's get you set up.
              </p>
              <button
                onClick={() => switchMode("signUp")}
                className="flex items-center gap-2 text-[13px] font-medium text-[#c4a67e] hover:text-[#d1b799] transition-colors"
              >
                Set up my salon
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
