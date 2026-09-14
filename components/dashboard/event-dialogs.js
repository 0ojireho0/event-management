import { useState } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  CircleAlert,
  PartyPopper,
  PlusCircle,
  QrCode,
  ScanQrCode,
  Settings2,
  ShieldCheck,
  Vote,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const fieldLabel =
  "mb-1 block text-[11px] leading-4 font-semibold text-[#464555] uppercase";
const selectClass =
  "h-10 w-full rounded-xl border-0 bg-[#f2f3ff] px-3 text-sm text-[#131b2e] outline-none focus:ring-2 focus:ring-[#3525cd]/25";

function DialogHeading({ icon: Icon, title, description, tone = "primary" }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm",
          tone === "success" ? "bg-[#006c49]" : "bg-[#3525cd]",
        )}
      >
        <Icon className="size-5" />
      </div>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
    </div>
  );
}

export function CreateEventDialog({ open, onOpenChange, onCreated }) {
  function handleSubmit(event) {
    event.preventDefault();
    onOpenChange(false);
    onCreated();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0">
        <div className="bg-[#f2f3ff] p-6 pr-14">
          <DialogHeading
            icon={PlusCircle}
            title="Create New Event"
            description="Configure live ticketing, gate check-in, and stage tools"
          />
        </div>

        <form className="space-y-4 p-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="event-title" className={fieldLabel}>
              Event Title
            </label>
            <Input
              id="event-title"
              name="event-title"
              placeholder="e.g. Annual Winter Showcase 2026"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="event-category" className={fieldLabel}>
                Category
              </label>
              <select id="event-category" className={selectClass} defaultValue="Corporate Gala">
                <option>Corporate Gala</option>
                <option>Technical Summit</option>
                <option>Networking Mixer</option>
                <option>Awards Ceremony</option>
              </select>
            </div>
            <div>
              <label htmlFor="event-capacity" className={fieldLabel}>
                Expected Quorum Cap
              </label>
              <Input id="event-capacity" name="event-capacity" type="number" placeholder="e.g. 500" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="event-date" className={fieldLabel}>
                Date & Time
              </label>
              <Input id="event-date" name="event-date" type="datetime-local" />
            </div>
            <div>
              <label htmlFor="event-venue" className={fieldLabel}>
                Venue Location
              </label>
              <Input id="event-venue" name="event-venue" placeholder="e.g. Grand Ballroom Hall B" />
            </div>
          </div>

          <fieldset className="space-y-2 rounded-xl bg-[#f2f3ff] p-3">
            <legend className="px-1 text-[11px] leading-4 font-semibold text-[#464555] uppercase">
              Active Tools Enabled
            </legend>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#131b2e]">
              {["QR Scanners", "Live Raffle", "Star Voting"].map((tool) => (
                <label key={tool} className="inline-flex cursor-pointer items-center gap-1.5">
                  <input type="checkbox" defaultChecked className="accent-[#3525cd]" />
                  <span>{tool}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Publish Event</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ScannerPanel({ onToast }) {
  const [scanState, setScanState] = useState("ready");
  const states = {
    ready: {
      icon: ShieldCheck,
      title: "Ready for Gate Optical Read",
      detail: "Gate Scanner Device #04 is connected",
      classes: "bg-[#f2f3ff] text-[#131b2e]",
      iconClasses: "text-[#006c49]",
    },
    success: {
      icon: CheckCircle2,
      title: "ACCESS GRANTED",
      detail: "Devon Ross • ID: NX-90123 • Attended Confirmed",
      classes: "bg-[#6cf8bb] text-[#00714d]",
      iconClasses: "text-[#00714d]",
    },
    duplicate: {
      icon: CircleAlert,
      title: "ALREADY CHECKED-IN",
      detail: "Badge previously scanned. Flag to supervisor.",
      classes: "bg-amber-100 text-amber-900",
      iconClasses: "text-amber-700",
    },
    error: {
      icon: XCircle,
      title: "INVALID PASS",
      detail: "Direct attendee to Helpdesk Desk 03.",
      classes: "bg-[#ffdad6] text-[#93000a]",
      iconClasses: "text-[#ba1a1a]",
    },
  };
  const current = states[scanState];
  const CurrentIcon = current.icon;

  function updateState(state) {
    setScanState(state);
    if (state === "success") onToast("Scan Verified (Gate 01)", "Attendee Devon Ross verified.");
    if (state === "duplicate") onToast("Duplicate Scan Warning", "Badge already consumed.");
    if (state === "error") onToast("Security Alert", "Unrecognized QR token rejected.");
  }

  return (
    <div className="space-y-4">
      <p className="text-center text-xs leading-4 text-[#464555]">
        Choose a condition to simulate the response shown on a field scanner.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => updateState("success")}
          className="rounded-xl bg-[#6cf8bb] p-3 text-center font-semibold text-[#00714d] transition-opacity hover:opacity-85"
        >
          <CheckCircle2 className="mx-auto mb-1 size-7" />
          <span className="block text-[11px]">1. Success Scan</span>
        </button>
        <button
          type="button"
          onClick={() => updateState("duplicate")}
          className="rounded-xl bg-amber-100 p-3 text-center font-semibold text-amber-900 transition-opacity hover:opacity-85"
        >
          <CircleAlert className="mx-auto mb-1 size-7" />
          <span className="block text-[11px]">2. Amber Duplicate</span>
        </button>
        <button
          type="button"
          onClick={() => updateState("error")}
          className="rounded-xl bg-[#ffdad6] p-3 text-center font-semibold text-[#93000a] transition-opacity hover:opacity-85"
        >
          <XCircle className="mx-auto mb-1 size-7" />
          <span className="block text-[11px]">3. Red Scan Error</span>
        </button>
      </div>
      <div className={cn("flex min-h-28 flex-col items-center justify-center rounded-xl p-4 text-center", current.classes)}>
        <CurrentIcon className={cn("size-9", current.iconClasses)} />
        <div className="mt-1 text-xl leading-7 font-bold">{current.title}</div>
        <div className="text-xs leading-4 font-medium">{current.detail}</div>
      </div>
    </div>
  );
}

function PassPanel({ onToast }) {
  return (
    <div className="flex flex-col items-center space-y-4 text-center">
      <div className="flex w-60 flex-col items-center rounded-2xl bg-[#f2f3ff] p-4 shadow-sm">
        <span className="text-[11px] leading-4 font-bold tracking-[0.08em] text-[#3525cd] uppercase">
          Nexus Mobile Pass
        </span>
        <div className="my-3 flex size-36 items-center justify-center rounded-xl bg-white p-2 shadow-inner">
          <QrCode className="size-28 stroke-[1.5] text-[#131b2e]" />
        </div>
        <div className="text-sm font-bold text-[#131b2e]">Elena Rostova</div>
        <div className="text-xs text-[#464555]">NX-88219 • Corp Services</div>
        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#6cf8bb] px-2 py-0.5 text-[11px] font-semibold text-[#00714d]">
          <span className="size-1.5 animate-pulse rounded-full bg-[#006c49]" /> Pass Validated
        </span>
      </div>
      <Button
        type="button"
        onClick={() => onToast("Pass Delivered", "SMS and email pass sent to Elena Rostova.")}
      >
        Simulate Resend Pass to Wallet
      </Button>
    </div>
  );
}

function VotingPanel({ onToast }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 rounded-xl bg-[#f2f3ff] p-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#3525cd]">#1</span>
          <div>
            <div className="text-xs font-bold text-[#131b2e]">Sophia Lauren (Global Ops)</div>
            <span className="text-xs text-[#464555]">Innovation Champion</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-[#006c49]">642 votes</span>
          <span className="block text-[11px] text-[#464555]">42.8%</span>
        </div>
      </div>
      <Button
        type="button"
        variant="amber"
        className="w-full"
        onClick={() => onToast("Voting Lock Engaged", "Stage balloting locked. Finalizing results!")}
      >
        Close Voting & Lock Results
      </Button>
    </div>
  );
}

function RafflePanel({ onToast }) {
  const [winner, setWinner] = useState("Ready for Random Roll");

  return (
    <div className="flex flex-col items-center space-y-4 text-center">
      <div className="w-full rounded-2xl bg-[#f2f3ff] p-6">
        <span className="text-[11px] font-semibold text-[#684000] uppercase">
          Grand Prize: Leadership Summit Trip
        </span>
        <div className={cn("my-4 text-2xl leading-8 font-bold", winner.includes("Li Wei") ? "text-[#006c49]" : "text-[#131b2e]")}> 
          {winner}
        </div>
        <Button
          type="button"
          variant="success"
          onClick={() => {
            setWinner("🎉 Li Wei (NX-91283)");
            onToast("Raffle Winner Selected!", "Li Wei selected from verified guests.");
          }}
        >
          Draw Verified Winner
        </Button>
      </div>
    </div>
  );
}

function SettingsPanel({ onToast }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-[#f2f3ff] p-3">
        <label htmlFor="settings-name" className={fieldLabel}>
          Event Name & Primary Slug
        </label>
        <Input id="settings-name" className="bg-white" defaultValue="Annual Corporate Gala 2026" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-[#f2f3ff] p-3">
          <label htmlFor="settings-limit" className={fieldLabel}>
            Invited Quorum Limit
          </label>
          <Input id="settings-limit" className="bg-white" type="number" defaultValue="2500" />
        </div>
        <div className="rounded-xl bg-[#f2f3ff] p-3">
          <label htmlFor="settings-raffle" className={fieldLabel}>
            Raffle Ingestion Mode
          </label>
          <select id="settings-raffle" className={cn(selectClass, "bg-white")}>
            <option>Attended Guests Only (1,864)</option>
            <option>All Registered (2,287)</option>
          </select>
        </div>
      </div>
      <div className="flex flex-col justify-between gap-3 rounded-xl bg-[#6cf8bb]/30 p-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#131b2e]">
          <BadgeCheck className="size-5 text-[#006c49]" />
          Sync to 12 Gate Mobile Scanners
        </div>
        <Button
          type="button"
          variant="success"
          size="sm"
          onClick={() => onToast("Configuration Pushed", "Broadcast sent to all 12 floor gate handhelds.")}
        >
          Push Live Update
        </Button>
      </div>
    </div>
  );
}

const dialogDetails = {
  scanner: {
    icon: ScanQrCode,
    title: "Staff POC QR Scanner (Tri-State)",
    description: "Green success, amber already checked-in, and red error states",
    status: "Gate Scanner Device #04 (Connected)",
  },
  pass: {
    icon: QrCode,
    title: "Mobile Attendee Reg & Pass Simulator",
    description: "Attendee self-registration preview with dynamic QR payload",
    status: "Cryptographic Signature: SHA-256 Valid",
  },
  voting: {
    icon: Vote,
    title: "Star of the Night Voting Portal",
    description: "Real-time audience voting tally and star leaderboard",
    status: "Total Ballots Cast: 1,498 / 1,864 present",
  },
  raffle: {
    icon: PartyPopper,
    title: "Live Stage Raffle Draw Simulator",
    description: "Random draw filtered strictly to checked-in attendees",
    status: "Eligible Attended Pool: 1,864 unique badges",
  },
  settings: {
    icon: Settings2,
    title: "Client Admin & Event Setup",
    description: "Configuration engine for Annual Gala 2026",
    status: "Active Schema: gala_2026_enterprise_v2",
  },
};

export function OperationDialog({ type, onOpenChange, onToast }) {
  const details = type ? dialogDetails[type] : null;

  if (!details) return null;
  const Icon = details.icon;

  return (
    <Dialog open={Boolean(type)} onOpenChange={(open) => !open && onOpenChange(null)}>
      <DialogContent className="max-w-2xl p-0">
        <div className="bg-[#f2f3ff] p-6 pr-14">
          <DialogHeading icon={Icon} title={details.title} description={details.description} />
        </div>
        <div className="p-6 sm:p-8">
          {type === "scanner" && <ScannerPanel onToast={onToast} />}
          {type === "pass" && <PassPanel onToast={onToast} />}
          {type === "voting" && <VotingPanel onToast={onToast} />}
          {type === "raffle" && <RafflePanel onToast={onToast} />}
          {type === "settings" && <SettingsPanel onToast={onToast} />}
        </div>
        <div className="flex flex-col justify-between gap-3 bg-[#f2f3ff] p-4 sm:flex-row sm:items-center">
          <span className="text-[11px] leading-4 text-[#464555]">{details.status}</span>
          <DialogClose asChild>
            <Button type="button" size="sm">
              Dismiss Simulator
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
