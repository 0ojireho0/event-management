import {
  Bell,
  ChevronDown,
  CircleHelp,
  LogOut,
  Menu,
  Network,
  Settings,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


export function TopHeader({ onMenuOpen, onLogout, user }) {
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
        </div>

        <div className="flex shrink-0 items-center gap-2 md:gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="-m-1 flex items-center gap-2 rounded-xl p-1 text-left transition-colors outline-none hover:bg-[#f2f3ff] focus-visible:ring-2 focus-visible:ring-[#3525cd]/30 sm:pl-3"
                aria-label={`Open menu for ${user?.name || "user"}`}
              >
                <div className="hidden text-right md:block">
                  <div className="text-sm leading-4 font-semibold text-[#131b2e]">
                    {user?.name || "Event User"}
                  </div>
                  <div className="text-[11px] leading-3.5 capitalize text-[#464555]">
                    {user?.role || "User"}
                  </div>
                </div>
                <div className="flex size-8 items-center justify-center rounded-full bg-[#3525cd] text-white">
                  <UserRound className="size-4.5" />
                </div>
                <ChevronDown className="hidden size-3.5 text-[#777587] sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem>
                <Settings />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={onLogout}
                className="text-[#ba1a1a] focus:bg-[#fff0f0] focus:text-[#ba1a1a]"
              >
                <LogOut />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
