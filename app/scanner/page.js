"use client";

import { useState } from "react";
import Swal from "sweetalert2";

import { RoleGate } from "@/components/auth/role-gate";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopHeader } from "@/components/dashboard/top-header";
import { getApiErrorMessage } from "@/functions/auth";

function ScannerShell({ user, logout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Sign-out failed",
        text: getApiErrorMessage(error, "Please try again."),
        confirmButtonColor: "#dc4f0a",
      });
    }
  }

  return (
    <div className="min-h-screen bg-[#fffaf7] text-[#25170f]">
      <Sidebar
        role="Scanner"
        activeItem="Check In & Scanner"
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <TopHeader
        onMenuOpen={() => setSidebarOpen(true)}
        onLogout={handleLogout}
        user={user}
      />
      <div className="xl:pl-72">
        <main className="min-h-screen px-4 pt-[72px] pb-8 sm:px-6 lg:px-8">
          hello
        </main>
      </div>
    </div>
  );
}

export default function ScannerPage() {
  return (
    <RoleGate allowedRole="Scanner">
      {({ user, logout }) => <ScannerShell user={user} logout={logout} />}
    </RoleGate>
  );
}
