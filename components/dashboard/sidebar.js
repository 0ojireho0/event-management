import {
  BadgeCheck,
  BarChart3,
  CalendarDays,
  ChevronsUpDown,
  ClipboardPenLine,
  Database,
  IdCard,
  LayoutDashboard,
  Network,
  PanelLeftClose,
  PartyPopper,
  ScanQrCode,
  Settings,
  Star,
  Users,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Events", icon: CalendarDays, active: true, badge: "2 Live" },
  { label: "Registrations & Builder", icon: ClipboardPenLine },
  { label: "Attendees", icon: Users, badge: "2,287" },
  { label: "Check-In & Scanner", icon: ScanQrCode, live: true },
  { label: "Registration QR", icon: BadgeCheck },
  { label: "Raffle Engine", icon: PartyPopper },
  { label: "Star Voting System", icon: Star },
  { label: "Reports & Analytics", icon: BarChart3 },
  { label: "Employee Database", icon: IdCard },
  { label: "Settings", icon: Settings },
];

function SidebarContent({ onClose, mobile = false }) {
  return (
    <>
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-[#3525cd] text-white shadow-sm">
            <Network className="size-5" />
          </div>
          <div>
            <div className="text-xl leading-7 font-bold tracking-tight text-[#faf8ff]">
              NexusEvent
            </div>
            <div className="text-[11px] leading-3.5 font-semibold tracking-[0.16em] text-[#c7c4d8] uppercase">
              360 Platform
            </div>
          </div>
        </div>
        {mobile ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-[#c7c4d8] hover:bg-white/10 hover:text-white"
            aria-label="Close navigation"
          >
            <X className="size-5" />
          </Button>
        ) : (
          <PanelLeftClose className="size-5 text-[#c7c4d8]" aria-hidden="true" />
        )}
      </div>

      <div className="px-4 pb-4">
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-xl bg-[#283044]/80 p-2 text-left transition-colors hover:bg-white/5"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="size-2.5 shrink-0 animate-pulse rounded-full bg-[#4edea3]" />
            <span className="min-w-0">
              <span className="block truncate text-xs leading-4 font-medium text-[#faf8ff]">
                Annual Gala 2026
              </span>
              <span className="block text-[11px] leading-3.5 font-semibold text-[#c7c4d8] uppercase">
                Active Session
              </span>
            </span>
          </span>
          <ChevronsUpDown className="size-4.5 shrink-0 text-[#c7c4d8]" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-1">
        <p className="mb-1 px-4 text-[11px] leading-3.5 font-semibold tracking-[0.08em] text-[#c7c4d8] uppercase">
          Operations Engine
        </p>
        <nav className="space-y-1" aria-label="Main navigation">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href={item.active ? "#events" : `#${item.label.toLowerCase().replaceAll(" ", "-")}`}
                aria-current={item.active ? "page" : undefined}
                onClick={mobile ? onClose : undefined}
                className={cn(
                  "group flex min-h-10 items-center justify-between rounded-xl px-4 py-2.5 text-sm leading-5 transition-all",
                  item.active
                    ? "bg-[#4f46e5] font-semibold text-white shadow-sm"
                    : "text-[#c7c4d8] hover:bg-white/10 hover:text-white",
                )}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Icon className="size-5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </span>
                {item.badge && (
                  <Badge
                    variant={item.active ? "dark" : "neutral"}
                    className={cn(
                      "ml-2",
                      !item.active && "bg-white/10 text-[#faf8ff]",
                    )}
                  >
                    {item.badge}
                  </Badge>
                )}
                {item.live && <span className="size-2 shrink-0 rounded-full bg-[#6ffbbe]" />}
              </a>
            );
          })}
        </nav>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between rounded-xl bg-white/10 p-4">
          <span className="flex items-center gap-2 text-[11px] leading-3.5 text-[#c7c4d8]">
            <span className="size-2 rounded-full bg-[#6ffbbe]" />
            Engine v4.8 Active
          </span>
          <Database className="size-4.5 text-[#c7c4d8]" />
        </div>
      </div>
    </>
  );
}

export function Sidebar({ mobileOpen, onClose }) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 flex-col bg-[#283044] text-[#eef0ff] shadow-[0_1px_8px_rgba(0,0,0,0.06)] xl:flex">
        <SidebarContent />
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-50 xl:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          className={cn(
            "absolute inset-0 bg-[#131b2e]/45 backdrop-blur-[2px] transition-opacity",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={onClose}
          aria-label="Close navigation"
          tabIndex={mobileOpen ? 0 : -1}
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 flex w-[min(18rem,88vw)] flex-col bg-[#283044] text-[#eef0ff] shadow-2xl transition-transform duration-300",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <SidebarContent mobile onClose={onClose} />
        </aside>
      </div>
    </>
  );
}
