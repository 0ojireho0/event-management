"use client";

import { useState } from "react";
import {
  ArrowRight,
  LoaderCircle,
  LockKeyhole,
  Mail,
  User
} from "lucide-react";
import Swal from "sweetalert2";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/functions/auth";

function BrandMark({ compact = false }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex shrink-0 items-center justify-center rounded-lg bg-[#3525cd] text-white shadow-[0_1px_8px_rgba(0,0,0,0.04)] ${
          compact ? "size-8" : "size-10 rounded-xl"
        }`}
      >
        <User className={compact ? "size-4.5" : "size-5.5"} />
      </div>
      {compact && (
        <span className="text-xl leading-7 font-bold tracking-tight text-[#131b2e]">
          EVORA
        </span>
      )}
    </div>
  );
}

function LoginHeader() {
  return (
    <header className="z-10 flex w-full items-center justify-between px-4 py-4 sm:px-8">
      <BrandMark compact />
    </header>
  );
}

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!email.trim() || !password) return;

    setIsSubmitting(true);

    try {
      await onLogin({ email: email.trim(), password });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Sign-in failed",
        text: getApiErrorMessage(
          error,
          "The API could not be reached. Make sure the Laravel server is running.",
        ),
        confirmButtonColor: "#4f46e5",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="work-email" className="mb-1.5 block text-xs leading-4 font-medium text-[#131b2e]">
          Work Email
        </label>
        <div className="relative flex items-center">
          <Mail className="pointer-events-none absolute left-3.5 size-4.5 text-[#777587]" />
          <Input
            id="work-email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            placeholder="test@example.com"
            className="h-10 rounded-lg bg-[#f2f3ff] pr-4 pl-10 shadow-sm transition-all focus-visible:bg-white focus-visible:ring-[#3525cd]"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-xs leading-4 font-medium text-[#131b2e]">
          Password
        </label>
        <div className="relative flex items-center">
          <LockKeyhole className="pointer-events-none absolute left-3.5 size-4.5 text-[#777587]" />
          <Input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            placeholder="Enter your password"
            className="h-10 rounded-lg bg-[#f2f3ff] pr-4 pl-10 shadow-sm transition-all focus-visible:bg-white focus-visible:ring-[#3525cd]"
            required
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 h-12 w-full rounded-lg bg-[#4f46e5] px-6 text-sm shadow-md hover:bg-[#3525cd] hover:shadow-lg active:scale-[0.99]"
      >
        {isSubmitting ? (
          <>
            <LoaderCircle className="size-4.5 animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            Sign in
            <ArrowRight className="size-4.5" />
          </>
        )}
      </Button>
    </form>
  );
}

function LoginCard({ onLogin }) {
  return (
    <Card className="w-full max-w-[440px] rounded-xl shadow-sm hover:shadow-sm">
      <CardContent className="p-6 sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <BrandMark />
          <h1 className="mt-2 text-2xl leading-8 font-bold tracking-tight text-[#131b2e]">
            Welcome back
          </h1>
          <p className="mt-1 text-sm leading-5 text-[#464555]">
            Sign in with your event management account.
          </p>
        </div>

        <LoginForm onLogin={onLogin} />

        {/* <div className="mt-6 flex items-start justify-center gap-1.5 border-t border-[#dae2fd] pt-4 text-[#464555] sm:items-center">
          <BadgeCheck className="mt-0.5 size-4 shrink-0 text-[#006c49] sm:mt-0" />
          <span className="text-center text-[11px] leading-4">
            Created by Jeremiah & Greian
          </span>
        </div> */}
      </CardContent>
    </Card>
  );
}

function LoginFooter() {
  return (
    <footer className="flex w-full flex-col items-center justify-center gap-2 px-4 py-4 text-[#464555] sm:flex-row sm:px-8">
      <span className="text-xs leading-4">© 2026 EVORA. All rights reserved.</span>
    </footer>
  );
}

export default function LoginScreen({ onLogin }) {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-[#faf8ff] text-[#131b2e]">
      <LoginHeader />
      <main className="relative flex w-full flex-1 flex-col items-center justify-center p-4 sm:p-8">
        <LoginCard onLogin={onLogin} />
      </main>
      <LoginFooter />
    </div>
  );
}
