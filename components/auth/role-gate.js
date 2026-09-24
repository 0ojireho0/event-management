"use client";

import { LoaderCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/functions/auth";
import { canAccessRoute, getRoleHome } from "@/lib/role-routing.mjs";

export function RoleGate({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const hasAccess = Boolean(user && canAccessRoute(user.role, pathname));

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/");
    } else if (!hasAccess) {
      router.replace(getRoleHome(user.role) || "/");
    }
  }, [hasAccess, isLoading, router, user]);

  if (isLoading || !hasAccess) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffaf7] text-[#f6671e]">
        <LoaderCircle className="size-8 animate-spin" aria-label="Checking authentication" />
      </main>
    );
  }

  return children({ user, logout });
}
