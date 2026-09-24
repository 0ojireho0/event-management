"use client";

import { useState } from "react";
import { LoaderCircle, UserRoundPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/functions/auth";
import { finishUserMutation } from "@/lib/user-management-state.mjs";

const fieldLabel = "mb-1.5 block text-xs font-semibold text-[#6f625b]";

export function UserFormDialog({ open, onOpenChange, onCloseAutoFocus, user, onSubmit }) {
  const editing = Boolean(user);
  const [fields, setFields] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    password_confirmation: "",
  });
  const [mutation, setMutation] = useState({ open, submitting: false, error: "", user });

  function updateField(key, value) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  function handleOpenChange(nextOpen) {
    if (!mutation.submitting) onOpenChange(nextOpen);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (mutation.submitting) return;

    setMutation((current) => ({ ...current, submitting: true, error: "" }));

    try {
      await onSubmit({
        name: fields.name.trim(),
        email: fields.email.trim(),
        password: fields.password,
        password_confirmation: fields.password_confirmation,
      });
      setMutation((current) => finishUserMutation(current, { ok: true }));
      onOpenChange(false);
    } catch (error) {
      setMutation((current) => finishUserMutation(current, {
        ok: false,
        error: getApiErrorMessage(error, "Could not save this scanner. Please try again."),
      }));
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={!mutation.submitting} className="max-w-lg" onCloseAutoFocus={onCloseAutoFocus}>
        <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-7">
          <DialogHeader className="pr-8">
            <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-[#ffdece] text-[#f6671e]">
              <UserRoundPlus className="size-5" aria-hidden="true" />
            </div>
            <DialogTitle>{editing ? "Edit Scanner" : "Add Scanner"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update this scanner account." : "Create an account for someone who checks in attendees."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div>
              <label htmlFor="scanner-name" className={fieldLabel}>Name</label>
              <Input
                id="scanner-name"
                name="name"
                autoComplete="name"
                required
                maxLength={255}
                value={fields.name}
                onChange={(event) => updateField("name", event.target.value)}
                disabled={mutation.submitting}
                placeholder="Full name"
              />
            </div>
            <div>
              <label htmlFor="scanner-email" className={fieldLabel}>Email</label>
              <Input
                id="scanner-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={255}
                value={fields.email}
                onChange={(event) => updateField("email", event.target.value)}
                disabled={mutation.submitting}
                placeholder="name@example.com"
              />
            </div>
            <div>
              <label htmlFor="scanner-role" className={fieldLabel}>Role</label>
              <Input id="scanner-role" value="Scanner" disabled aria-describedby="scanner-role-help" />
              <p id="scanner-role-help" className="mt-1.5 text-xs text-[#8a766b]">Scanner accounts can use check-in tools.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="scanner-password" className={fieldLabel}>
                  Password{editing ? " (optional)" : ""}
                </label>
                <Input
                  id="scanner-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required={!editing}
                  value={fields.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  disabled={mutation.submitting}
                  placeholder={editing ? "Leave blank to keep" : "Create password"}
                />
              </div>
              <div>
                <label htmlFor="scanner-password-confirmation" className={fieldLabel}>Confirm password</label>
                <Input
                  id="scanner-password-confirmation"
                  name="password_confirmation"
                  type="password"
                  autoComplete="new-password"
                  required={!editing || Boolean(fields.password)}
                  value={fields.password_confirmation}
                  onChange={(event) => updateField("password_confirmation", event.target.value)}
                  disabled={mutation.submitting}
                  placeholder="Repeat password"
                />
              </div>
            </div>
          </div>

          {mutation.error && (
            <p role="alert" className="whitespace-pre-line rounded-xl bg-[#fff0ed] px-4 py-3 text-sm text-[#a5261d]">
              {mutation.error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={mutation.submitting}>Cancel</Button>
            <Button type="submit" disabled={mutation.submitting}>
              {mutation.submitting && <LoaderCircle className="animate-spin" aria-hidden="true" />}
              {editing ? "Save Changes" : "Add Scanner"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
