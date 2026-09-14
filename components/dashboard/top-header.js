import { Bell, CircleHelp, Menu, Network, Search, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const roles = ["Admin", "Attendee", "Staff POC", "Voting", "Raffle"];

export function TopHeader({ activeRole, onRoleChange, onMenuOpen, onLogout }) {
  return (
    <header className="fixed top-0 right-0 left-0 z-40 h-16 border-b border-[#e2e7ff]/60 bg-[#faf8ff]/85 backdrop-blur-xl xl:left-72">
      <div className="flex h-16 w-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3 lg:gap-6">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onMenuOpen}
            className="shrink-0 xl:hidden"
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </Button>

          <div className="flex items-center gap-2 sm:hidden">
            <span className="flex size-8 items-center justify-center rounded-lg bg-[#3525cd] text-white">
              <Network className="size-4.5" />
            </span>
            <span className="font-bold tracking-tight text-[#131b2e]">NexusEvent</span>
          </div>

          <div className="relative hidden w-full max-w-md sm:block">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#464555]" />
            <Input
              className="h-9 pr-12 pl-10 text-xs"
              placeholder="Search attendees, badges, tickets, logs..."
              aria-label="Search attendees, badges, tickets, and logs"
            />
            <kbd className="absolute top-1/2 right-3 -translate-y-1/2 rounded bg-[#e2e7ff] px-1.5 py-0.5 text-[10px] font-semibold text-[#464555]">
              ⌘K
            </kbd>
          </div>

          <div className="hidden items-center gap-2 rounded-xl bg-[#f2f3ff] px-2 py-1.5 2xl:flex">
            <span className="flex items-center gap-1.5 rounded-lg bg-white px-2 py-0.5">
              <span className="size-2 rounded-full bg-[#006c49]" />
              <span className="text-[11px] leading-3.5 font-semibold text-[#006c49]">
                LIVE GATE
              </span>
            </span>
            <span className="text-[11px] leading-3.5 font-medium whitespace-nowrap text-[#131b2e]">
              1,864 / 2,287 (81.5%)
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 md:gap-4">
          <div className="hidden items-center rounded-xl bg-[#f2f3ff] p-1 min-[1450px]:flex">
            {roles.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => onRoleChange(role)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-[11px] leading-3.5 font-semibold transition-colors",
                  activeRole === role
                    ? "bg-[#3525cd] text-white shadow-sm"
                    : "text-[#464555] hover:text-[#131b2e]",
                )}
              >
                {role}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="relative"
              aria-label="Notifications"
            >
              <Bell className="size-5" />
              <span className="absolute top-2 right-2 size-2 rounded-full bg-[#ba1a1a] ring-2 ring-[#f2f3ff]" />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="hidden sm:inline-flex"
              aria-label="Help"
            >
              <CircleHelp className="size-5" />
            </Button>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="-m-1 flex items-center gap-2 rounded-xl p-1 text-left transition-colors hover:bg-[#f2f3ff] sm:pl-3"
            aria-label="Sign out Sarah Jenkins"
            title="Sign out"
          >
            <div className="hidden text-right md:block">
              <div className="text-sm leading-4 font-semibold text-[#131b2e]">Sarah Jenkins</div>
              <div className="text-[11px] leading-3.5 text-[#464555]">Event Director</div>
            </div>
            <div className="flex size-8 items-center justify-center rounded-full bg-[#3525cd] text-white">
              <UserRound className="size-4.5" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
