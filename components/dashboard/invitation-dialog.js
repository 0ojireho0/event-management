"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Download, ExternalLink, LoaderCircle, Mail, QrCode, Send } from "lucide-react";
import Image from "next/image";
import QRCode from "qrcode";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";

export function InvitationDialog({ event, open, onOpenChange }) {
  const [email, setEmail] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState(null);
  const registrationUrl = useMemo(() => {
    if (!event || typeof window === "undefined") return "";
    return `${window.location.origin}/register/${event.id}`;
  }, [event]);

  useEffect(() => {
    if (!open || !registrationUrl) return;

    let active = true;
    QRCode.toDataURL(registrationUrl, {
      width: 256,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#25170f", light: "#ffffff" },
    }).then((dataUrl) => {
      if (active) setQrDataUrl(dataUrl);
    });

    return () => {
      active = false;
    };
  }, [open, registrationUrl]);

  async function sendInvitation(submitEvent) {
    submitEvent.preventDefault();
    if (!email.trim()) return;

    setIsSending(true);
    setMessage(null);

    try {
      const { data } = await api.post(`/api/events/${event.sourceId}/invitations`, {
        email: email.trim(),
      });
      setMessage({ type: "success", text: data.message });
      setEmail("");
    } catch (error) {
      const errors = error.response?.data?.errors;
      setMessage({
        type: "error",
        text: errors
          ? Object.values(errors).flat().join(" ")
          : error.response?.data?.message || "The invitation could not be sent.",
      });
    } finally {
      setIsSending(false);
    }
  }

  function downloadQrCode() {
    if (!qrDataUrl) return;

    const downloadLink = document.createElement("a");
    const filename = (event?.title || "event").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    downloadLink.href = qrDataUrl;
    downloadLink.download = `${filename || "event"}-registration-qr.png`;
    downloadLink.click();
    setMessage({ type: "success", text: "Registration QR downloaded." });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader className={"mt-4 ml-4"}>
          <DialogTitle>Event published successfully</DialogTitle>
          <DialogDescription>
            Invite attendees by email or let them scan the registration QR code.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <section className="rounded-2xl bg-[#fff4ee] p-5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#ffdece] text-[#f6671e]">
              <Mail className="size-5" />
            </div>
            <h3 className="mt-3 font-bold text-[#25170f]">Email an invitation</h3>
            <p className="mt-1 text-xs leading-5 text-[#6f625b]">
              The email contains the event name and registration link.
            </p>
            <form onSubmit={sendInvitation} className="mt-4 space-y-3">
              <Input
                type="email"
                value={email}
                onChange={(inputEvent) => setEmail(inputEvent.target.value)}
                placeholder="attendee@example.com"
                required
                className="bg-white"
              />
              <Button type="submit" className="w-full" disabled={isSending}>
                {isSending ? <LoaderCircle className="animate-spin" /> : <Send />}
                {isSending ? "Sending..." : "Send Invitation"}
              </Button>
            </form>
          </section>

          <section className="flex flex-col items-center rounded-2xl border border-[#ffdece] bg-white p-5 text-center">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#ffdece] text-[#f6671e]">
              <QrCode className="size-5" />
            </div>
            <h3 className="mt-3 font-bold text-[#25170f]">Registration QR</h3>
            <div className="mt-3 flex size-56 items-center justify-center rounded-xl bg-[#fffaf7] p-2">
              {qrDataUrl ? (
                <Image src={qrDataUrl} alt={`Registration QR code for ${event?.title || "event"}`} width={208} height={208} unoptimized />
              ) : (
                <LoaderCircle className="size-7 animate-spin text-[#f6671e]" />
              )}
            </div>
            <div className="mt-3 flex w-full gap-2">
              <Button type="button" variant="secondary" size="sm" className="flex-1" onClick={downloadQrCode} disabled={!qrDataUrl}>
                <Download />Download QR
              </Button>
              <Button asChild size="sm" className="flex-1">
                <a href={registrationUrl} target="_blank" rel="noreferrer"><ExternalLink />Open Form</a>
              </Button>
            </div>
          </section>
        </div>

        {message && (
          <div role="status" className={message.type === "success" ? "mt-4 flex items-center gap-2 rounded-xl bg-[#6cf8bb]/35 px-4 py-3 text-sm font-medium text-[#006c49]" : "mt-4 rounded-xl bg-[#ffdad6] px-4 py-3 text-sm font-medium text-[#93000a]"}>
            {message.type === "success" && <CheckCircle2 className="size-4" />}
            {message.text}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
