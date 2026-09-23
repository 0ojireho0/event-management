"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck2,
  Clock3,
  LoaderCircle,
  PlusCircle,
  RadioTower,
  Search,
  UsersRound,
} from "lucide-react";
import Swal from "sweetalert2";

import LoginScreen from "@/components/auth/login-screen";
import { CreateEventDialog, OperationDialog } from "@/components/dashboard/event-dialogs";
import {
  LiveEventCard,
  UpcomingEventCard,
  liveEvents,
  upcomingEvents,
} from "@/components/dashboard/event-cards";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopHeader } from "@/components/dashboard/top-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  getApiErrorMessage,
  login,
  logout,
  useAuthenticatedUser,
} from "@/functions/auth";
import { filterEvents } from "@/functions/events";
import { cn } from "@/lib/utils";

const stats = [
  {
    label: "Total Events",
    value: "14",
    // detail: "Annual scheduled cycles",
    icon: CalendarCheck2,
    iconClass: "bg-[#e2dfff] text-[#3525cd]",
  },
  {
    label: "Ongoing / Live",
    value: "2",
    detail: "Check-in active now",
    icon: RadioTower,
    iconClass: "bg-[#6cf8bb] text-[#00714d]",
    accent: true,
  },
  {
    label: "Upcoming Events",
    value: "4",
    detail: "Registration open",
    icon: Clock3,
    iconClass: "bg-[#e2e7ff] text-[#3525cd]",
  },
];

function StatCard({ stat }) {
  const Icon = stat.icon;
  return (
    <Card className="flex min-h-32 items-center justify-between gap-3 p-4">
      <div className="space-y-1">
        <span className="text-[11px] leading-3.5 font-semibold tracking-[0.08em] text-[#464555] uppercase">
          {stat.label}
        </span>
        <div
          className={cn(
            "text-[32px] leading-[38px] font-bold",
            stat.accent ? "text-[#006c49]" : "text-[#131b2e]",
          )}
        >
          {stat.value}
        </div>
        <span
          className={cn(
            "text-xs leading-4",
            stat.detailAccent || stat.accent
              ? "font-medium text-[#006c49]"
              : "text-[#464555]",
          )}
        >
          {stat.detail}
        </span>
      </div>
      <div className={cn("flex size-12 shrink-0 items-center justify-center rounded-xl", stat.iconClass)}>
        <Icon className="size-6" />
      </div>
    </Card>
  );
}

