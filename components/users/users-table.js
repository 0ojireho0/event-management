import { Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function formatCreatedAt(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "numeric" }).format(date);
}

export function UsersTable({ users, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#ffdece] bg-white shadow-[0_3px_14px_rgba(40,48,68,0.06)]">
      <table className="min-w-[680px] w-full text-left text-sm">
        <thead className="border-b border-[#ffdece] bg-[#fff4ee] text-xs font-semibold text-[#6f625b]">
          <tr>
            <th scope="col" className="px-5 py-4">Name</th>
            <th scope="col" className="px-5 py-4">Email</th>
            <th scope="col" className="px-5 py-4">Role</th>
            <th scope="col" className="px-5 py-4">Created</th>
            <th scope="col" className="px-5 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#fff0e8]">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-[#fffaf7]">
              <td className="px-5 py-4 font-semibold text-[#25170f]">{user.name}</td>
              <td className="px-5 py-4 text-[#6f625b]">{user.email}</td>
              <td className="px-5 py-4"><Badge>Scanner</Badge></td>
              <td className="px-5 py-4 whitespace-nowrap text-[#6f625b]">{formatCreatedAt(user.created_at)}</td>
              <td className="px-5 py-4">
                <div className="flex justify-end gap-1">
                  <Button type="button" variant="ghost" size="icon" aria-label={`Edit ${user.name}`} title={`Edit ${user.name}`} onClick={() => onEdit(user)}>
                    <Pencil aria-hidden="true" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" aria-label={`Delete ${user.name}`} title={`Delete ${user.name}`} onClick={() => onDelete(user)} className="text-[#ba1a1a] hover:bg-[#fff0ed] hover:text-[#93000a]">
                    <Trash2 aria-hidden="true" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
