import { createClient } from "@/lib/supabase/server";
import {
  addAllowlistEntry,
  bulkAddAllowlistEntries,
  removeAllowlistEntry,
} from "@/app/actions/allowlist";

type Row = {
  email: string;
  note: string;
  created_at: string;
};

export default async function AdminAllowlistPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("student_allowlist")
    .select("email, note, created_at")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as Row[];

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Student allow-list</h1>
      <p className="mb-8 text-sm" style={{ color: "var(--muted2)" }}>
        Only emails on this list may register, and any signed-in student must remain on this list
        to access the portal. Teachers and admins are not affected once their role has been changed
        in <strong>Users & roles</strong>.
      </p>

      <div
        className="card mb-6 rounded-xl p-5"
        style={{ borderColor: "var(--border)" }}
      >
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
          Add a single email
        </h2>
        <form action={addAllowlistEntry} className="flex flex-wrap items-end gap-3">
          <div className="flex-1" style={{ minWidth: "220px" }}>
            <label className="mb-1 block text-xs" style={{ color: "var(--muted2)" }}>
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="student@example.com"
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
            />
          </div>
          <div className="flex-1" style={{ minWidth: "220px" }}>
            <label className="mb-1 block text-xs" style={{ color: "var(--muted2)" }}>
              Note (optional)
            </label>
            <input
              name="note"
              placeholder="e.g. RPL cohort 2026"
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
            />
          </div>
          <button type="submit" className="btn-primary rounded-lg px-4 py-2 text-sm">
            Add
          </button>
        </form>
      </div>

      <div
        className="card mb-8 rounded-xl p-5"
        style={{ borderColor: "var(--border)" }}
      >
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
          Bulk add
        </h2>
        <form action={bulkAddAllowlistEntries} className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs" style={{ color: "var(--muted2)" }}>
              Paste emails separated by commas, spaces, or new lines.
            </label>
            <textarea
              name="emails"
              required
              rows={5}
              placeholder={"alice@example.com\nbob@example.com\ncharlie@example.com"}
              className="w-full rounded-lg border px-3 py-2 font-mono text-sm"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
            />
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1" style={{ minWidth: "220px" }}>
              <label className="mb-1 block text-xs" style={{ color: "var(--muted2)" }}>
                Shared note for these entries (optional)
              </label>
              <input
                name="note"
                placeholder="e.g. UNICEF flood-mapping training"
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                  color: "var(--text)",
                }}
              />
            </div>
            <button type="submit" className="btn-primary rounded-lg px-4 py-2 text-sm">
              Add all
            </button>
          </div>
        </form>
      </div>

      <div
        className="overflow-x-auto rounded-xl border"
        style={{ borderColor: "var(--border)" }}
      >
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead style={{ background: "var(--surface)" }}>
            <tr>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Note</th>
              <th className="px-4 py-3 font-semibold">Added</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center" style={{ color: "var(--muted2)" }}>
                  No entries yet. Add the first student email above.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.email} className="border-t" style={{ borderColor: "var(--border)" }}>
                  <td className="px-4 py-3 font-mono text-xs">{r.email}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--muted2)" }}>
                    {r.note || "—"}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--muted)" }}>
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={removeAllowlistEntry}>
                      <input type="hidden" name="email" value={r.email} />
                      <button
                        type="submit"
                        className="rounded-md px-3 py-1.5 text-xs font-medium"
                        style={{ color: "var(--orange)" }}
                      >
                        Remove
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
