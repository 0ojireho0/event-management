"use client";

import { useRef, useState } from "react";
import { LoaderCircle, Plus, UsersRound } from "lucide-react";

import { RoleGate } from "@/components/auth/role-gate";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopHeader } from "@/components/dashboard/top-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DeleteUserDialog } from "@/components/users/delete-user-dialog";
import { UserFormDialog } from "@/components/users/user-form-dialog";
import { UsersTable } from "@/components/users/users-table";
import { getApiErrorMessage } from "@/functions/auth";
import { useUsers } from "@/functions/users";
import { restoreDialogFocus } from "@/lib/dialog-focus.mjs";

function ManageUsersShell({ user, logout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const addButtonRef = useRef(null);
  const formOpenerRef = useRef(null);
  const deleteOpenerRef = useRef(null);
  const { users, error, isLoading, createUser, updateUser, deleteUser } = useUsers();

  async function handleLogout() {
    setLogoutError("");
    try {
      await logout();
    } catch (error) {
      setLogoutError(getApiErrorMessage(error, "Could not log out. Please try again."));
    }
  }

  function handleFormOpenChange(nextOpen) {
    setFormOpen(nextOpen);
    if (!nextOpen) setSelectedUser(null);
  }

  function handleDeleteOpenChange(nextOpen) {
    setDeleteOpen(nextOpen);
    if (!nextOpen) setSelectedUser(null);
  }

  async function handleSave(payload) {
    if (selectedUser) {
      await updateUser(selectedUser.id, payload);
    } else {
      await createUser(payload);
    }
  }

  async function handleDelete(id) {
    await deleteUser(id);
  }

  return (
    <div className="min-h-screen bg-[#fffaf7] text-[#25170f]">
      <Sidebar role="Admin" activeItem="Manage Users" mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <TopHeader onMenuOpen={() => setSidebarOpen(true)} onLogout={handleLogout} user={user} />

      <div className="xl:pl-72">
        <main className="min-h-screen px-4 pt-[72px] pb-8 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
            <section className="flex flex-col justify-between gap-4 pt-0.5 sm:flex-row sm:items-center">
              <div className="space-y-1">
                <h1 className="text-[28px] leading-9 font-bold tracking-tight sm:text-4xl sm:leading-11">Manage Users</h1>
                <p className="text-sm text-[#6f625b]">Create and manage scanner accounts for event check-in.</p>
              </div>
              <Button ref={addButtonRef} type="button" size="lg" className="w-full sm:w-auto" onClick={(event) => { formOpenerRef.current = event.currentTarget; setSelectedUser(null); setFormOpen(true); }}>
                <Plus className="size-5" aria-hidden="true" />
                Add Scanner
              </Button>
            </section>

            {logoutError && <p role="alert" className="rounded-xl bg-[#fff0ed] px-4 py-3 text-sm text-[#a5261d]">{logoutError}</p>}

            <section aria-label="Scanner accounts" className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">Scanner Accounts</h2>
                  <p className="text-xs text-[#6f625b]">Only Admins can make changes here.</p>
                </div>
                {!isLoading && !error && <span className="rounded-full bg-[#ffdece] px-3 py-1 text-xs font-semibold text-[#f6671e]">{users.length} total</span>}
              </div>

              {isLoading ? (
                <Card className="flex min-h-40 items-center justify-center">
                  <LoaderCircle className="size-7 animate-spin text-[#f6671e]" aria-label="Loading scanner accounts" />
                </Card>
              ) : error ? (
                <Card role="alert" className="border-[#ffd2ca] bg-[#fff0ed] p-6 text-[#a5261d]">
                  <p className="font-semibold">Scanner accounts could not be loaded.</p>
                  <p className="mt-1 text-sm">{getApiErrorMessage(error, "Please check the connection and try again.")}</p>
                </Card>
              ) : users.length === 0 ? (
                <Card className="flex min-h-56 flex-col items-center justify-center gap-2 p-6 text-center">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-[#ffdece] text-[#f6671e]"><UsersRound aria-hidden="true" /></span>
                  <p className="font-semibold">No scanner accounts yet</p>
                  <p className="max-w-sm text-sm text-[#6f625b]">Add a Scanner to give someone access to event check-in.</p>
                </Card>
              ) : (
                <UsersTable users={users} onEdit={(account, button) => { formOpenerRef.current = button; setSelectedUser(account); setFormOpen(true); }} onDelete={(account, button) => { deleteOpenerRef.current = button; setSelectedUser(account); setDeleteOpen(true); }} />
              )}
            </section>
          </div>
        </main>
      </div>

      {formOpen && (
        <UserFormDialog open={formOpen} onOpenChange={handleFormOpenChange} onCloseAutoFocus={(event) => restoreDialogFocus(event, formOpenerRef.current, addButtonRef.current)} user={selectedUser} onSubmit={handleSave} />
      )}
      {deleteOpen && selectedUser && (
        <DeleteUserDialog user={selectedUser} open={deleteOpen} onOpenChange={handleDeleteOpenChange} onCloseAutoFocus={(event) => restoreDialogFocus(event, deleteOpenerRef.current, addButtonRef.current)} onConfirm={handleDelete} />
      )}
    </div>
  );
}

export default function ManageUsersPage() {
  return (
    <RoleGate allowedRole="Admin">
      {({ user, logout }) => <ManageUsersShell user={user} logout={logout} />}
    </RoleGate>
  );
}
