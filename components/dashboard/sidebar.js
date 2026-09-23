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
  { label: "Check-In & Scanner", icon: ScanQrCode, live: true },
  { label: "Dashboard", icon: LayoutDashboard, active: true, badge: "2 Live" },
];

function SidebarContent({ onClose, mobile = false }) {
  return (
    <>
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          {/* <div className="flex size-9 items-center justify-center rounded-lg bg-[#f6671e] text-white shadow-sm">
            <Network className="size-5" />
          </div> */}
          <div>
            <div className="text-xl leading-7 font-bold tracking-tight text-[#25170f]">
              Hype Event Hub
            </div>
            {/* <div className="text-[11px] leading-3.5 font-semibold tracking-[0.16em] text-[#8a766b] uppercase">
              360 Platform
            </div> */}
          </div>
        </div>
        {mobile ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-[#96877f] hover:bg-[#fff4ee] hover:text-[#f6671e]"
            aria-label="Close navigation"
          >
            <X className="size-5" />
          </Button>
        ) : (
          <PanelLeftClose className="size-5 text-[#8a766b]" aria-hidden="true" />
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-1">
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
                    ? "border border-[#f6671e]/30 bg-[#ffdece] font-semibold text-[#f6671e] shadow-sm"
                    : "text-[#6f625b] hover:bg-[#fff4ee] hover:text-[#25170f]",
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
                      item.active
                        ? "bg-[#f6671e] text-white"
                        : "bg-[#fff4ee] text-[#6f625b]",
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

      {/* <div className="p-4">
        <div className="flex items-center justify-between rounded-xl bg-white/10 p-4">
          <span className="flex items-center gap-2 text-[11px] leading-3.5 text-[#8a766b]">
            <span className="size-2 rounded-full bg-[#6ffbbe]" />
            // Engine v4.8 Active
            Powered by Jeremiah & Greian
          </span>
          <Database className="size-4.5 text-[#8a766b]" />
        </div>
      </div> */}
    </>
  );
}

export function Sidebar({ mobileOpen, onClose }) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 flex-col border-r border-[#ffdece] bg-white text-[#25170f] shadow-[0_1px_8px_rgba(0,0,0,0.04)] xl:flex">
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
            "absolute inset-0 bg-[#25170f]/45 backdrop-blur-[2px] transition-opacity",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={onClose}
          aria-label="Close navigation"
          tabIndex={mobileOpen ? 0 : -1}
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 flex w-[min(18rem,88vw)] flex-col bg-white text-[#25170f] shadow-2xl transition-transform duration-300",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <SidebarContent mobile onClose={onClose} />
        </aside>
      </div>
    </>
  );
}
