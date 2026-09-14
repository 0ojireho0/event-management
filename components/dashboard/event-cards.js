import {
  Award,
  BadgeCheck,
  ChevronRight,
  Download,
  Mail,
  MapPin,
  QrCode,
  ScanQrCode,
  Vote,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const liveEvents = [
  {
    id: "EVT-GALA-2026-HQ",
    title: "Annual Corporate Gala 2026",
    category: "Corporate Gala",
    location: "Grand Pavilion Hall A & B • 5:00 PM – 11:30 PM (Peak Surge Now)",
    progressLabel: "Live Attendance Throughput",
    checkedIn: "1,864 / 2,287 Checked In (81.5%)",
    progress: 81.5,
    gateDetail: "Gate 01: 940 • Gate 02: 924",
    pending: "423",
    pendingLabel: "guests",
    controlTitle: "Direct Stage Operations",
    controlDescription: "Instant launch field & stage overlays",
    actions: [
      { label: "Open Scanner", icon: ScanQrCode, action: "scanner", variant: "default" },
      { label: "Stage Raffle", icon: Award, action: "raffle", variant: "amber" },
      { label: "Voting Control", icon: Vote, action: "voting", variant: "secondary" },
      { label: "Pass QR", icon: QrCode, action: "pass", variant: "secondary" },
    ],
    footerAction: "Event Settings & Rules",
    footerType: "settings",
  },
  {
    id: "EVT-EXEC-2026-VIP",
    title: "Executive Leadership Reception",
    category: "VIP Networking",
    location: "Skyline Lounge, 48th Floor • 6:30 PM – 10:00 PM",
    progressLabel: "VIP Check-In Progress",
    checkedIn: "148 / 180 Checked In (82.2%)",
    progress: 82.2,
    gateDetail: "VIP Fast Gate: Handheld 04",
    pending: "32",
    pendingLabel: "VIPs",
    controlTitle: "VIP Controls",
    controlDescription: "Concierge & Badge verification",
    actions: [
      { label: "VIP Scanner", icon: ScanQrCode, action: "scanner", variant: "default" },
      { label: "VIP Badges", icon: BadgeCheck, action: "pass", variant: "secondary" },
    ],
    footerAction: "Download Roster CSV",
    footerType: "download",
  },
];

export const upcomingEvents = [
  {
    id: "EVT-TECH-2026",
    title: "Global Tech & AI Summit 2026",
    date: "Tomorrow • 09:00 AM",
    location: "Auditorium C & Virtual Livestream",
    registration: "480 / 500 Capacity (96%)",
    progress: 96,
    featured: true,
    category: "tech",
    toast: "Batch reminder sent to 480 confirmed guests.",
  },
  {
    id: "EVT-FIN-2026",
    title: "Annual Investors & Stakeholders Day",
    date: "In 5 Days • Oct 28",
    location: "Conference Center Ballroom",
    registration: "315 / 400 Capacity (78%)",
    progress: 78,
    category: "corporate",
    toast: "Batch reminder sent to 315 confirmed guests.",
  },
  {
    id: "EVT-AWD-2026",
    title: "Q4 Corporate Excellence Awards",
    date: "In 12 Days • Nov 4",
    location: "Grand Westin Banquet Suite",
    registration: "220 / 300 Capacity (73%)",
    progress: 73,
    category: "social",
    toast: "Invite reminders set for Nov 1.",
  },
  {
    id: "EVT-HCK-2026",
    title: "Nexus Internal Hackathon & Expo",
    date: "In 24 Days • Nov 16",
    location: "Innovation Labs & Atrium",
    registration: "195 / 250 Capacity (78%)",
    progress: 78,
    category: "tech",
    toast: "Invite reminders set for Nov 10.",
  },
];

function ProgressBar({ value, live = false }) {
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-[#e2e7ff]"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
    >
      <div
        className={`h-full rounded-full transition-all duration-700 ${live ? "bg-[#006c49]" : "bg-[#3525cd]"}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export function LiveEventCard({ event, onAction, onToast }) {
  return (
    <Card className="flex flex-col gap-6 p-4 sm:p-6 xl:flex-row xl:justify-between">
      <div className="max-w-2xl flex-1 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="success">
            <span className="size-2 animate-pulse rounded-full bg-[#006c49]" />
            Live Gate Active
          </Badge>
          <Badge variant="neutral" className="text-[#131b2e]">
            {event.category}
          </Badge>
          <span className="font-mono text-[11px] leading-4 text-[#777587]">ID: {event.id}</span>
        </div>

        <div>
          <h3 className="text-xl leading-7 font-bold text-[#131b2e] sm:text-2xl sm:leading-8">
            {event.title}
          </h3>
          <p className="mt-1 flex items-start gap-2 text-sm leading-5 text-[#464555]">
            <MapPin className="mt-0.5 size-4.5 shrink-0 text-[#777587]" />
            <span>{event.location}</span>
          </p>
        </div>

        <div className="space-y-1.5 rounded-xl bg-[#f2f3ff] p-3">
          <div className="flex flex-col justify-between gap-1 text-xs leading-4 sm:flex-row sm:items-center">
            <span className="text-[#464555]">{event.progressLabel}</span>
            <span className="font-bold text-[#006c49] sm:text-sm">{event.checkedIn}</span>
          </div>
          <ProgressBar value={event.progress} live />
          <div className="flex flex-col justify-between gap-1 pt-0.5 text-xs leading-4 text-[#464555] sm:flex-row">
            <span>{event.gateDetail}</span>
            <span>
              Pending Arrival: <strong className="text-amber-700">{event.pending}</strong>{" "}
              {event.pendingLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="flex self-stretch flex-col items-start justify-between gap-3 border-t border-[#e2e7ff] pt-4 xl:min-w-80 xl:items-end xl:border-t-0 xl:border-l xl:pt-0 xl:pl-6">
        <div className="w-full text-left xl:text-right">
          <span className="text-[11px] leading-3.5 font-semibold text-[#777587] uppercase">
            {event.controlTitle}
          </span>
          <p className="text-xs leading-4 text-[#464555]">{event.controlDescription}</p>
        </div>

        <div className="grid w-full grid-cols-1 gap-2 min-[420px]:grid-cols-2">
          {event.actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                type="button"
                size="sm"
                variant={action.variant}
                className="h-10 px-3.5 text-xs"
                onClick={() => onAction(action.action)}
              >
                <Icon className="size-4.5" />
                {action.label}
              </Button>
            );
          })}
        </div>

        <Button
          type="button"
          variant="link"
          size="sm"
          className="self-end text-xs"
          onClick={() => {
            if (event.footerType === "download") {
              onToast("Report Exported", "VIP attendance list downloaded.");
            } else {
              onAction(event.footerType);
            }
          }}
        >
          {event.footerAction}
          {event.footerType === "download" ? (
            <Download className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
        </Button>
      </div>
    </Card>
  );
}

export function UpcomingEventCard({ event, onAction, onToast }) {
  return (
    <Card className="flex min-h-60 flex-col justify-between space-y-4 p-4 sm:p-6">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant={event.featured ? "default" : "neutral"}>{event.date}</Badge>
          <span className="text-[11px] leading-4 text-[#777587]">{event.id}</span>
        </div>
        <h3 className="text-lg leading-6 font-bold text-[#131b2e] sm:text-xl sm:leading-7">
          {event.title}
        </h3>
        <p className="flex items-center gap-1 text-xs leading-4 text-[#464555]">
          <MapPin className="size-4 shrink-0" />
          <span>{event.location}</span>
        </p>
        <div className="space-y-1 pt-2">
          <div className="flex flex-col justify-between gap-1 text-[11px] leading-4 min-[420px]:flex-row">
            <span className="text-[#464555]">Registered Attendees</span>
            <span className="font-semibold text-[#131b2e]">{event.registration}</span>
          </div>
          <ProgressBar value={event.progress} />
        </div>
      </div>

      <div className="flex flex-col justify-between gap-2 border-t border-[#e2e7ff]/60 pt-3 min-[420px]:flex-row min-[420px]:items-center">
        <div className="flex flex-wrap items-center gap-1.5">
          <Button type="button" variant="secondary" size="sm" onClick={() => onAction("pass")}>
            <QrCode className="size-4 text-[#3525cd]" />
            Reg QR
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onToast("Email Invites Dispatched", event.toast)}
          >
            <Mail className="size-4" />
            Send Passes
          </Button>
        </div>
        <Button type="button" size="sm" onClick={() => onAction("settings")}>
          Edit Event
        </Button>
      </div>
    </Card>
  );
}