function EventDashboard({ onLogout, user }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeRole, setActiveRole] = useState("Admin");
  const [activeTab, setActiveTab] = useState("ongoing");
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [operationType, setOperationType] = useState(null);
  const [toast, setToast] = useState(null);
  const [createdEvents, setCreatedEvents] = useState([]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const visibleLiveEvents = useMemo(
    () => filterEvents(liveEvents, category, searchQuery),
    [category, searchQuery],
  );
  const visibleUpcomingEvents = useMemo(
    () => filterEvents([...createdEvents, ...upcomingEvents], category, searchQuery),
    [category, createdEvents, searchQuery],
  );

  function showToast(title, description) {
    setToast({ title, description });
  }

  function handleEventCreated(event) {
    setCreatedEvents((current) => [event, ...current]);
    showToast(
      "Event Created Successfully",
      `${event.title} is published with a custom registration form.`,
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e]">
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <TopHeader
        activeRole={activeRole}
        onRoleChange={setActiveRole}
        onMenuOpen={() => setSidebarOpen(true)}
        onLogout={onLogout}
        user={user}
      />

      <div className="xl:pl-72">
        <main id="events" className="min-h-screen px-4 pt-[72px] pb-8 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
            <section className="flex flex-col justify-between gap-4 pt-0.5 md:flex-row md:items-center">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-[28px] leading-9 font-bold tracking-tight text-[#131b2e] sm:text-4xl sm:leading-11">
                    Dashboard
                  </h1>
                  <Badge variant="success">
                    <span className="size-2 animate-pulse rounded-full bg-[#006c49]" />2 Active Now
                  </Badge>
                </div>
                <p className="max-w-2xl text-sm leading-5 text-[#464555]">
                  Manage events, registrations, attendee passes, and event activities.
                </p>
              </div>
              <Button
                type="button"
                size="lg"
                className="w-full md:w-auto"
                onClick={() => setCreateOpen(true)}
              >
                <PlusCircle className="size-5" />
                Create Event
              </Button>
            </section>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Event portfolio summary">
              {stats.map((stat) => (
                <StatCard key={stat.label} stat={stat} />
              ))}
            </section>

            <section className="flex flex-col justify-between gap-4 rounded-2xl bg-white p-2 shadow-[0_1px_3px_rgba(40,48,68,0.08)] min-[1400px]:flex-row min-[1400px]:items-center">
              <div className="grid grid-cols-1 gap-1 rounded-xl bg-[#f2f3ff] p-1 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("ongoing")}
                  className={cn(
                    "flex min-h-9 items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs leading-4 transition-all",
                    activeTab === "ongoing"
                      ? "bg-white font-semibold text-[#3525cd] shadow-sm"
                      : "font-medium text-[#464555] hover:text-[#131b2e]",
                  )}
                >
                  <span className="size-2 animate-pulse rounded-full bg-[#006c49]" />
                  <span>Ongoing Events (2)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("upcoming")}
                  className={cn(
                    "flex min-h-9 items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs leading-4 transition-all",
                    activeTab === "upcoming"
                      ? "bg-white font-semibold text-[#3525cd] shadow-sm"
                      : "font-medium text-[#464555] hover:text-[#131b2e]",
                  )}
                >
                  <span>Upcoming Events ({upcomingEvents.length + createdEvents.length})</span>
                </button>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative w-full sm:min-w-60">
                  <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#464555]" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="h-9 pl-9 text-xs"
                    placeholder="Filter events by title or venue..."
                    aria-label="Filter events"
                  />
                </div>
              </div>
            </section>

            {activeTab === "ongoing" && (
              <section className="space-y-4" aria-labelledby="live-events-heading">
                {visibleLiveEvents.length > 0 ? (
                  visibleLiveEvents.map((event) => (
                    <LiveEventCard
                      key={event.id}
                      event={event}
                      onAction={setOperationType}
                      onToast={showToast}
                    />
                  ))
                ) : (
                  <EmptyState />
                )}
              </section>
            )}

            {activeTab === 'upcoming' && (
              <section className="space-y-4" aria-labelledby="upcoming-events-heading">
                <div className="flex items-end justify-between gap-4">
                  <h2 id="upcoming-events-heading" className="text-xl leading-7 font-semibold text-[#131b2e]">
                    Upcoming Scheduled Events
                  </h2>
                </div>
                {visibleUpcomingEvents.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {visibleUpcomingEvents.map((event) => (
                      <UpcomingEventCard
                        key={event.id}
                        event={event}
                        onAction={setOperationType}
                        onToast={showToast}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState />
                )}
              </section>
            )}
          </div>
        </main>
      </div>

      <CreateEventDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleEventCreated}
      />
      <OperationDialog type={operationType} onOpenChange={setOperationType} onToast={showToast} />

      <div
        role="status"
        aria-live="polite"
        className={cn(
          "pointer-events-none fixed right-4 bottom-4 z-[60] flex max-w-[calc(100%-2rem)] items-center gap-3 rounded-xl bg-[#283044] p-4 text-[#eef0ff] shadow-xl transition-all duration-300 sm:right-6 sm:bottom-6",
          toast ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0",
        )}
      >
        <CheckCircleToast />
        <div>
          <div className="text-xs leading-4 font-semibold text-white">{toast?.title || "Action Recorded"}</div>
          <div className="text-xs leading-4 text-[#c7c4d8]">
            {toast?.description || "Operation completed successfully."}
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckCircleToast() {
  return (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#6ffbbe] text-[#006c49]">
      <span className="text-sm leading-none font-bold">✓</span>
    </span>
  );
}

function EmptyState() {
  return (
    <Card className="flex min-h-36 flex-col items-center justify-center p-6 text-center">
      <Search className="mb-2 size-6 text-[#777587]" />
      <p className="text-sm font-semibold text-[#131b2e]">No matching events</p>
      <p className="text-xs text-[#464555]">Try a different title, venue, or category.</p>
    </Card>
  );
}

export default function Home() {
  const {
    data: user,
    error,
    isLoading,
    mutate,
  } = useAuthenticatedUser();

  async function handleLogin(credentials) {
    const authenticatedUser = await login(credentials);

    await mutate(authenticatedUser, { revalidate: false });
  }

  async function handleLogout() {
    try {
      await logout();
      await mutate(null, { revalidate: false });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Sign-out failed",
        text: getApiErrorMessage(error, "Please try again."),
        confirmButtonColor: "#4f46e5",
      });
    }
  }

  if (isLoading && !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf8ff] text-[#3525cd]">
        <LoaderCircle className="size-8 animate-spin" aria-label="Checking authentication" />
      </main>
    );
  }

  if (!user || error?.response?.status === 401) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return <EventDashboard onLogout={handleLogout} user={user} />;
}
