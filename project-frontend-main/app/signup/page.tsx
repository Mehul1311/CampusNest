"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UserPlus, Eye, EyeOff, ArrowRight } from "lucide-react";

const currentYear = new Date().getFullYear();

const inputClass =
  "h-11 rounded-xl bg-[#F5F2ED] border-[#E8E4DF] text-[#2C1810] placeholder:text-[#9C8B82] focus-visible:ring-[#96583A]";
const labelClass = "text-[#2C1810] font-medium text-sm";

export default function SignupPage() {
  const { signup, signupWithGoogle, signInWithGoogle, error, clearError } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<"choose" | "email" | "google">("choose");
  const [googleData, setGoogleData] = useState<{ idToken: string; name: string; email: string } | null>(null);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleGoogleStart = async () => {
    clearError();
    setSubmitting(true);
    try {
      const { getFirebaseAuth, getGoogleProvider } = await import("@/lib/firebase");
      const auth = getFirebaseAuth();
      if (!auth) {
        toast.error("Firebase is not configured. Add Firebase env vars.");
        return;
      }
      const { signInWithPopup } = await import("firebase/auth");
      const result = await signInWithPopup(auth, getGoogleProvider());
      const idToken = await result.user.getIdToken();
      const name = result.user.displayName || result.user.email?.split("@")[0] || "";
      const email = result.user.email || "";
      setGoogleData({ idToken, name, email });
      setStep("google");
      setName(name);
      setEmail(email);
    } catch {
      toast.error("Google sign-in failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleData) return;
    clearError();
    setSubmitting(true);
    try {
      const result = await signupWithGoogle({
        idToken: googleData.idToken,
        phone,
        college,
        password,
      });
      if (result.success) {
        toast.success("Account created! Welcome to CampusNest.");
        router.push("/");
        router.refresh();
      } else {
        toast.error(result.error || "Signup failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!agreeTerms) {
      toast.error("Please agree to the Terms and Privacy Policy");
      return;
    }
    clearError();
    setSubmitting(true);
    try {
      const result = await signup({ email, name, college, phone, password });
      if (result.success) {
        toast.success("Account created! Welcome to CampusNest.");
        router.push("/");
        router.refresh();
      } else {
        toast.error(result.error || "Signup failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const backToChoose = () => {
    setStep("choose");
    setGoogleData(null);
    setEmail("");
    setName("");
    setCollege("");
    setPhone("");
    setPassword("");
    setConfirmPassword("");
    setAgreeTerms(false);
    clearError();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F7] auth-page-pattern">
      <header className="px-6 py-5">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-[#E8E4DF] flex items-center justify-center">
            <span className="text-[#96583A] font-bold text-sm">C</span>
          </div>
          <span className="font-bold text-[#2C1810] text-lg">CampusNest</span>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[400px] mx-auto text-center">
          <div className="w-12 h-12 rounded-xl bg-[#E8E4DF] flex items-center justify-center mb-6 mx-auto">
            <UserPlus className="h-6 w-6 text-[#96583A]" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold text-[#2C1810]">
            {step === "choose" && "Create your account"}
            {step === "email" && "Create your account"}
            {step === "google" && "Complete your profile"}
          </h1>
          <p className="text-sm text-[#6B5B52] mt-1 mb-8">
            {step === "google"
              ? "We got your name and email from Google. Add the details below."
              : "Join your campus marketplace for free"}
          </p>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg mb-6 border border-red-100">
              {error}
            </p>
          )}

          {/* Step: Choose method */}
          {step === "choose" && (
            <>
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 rounded-xl bg-[#F5F2ED] border-[#E8E4DF] text-[#2C1810] hover:bg-[#E8E4DF]"
                onClick={handleGoogleStart}
                disabled={submitting}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-[#E8E4DF]" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-[#FAF9F7] px-3 text-xs text-[#9C8B82]">or continue with</span>
                </div>
              </div>
              <Button
                type="button"
                className="w-full h-12 rounded-xl bg-[#E8E4DF] text-[#2C1810] hover:bg-[#DDD8D0] border-0"
                onClick={() => setStep("email")}
              >
                Sign up with email and password
              </Button>
            </>
          )}

          {/* Step: Google complete */}
          {step === "google" && googleData && (
            <form onSubmit={handleGoogleSignupSubmit} className="space-y-5 text-left">
              <div className="space-y-2">
                <Label className={labelClass}>Full name</Label>
                <Input value={name} readOnly className={inputClass + " bg-[#E8E4DF]"} />
              </div>
              <div className="space-y-2">
                <Label className={labelClass}>Email address</Label>
                <Input value={email} readOnly className={inputClass + " bg-[#E8E4DF]"} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className={labelClass}>Mobile number</Label>
                <div className="flex gap-2">
                  <div className="w-20 h-11 rounded-xl bg-[#E8E4DF] flex items-center justify-center text-sm text-[#6B5B52] shrink-0">
                    IN +91
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    minLength={10}
                    maxLength={10}
                    autoComplete="tel"
                    className={inputClass + " flex-1"}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="college" className={labelClass}>College / Campus</Label>
                <Input
                  id="college"
                  placeholder="e.g. ABC Engineering College"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  required
                  minLength={2}
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className={labelClass}>Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className={inputClass + " pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B5B52]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-2 justify-center">
                <Button type="submit" disabled={submitting} className="flex-1 h-12 rounded-xl bg-[#96583A] hover:bg-[#7D4A2F] text-white font-medium max-w-[200px]">
                  {submitting ? "Creating..." : "Complete signup"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button type="button" variant="outline" onClick={backToChoose} disabled={submitting} className="flex-1 rounded-xl border-[#E8E4DF] text-[#6B5B52] max-w-[200px]">
                  Back
                </Button>
              </div>
            </form>
          )}

          {/* Step: Email signup */}
          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-5 text-left">
              <div className="space-y-2">
                <Label htmlFor="name" className={labelClass}>Full name *</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  autoComplete="name"
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className={labelClass}>Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <Label className={labelClass}>Mobile number</Label>
                <div className="flex gap-2">
                  <div className="w-20 h-11 rounded-xl bg-[#E8E4DF] flex items-center justify-center text-sm text-[#6B5B52] shrink-0">
                    IN +91
                  </div>
                  <Input
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    minLength={10}
                    maxLength={10}
                    autoComplete="tel"
                    className={inputClass + " flex-1"}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="college" className={labelClass}>College / Campus</Label>
                <Input
                  id="college"
                  placeholder="Select your college"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  required
                  minLength={2}
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className={labelClass}>Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className={inputClass + " pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B5B52]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className={labelClass}>Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className={inputClass + " pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B5B52]"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 rounded border-[#C4BDB5] text-[#96583A] focus:ring-[#96583A]"
                />
                <span className="text-sm text-[#6B5B52]">
                  I agree to the{" "}
                  <Link href="/" className="text-[#96583A] hover:underline">Terms</Link>
                  {" "}and{" "}
                  <Link href="/" className="text-[#96583A] hover:underline">Privacy Policy</Link>
                </span>
              </label>
              <div className="flex flex-col items-center gap-3">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 rounded-xl bg-[#96583A] hover:bg-[#7D4A2F] text-white font-medium text-base max-w-[280px]"
                >
                  {submitting ? "Creating account..." : "Create Account"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-[#6B5B52] hover:bg-[#E8E4DF] max-w-[280px]"
                  onClick={backToChoose}
                  disabled={submitting}
                >
                  Back
                </Button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-[#6B5B52] mt-8">
            Already have an account?{" "}
            <Link href="/login" className="text-[#96583A] font-medium hover:underline">
              Sign in &gt;
            </Link>
          </p>
        </div>
      </div>

      <footer className="py-6 text-center text-xs text-[#9C8B82]">
        © {currentYear} CampusNest. All rights reserved.
      </footer>
    </div>
  );
}
