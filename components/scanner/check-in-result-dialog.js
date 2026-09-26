"use client";

import { ScanLine, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const toneStyles = {
  warning: {
    icon: "bg-[#fff1cf] text-[#885500]",
    button: "bg-[#885500] hover:bg-[#684000]",
    fallback: "This attendee has already been checked in for the selected event.",
  },
  error: {
    icon: "bg-[#ffe1dc] text-[#ba1a1a]",
    button: "bg-[#ba1a1a] hover:bg-[#93000a]",
    fallback: "This QR code or registration code was not found for the selected event.",
  },
};

export function CheckInResultDialog({ feedback, onScanAnother }) {
  const styles = toneStyles[feedback?.tone] || toneStyles.error;
  const open = Boolean(feedback?.modal);

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onScanAnother(); }}>
      <DialogContent className="max-w-md p-6 sm:p-7" showCloseButton={false}>
        <DialogHeader className="items-center text-center">
          <div className={`mb-3 flex size-14 items-center justify-center rounded-2xl ${styles.icon}`}>
            <TriangleAlert className="size-7" />
          </div>
          <DialogTitle>{feedback?.title}</DialogTitle>
          <DialogDescription className="max-w-sm pt-1 text-sm leading-6">
            {feedback?.detail || styles.fallback}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-5 sm:justify-center">
          <Button type="button" className={styles.button} onClick={onScanAnother}>
            <ScanLine /> Scan Another QR
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
