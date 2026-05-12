import { createClient } from "@/lib/supabase/server";
import { createCourse } from "@/app/actions/teacher";

export default async function TeacherHomePage() {
  const supabase = await createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, description, published")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="display mb-8 text-2xl font-extrabold">Courses</h1>

      <div className="card mb-10 rounded-2xl p-6">
        <h2 className="display mb-4 text-lg font-bold">New course</h2>
        <form action={createCourse} className="flex flex-col gap-3">
          <input
            name="title"
            required
            placeholder="Course title"
            className="rounded-lg border px-4 py-2 text-sm"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          />
          <textarea
            name="description"
            placeholder="Description"
            rows={3}
            className="rounded-lg border px-4 py-2 text-sm"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          />
          <button type="submit" className="btn-primary w-fit rounded-lg px-5 py-2 text-sm">
            Create course
          </button>
        </form>
      </div>

      <ul className="space-y-3">
        {(courses ?? []).length === 0 ? (
          <p className="text-sm" style={{ color: "var(--muted2)" }}>
            No courses yet. Create one above.
          </p>
        ) : (
          (courses ?? []).map((c) => (
            <li key={c.id}>
              <a
                href={`/teacher/courses/${c.id}`}
                className="card hover-accent-dim flex items-center justify-between rounded-xl px-5 py-4 transition"
              >
                <span className="font-semibold">{c.title}</span>
                <span className="text-xs" style={{ color: "var(--muted)" }}>
                  Manage →
                </span>
              </a>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
