"use client";

import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck2,
  Mail,
  MailCheck,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function BrandMark({ compact = false }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex shrink-0 items-center justify-center rounded-lg bg-[#3525cd] text-white shadow-[0_1px_8px_rgba(0,0,0,0.04)] ${
          compact ? "size-8" : "size-10 rounded-xl"
        }`}
      >
        <CalendarCheck2 className={compact ? "size-4.5" : "size-5.5"} />
      </div>
      {compact && (
        <span className="text-xl leading-7 font-bold tracking-tight text-[#131b2e]">
          NexusEvent<span className="text-[#3525cd]">360</span>
        </span>
      )}
    </div>
  );
}

function LoginHeader() {
  return (
    <header className="z-10 flex w-full items-center justify-between px-4 py-4 sm:px-8">
      <BrandMark compact />
      <div className="hidden items-center gap-1 text-[#006c49] sm:flex">
        <ShieldCheck className="size-4" />
        <span className="text-[11px] leading-3.5 font-semibold tracking-[0.08em] uppercase">
          SOC2 Type II • 256-Bit SSL
        </span>
      </div>
    </header>
  );
}

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("admin@company.com");

  function handleSubmit(event) {
    event.preventDefault();
    if (!email.trim()) return;
    onLogin(email.trim());
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
            placeholder="admin@company.com"
            className="h-10 rounded-lg bg-[#f2f3ff] pr-4 pl-10 shadow-sm transition-all focus-visible:bg-white focus-visible:ring-[#3525cd]"
            required
          />
        </div>
      </div>

      <div className="flex items-start gap-2 pt-1 text-[#464555]">
        <MailCheck className="mt-0.5 size-4 shrink-0 text-[#3525cd]" />
        <span className="select-none text-xs leading-4">
          We&apos;ll send a secure magic link or OTP to your email inbox.
        </span>
      </div>

      <Button
        type="submit"
        className="mt-4 h-12 w-full rounded-lg bg-[#4f46e5] px-6 text-sm shadow-md hover:bg-[#3525cd] hover:shadow-lg active:scale-[0.99]"
      >
        Continue with Email
        <ArrowRight className="size-4.5" />
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
            Continue with Email
          </h1>
          <p className="mt-1 text-sm leading-5 text-[#464555]">
            Enter your enterprise work email to receive an instant access link or code.
          </p>
        </div>

        <LoginForm onLogin={onLogin} />

        <div className="mt-6 flex items-start justify-center gap-1.5 border-t border-[#dae2fd] pt-4 text-[#464555] sm:items-center">
          <BadgeCheck className="mt-0.5 size-4 shrink-0 text-[#006c49] sm:mt-0" />
          <span className="text-center text-[11px] leading-4">
            Protected by enterprise grade encryption • SOC 2 Type II
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function LoginFooter() {
  return (
    <footer className="flex w-full flex-col items-center justify-between gap-2 px-4 py-4 text-[#464555] sm:flex-row sm:px-8">
      <span className="text-xs leading-4">© 2025 NexusEvent 360 Inc. All rights reserved.</span>
      <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2" aria-label="Legal">
        {["Privacy Policy", "Terms of Service", "Help & Support"].map((item) => (
          <a
            key={item}
            className="text-xs leading-4 transition-colors hover:text-[#131b2e]"
            href="#"
          >
            {item}
          </a>
        ))}
      </nav>
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
