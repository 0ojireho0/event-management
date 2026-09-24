"use client";

import { ClipboardList, Mail, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { buildAnsweredFormRows } from "@/lib/registration-answers.mjs";

export default function AnsweredFormsDialog({ registration, open, onOpenChange }) {
  const attendee = registration?.attendee;
  const answers = buildAnsweredFormRows(registration);
  const attendeeName = attendee
    ? `${attendee.first_name || ""} ${attendee.last_name || ""}`.trim()
    : "Attendee";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <div className="border-b border-[#ffdece] bg-[#fff4ee] px-6 py-5 pr-14">
          <DialogHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-[#f6671e] text-white">
              <ClipboardList className="size-5" />
            </div>
            <DialogTitle>Answered registration form</DialogTitle>
            <DialogDescription>
              Review the answers submitted by this attendee.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-5 p-6">
          <div className="flex flex-col gap-3 rounded-xl border border-[#ffdece] bg-[#fffaf7] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 font-semibold text-[#25170f]">
                <UserRound className="size-4 text-[#f6671e]" />
                {attendeeName}
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-[#6f625b]">
                <Mail className="size-3.5" />
                {attendee?.email || "No email address"}
              </div>
            </div>
            <Badge variant="neutral">{answers.length} answer{answers.length === 1 ? "" : "s"}</Badge>
          </div>

          {answers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#f3c7b2] px-5 py-8 text-center text-sm text-[#6f625b]">
              This attendee has no recorded form answers.
            </div>
          ) : (
            <ol className="space-y-3">
              {answers.map((answer, index) => (
                <li key={answer.id} className="rounded-xl border border-[#ffdece] p-4">
                  <p className="text-xs font-bold tracking-[0.05em] text-[#96877f] uppercase">
                    Question {index + 1}
                  </p>
                  <p className="mt-1 font-semibold text-[#25170f]">{answer.label}</p>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#6f625b]">
                    {answer.answer}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
