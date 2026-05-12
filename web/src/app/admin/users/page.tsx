import { createClient } from "@/lib/supabase/server";
import { updateUserRole } from "@/app/actions/admin-users";
import type { UserRole } from "@/lib/profile";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, role")
    .order("display_name", { ascending: true });

  const rows = (profiles ?? []) as { id: string; display_name: string; role: UserRole }[];

  return (
    <div>
      <h1 className="display mb-8 text-2xl font-extrabold">Users & roles</h1>
      <p className="mb-6 text-sm" style={{ color: "var(--muted2)" }}>
        Assign <strong>Student</strong>, <strong>Teacher</strong>, or <strong>Admin</strong>. New
        sign-ups default to Student until you change their role here.
      </p>

      <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: "var(--border)" }}>
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead style={{ background: "var(--surface)" }}>
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">User ID</th>
              <th className="px-4 py-3 font-semibold">Role</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-6" style={{ color: "var(--muted2)" }}>
                  No profiles found.
                </td>
              </tr>
            ) : (
              rows.map((p) => (
                <tr key={p.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                  <td className="px-4 py-3 font-medium">{p.display_name || "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--muted)" }}>
                    {p.id}
                  </td>
                  <td className="px-4 py-3">
                    <form action={updateUserRole} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="user_id" value={p.id} />
                      <select
                        name="role"
                        defaultValue={p.role}
                        className="rounded-lg border px-3 py-2 text-sm"
                        style={{
                          background: "var(--surface)",
                          borderColor: "var(--border)",
                          color: "var(--text)",
                        }}
                      >
                        <option value="student">Student</option>
                        <option value="instructor">Teacher</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button type="submit" className="btn-primary rounded-lg px-3 py-2 text-xs">
                        Save
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
