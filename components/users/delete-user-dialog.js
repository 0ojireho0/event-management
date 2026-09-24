"use client";

import { useState } from "react";
import { LoaderCircle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getApiErrorMessage } from "@/functions/auth";
import { finishUserMutation } from "@/lib/user-management-state.mjs";

export function DeleteUserDialog({ user, open, onOpenChange, onCloseAutoFocus, onConfirm }) {
  const [mutation, setMutation] = useState({ open, submitting: false, error: "", user });

  function handleOpenChange(nextOpen) {
    if (!mutation.submitting) onOpenChange(nextOpen);
  }

  async function handleDelete() {
    if (mutation.submitting) return;

    setMutation((current) => ({ ...current, submitting: true, error: "" }));

    try {
      await onConfirm(user.id);
      setMutation((current) => finishUserMutation(current, { ok: true }));
      onOpenChange(false);
    } catch (error) {
      setMutation((current) => finishUserMutation(current, {
        ok: false,
        error: getApiErrorMessage(error, "Could not delete this scanner. Please try again."),
      }));
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={!mutation.submitting} className="max-w-md" onCloseAutoFocus={onCloseAutoFocus}>
        <div className="space-y-5 p-6 sm:p-7">
          <DialogHeader className="pr-8">
            <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-[#fff0ed] text-[#ba1a1a]">
              <Trash2 className="size-5" aria-hidden="true" />
            </div>
            <DialogTitle>Delete Scanner?</DialogTitle>
            <DialogDescription>
              Delete {user.name}&apos;s Scanner account? They will lose access to check-in tools.
            </DialogDescription>
          </DialogHeader>

          {mutation.error && (
            <p role="alert" className="whitespace-pre-line rounded-xl bg-[#fff0ed] px-4 py-3 text-sm text-[#a5261d]">
              {mutation.error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={mutation.submitting}>Cancel</Button>
            <Button
              type="button"
              onClick={handleDelete}
              disabled={mutation.submitting}
              className="bg-[#ba1a1a] hover:bg-[#93000a]"
            >
              {mutation.submitting && <LoaderCircle className="animate-spin" aria-hidden="true" />}
              Delete Scanner
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
