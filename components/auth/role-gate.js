"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/functions/auth";
import { getRoleHome } from "@/lib/role-routing.mjs";

export function RoleGate({ allowedRole, children }) {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/");
    } else if (user.role !== allowedRole) {
      router.replace(getRoleHome(user.role) || "/");
    }
  }, [allowedRole, isLoading, router, user]);

  if (isLoading || !user || user.role !== allowedRole) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffaf7] text-[#f6671e]">
        <LoaderCircle className="size-8 animate-spin" aria-label="Checking authentication" />
      </main>
    );
  }

  return children({ user, logout });
}
