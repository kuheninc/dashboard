"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Loader2, ArrowLeft, Mail } from "lucide-react";

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

type View = "signIn" | "resetEmail" | "resetCode";

export default function SignInPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();

  const [view, setView] = useState<View>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Reset flow state
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signIn("password", {
        email: email.trim(),
        password,
        flow: "signIn",
      });
      router.push("/dashboard");
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signIn("password", {
        email: email.trim(),
        flow: "reset",
      });
      setView("resetCode");
    } catch {
      setError("Could not send reset code. Please check your email address.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await signIn("password", {
        email: email.trim(),
        code: resetCode,
        newPassword,
        flow: "reset-verification",
      });
      setView("signIn");
      setSuccessMsg("Password reset successful. Sign in with your new password.");
      setPassword("");
      setResetCode("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setError("Invalid or expired code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-[#faf7f2] border border-[rgba(42,36,32,0.08)] text-[14px] text-[#2a2420] placeholder:text-[#9c9184] focus:outline-none focus:border-[#a68b6b] focus:ring-1 focus:ring-[#a68b6b] transition-colors";

  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, "$1***$3")
    : "";

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel: dark branding ── */}
      <div className="hidden lg:flex lg:w-[42%] bg-[#1c1720] relative overflow-hidden flex-col justify-between p-10 xl:p-14">
        {/* Ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 20% 80%, rgba(196,166,126,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(196,166,126,0.04) 0%, transparent 60%)",
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d1b799] to-[#a68b6b] flex items-center justify-center">
            <CadenceIcon className="w-5 h-[14px] text-[#1c1720]" />
          </div>
          <span className="font-display text-[20px] text-[#f2ebe0]">
            Cadence
          </span>
        </div>

        {/* Tagline */}
        <div className="relative z-10">
          <h1 className="font-display text-[36px] xl:text-[42px] leading-[1.1] text-[#f2ebe0] mb-4">
            Your salon,
            <br />
            running on rhythm.
          </h1>
          <p className="text-[15px] leading-relaxed text-[#9c9184] max-w-[360px]">
            Bookings, clients, and WhatsApp — all in one
            place. Let your business flow.
          </p>
        </div>

        {/* Bottom decoration */}
        <div className="relative z-10 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#5a9a6e]" />
          <span className="text-[12px] text-[#6b6058]">
            Powered by Cadence
          </span>
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-10 bg-background">
        <div className="w-full max-w-[420px] cadence-animate">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#d1b799] to-[#a68b6b] flex items-center justify-center">
              <CadenceIcon className="w-[18px] h-[13px] text-[#1c1720]" />
            </div>
            <span className="font-display text-[18px] text-foreground">
              Cadence
            </span>
          </div>

          {/* ─── View: Sign In ─── */}
          {view === "signIn" && (
            <div className="cadence-animate">
              <h2 className="font-display text-[28px] text-foreground mb-1.5">
                Welcome back
              </h2>
              <p className="text-[14px] text-muted-foreground mb-8">
                Sign in to manage your salon
              </p>

              {successMsg && (
                <div className="mb-5 p-3.5 rounded-xl bg-[rgba(90,154,110,0.08)] border border-[rgba(90,154,110,0.2)]">
                  <p className="text-[13px] text-[#5a9a6e]">{successMsg}</p>
                </div>
              )}

              <form onSubmit={handleSignIn} className="space-y-5">
                <div>
                  <label className="font-label text-muted-foreground mb-2 block">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className={inputClass}
                    placeholder="you@yoursalon.com"
                    autoComplete="email"
                    required
                  />
                </div>

                <div>
                  <label className="font-label text-muted-foreground mb-2 block">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError(null);
                      }}
                      className={`${inputClass} pr-11`}
                      placeholder="At least 8 characters"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9c9184] hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-[18px] h-[18px]" />
                      ) : (
                        <Eye className="w-[18px] h-[18px]" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-[rgba(196,90,90,0.08)] border border-[rgba(196,90,90,0.15)]">
                    <p className="text-[13px] text-[#c45a5a]">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email || !password}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-semibold text-[#1c1720] bg-gradient-to-r from-[#d1b799] to-[#c4a67e] hover:from-[#dcc5a8] hover:to-[#d1b799] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Take me to my salon
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="my-6 border-t border-[rgba(42,36,32,0.06)]" />

              {/* Forgot password */}
              <div className="text-[13px] text-muted-foreground">
                <button
                  type="button"
                  onClick={() => {
                    setView("resetEmail");
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="hover:text-foreground transition-colors"
                >
                  Can&apos;t remember your password?{" "}
                  <span className="text-[#a68b6b] font-medium">Reset it</span>
                </button>
              </div>

              {/* New here card */}
              <div className="mt-6 p-5 rounded-xl bg-[#f0ebe3] border border-[rgba(42,36,32,0.06)]">
                <p className="text-[14px] font-medium text-foreground mb-1">
                  New here? Let&apos;s get you set up.
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/onboarding")}
                  className="flex items-center gap-1.5 text-[13px] font-medium text-[#a68b6b] hover:text-[#8a7055] transition-colors"
                >
                  Set up my salon
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ─── View: Reset - Enter Email ─── */}
          {view === "resetEmail" && (
            <div className="cadence-animate">
              <button
                type="button"
                onClick={() => {
                  setView("signIn");
                  setError(null);
                }}
                className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-6 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to sign in
              </button>

              <h2 className="font-display text-[28px] text-foreground mb-1.5">
                Reset your password
              </h2>
              <p className="text-[14px] text-muted-foreground mb-8">
                Enter your email and we&apos;ll send you a verification code.
              </p>

              <form onSubmit={handleResetRequest} className="space-y-5">
                <div>
                  <label className="font-label text-muted-foreground mb-2 block">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null);
                    }}
                    className={inputClass}
                    placeholder="you@yoursalon.com"
                    autoComplete="email"
                    required
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-[rgba(196,90,90,0.08)] border border-[rgba(196,90,90,0.15)]">
                    <p className="text-[13px] text-[#c45a5a]">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-semibold text-[#1c1720] bg-gradient-to-r from-[#d1b799] to-[#c4a67e] hover:from-[#dcc5a8] hover:to-[#d1b799] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Send verification code
                      <Mail className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ─── View: Reset - Enter Code + New Password ─── */}
          {view === "resetCode" && (
            <div className="cadence-animate">
              <button
                type="button"
                onClick={() => {
                  setView("resetEmail");
                  setError(null);
                }}
                className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-6 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>

              <h2 className="font-display text-[28px] text-foreground mb-1.5">
                Check your email
              </h2>
              <p className="text-[14px] text-muted-foreground mb-8">
                We sent a code to{" "}
                <span className="font-medium text-foreground">
                  {maskedEmail}
                </span>
              </p>

              <form onSubmit={handleResetVerify} className="space-y-5">
                <div>
                  <label className="font-label text-muted-foreground mb-2 block">
                    Verification code
                  </label>
                  <input
                    type="text"
                    value={resetCode}
                    onChange={(e) => {
                      setResetCode(e.target.value);
                      setError(null);
                    }}
                    className={`${inputClass} font-mono text-center text-[18px] tracking-[0.3em]`}
                    placeholder="000000"
                    maxLength={8}
                    required
                  />
                </div>

                <div>
                  <label className="font-label text-muted-foreground mb-2 block">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setError(null);
                      }}
                      className={`${inputClass} pr-11`}
                      placeholder="At least 8 characters"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9c9184] hover:text-foreground transition-colors"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-[18px] h-[18px]" />
                      ) : (
                        <Eye className="w-[18px] h-[18px]" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-label text-muted-foreground mb-2 block">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError(null);
                    }}
                    className={inputClass}
                    placeholder="Re-enter your new password"
                    required
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-[rgba(196,90,90,0.08)] border border-[rgba(196,90,90,0.15)]">
                    <p className="text-[13px] text-[#c45a5a]">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !resetCode || !newPassword || !confirmPassword}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-semibold text-[#1c1720] bg-gradient-to-r from-[#d1b799] to-[#c4a67e] hover:from-[#dcc5a8] hover:to-[#d1b799] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Reset password"
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
