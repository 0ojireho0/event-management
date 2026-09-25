"use client";

import { KeyRound, LoaderCircle } from "lucide-react";
import { useState } from "react";

import { RoleGate } from "@/components/auth/role-gate";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopHeader } from "@/components/dashboard/top-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/functions/auth";
import api from "@/lib/api";

const emptyForm = {
  current_password: "",
  password: "",
  password_confirmation: "",
};

function SettingsShell({ user, logout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fields, setFields] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateField(event) {
    setFields((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setError("");

    try {
      const response = await api.put("/api/password", fields);
      setFields(emptyForm);
      setMessage(response.data.message);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Password could not be updated. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    setError("");
    try {
      await logout();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Could not log out. Please try again."));
    }
  }

  return (
    <div className="min-h-screen bg-[#fffaf7] text-[#25170f]">
      <Sidebar
        role={user.role}
        activeItem="Settings"
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <TopHeader
        onMenuOpen={() => setSidebarOpen(true)}
        onLogout={handleLogout}
        user={user}
      />

      <div className="xl:pl-72">
        <main className="min-h-screen px-4 pt-[72px] pb-8 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-2xl space-y-6">
            <section className="space-y-1 pt-0.5">
              <h1 className="text-[28px] leading-9 font-bold tracking-tight sm:text-4xl sm:leading-11">
                Settings
              </h1>
              <p className="text-sm text-[#6f625b]">Change the password for your account.</p>
            </section>

            <Card>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-[#ffdece] text-[#f6671e]">
                    <KeyRound className="size-5" aria-hidden="true" />
                  </span>
                  <h2 className="text-lg font-semibold">Change password</h2>
                </div>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="current-password" className="mb-1.5 block text-xs font-medium">
                      Current password
                    </label>
                    <Input
                      id="current-password"
                      name="current_password"
                      type="password"
                      autoComplete="current-password"
                      value={fields.current_password}
                      onChange={updateField}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="new-password" className="mb-1.5 block text-xs font-medium">
                      New password
                    </label>
                    <Input
                      id="new-password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      value={fields.password}
                      onChange={updateField}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="password-confirmation" className="mb-1.5 block text-xs font-medium">
                      Confirm new password
                    </label>
                    <Input
                      id="password-confirmation"
                      name="password_confirmation"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      value={fields.password_confirmation}
                      onChange={updateField}
                      required
                    />
                  </div>

                  {error && (
                    <p role="alert" className="whitespace-pre-line rounded-xl bg-[#fff0ed] px-4 py-3 text-sm text-[#a5261d]">
                      {error}
                    </p>
                  )}
                  {message && (
                    <p role="status" className="rounded-xl bg-[#e6f8ef] px-4 py-3 text-sm text-[#006c49]">
                      {message}
                    </p>
                  )}

                  <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                    {isSubmitting && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
                    {isSubmitting ? "Updating..." : "Update password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <RoleGate>
      {({ user, logout }) => <SettingsShell user={user} logout={logout} />}
    </RoleGate>
  );
}
