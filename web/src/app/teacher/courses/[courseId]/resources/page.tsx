import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createResource, deleteResource } from "@/app/actions/teacher";

export default async function ResourcesPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const supabase = await createClient();

  const { data: course, error } = await supabase
    .from("courses")
    .select("id, title")
    .eq("id", courseId)
    .single();
  if (error || !course) notFound();

  const { data: resources } = await supabase
    .from("resources")
    .select("id, title, resource_type, storage_path, external_url, created_at")
    .eq("course_id", courseId)
    .order("created_at", { ascending: false });

  const typeBadge: Record<string, string> = {
    pdf: "badge-orange",
    video: "badge-cyan",
    link: "badge-green",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Resources</h1>
      <p className="mt-1 text-sm" style={{ color: "var(--muted2)" }}>
        {course.title as string}
      </p>

      {/* Create form */}
      <form
        action={createResource}
        className="mt-6 border-b pb-6"
        style={{ borderColor: "var(--border)" }}
      >
        <input type="hidden" name="course_id" value={courseId} />
        <h2
          className="mb-3 text-[0.65rem] font-semibold uppercase tracking-widest"
          style={{ color: "var(--muted)" }}
        >
          Add resource
        </h2>
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <input
              name="title"
              required
              placeholder="Resource title"
              className="flex-1 rounded-md border px-3 py-2 text-sm"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
            />
            <select
              name="resource_type"
              className="rounded-md border px-3 py-2 text-sm"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
            >
              <option value="pdf">PDF</option>
              <option value="video">Video</option>
              <option value="link">Link</option>
            </select>
          </div>
          <input
            name="storage_path"
            placeholder="Storage path (e.g. course-id/file.pdf)"
            className="rounded-md border px-3 py-2 text-sm"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          />
          <input
            name="external_url"
            placeholder="Or external URL"
            className="rounded-md border px-3 py-2 text-sm"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          />
          <input
            name="meta"
            placeholder="Meta info (optional, e.g. file size)"
            className="rounded-md border px-3 py-2 text-sm"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          />
          <button
            type="submit"
            className="btn-primary w-fit rounded-md px-4 py-2 text-sm font-medium"
          >
            Add resource
          </button>
        </div>
      </form>

      {/* Resources list */}
      <div className="mt-6 space-y-3">
        {(resources ?? []).length === 0 ? (
          <p
            className="py-10 text-center text-sm"
            style={{ color: "var(--muted2)" }}
          >
            No resources yet.
          </p>
        ) : (
          (resources ?? []).map((r) => {
            const rType = r.resource_type as string;
            return (
              <div
                key={r.id as string}
                className="flex items-center justify-between border-b py-3"
                style={{ borderColor: "var(--border)" }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{r.title as string}</span>
                    <span className={`badge ${typeBadge[rType] ?? ""}`}>
                      {rType.toUpperCase()}
                    </span>
                  </div>
                  <div
                    className="mt-0.5 text-xs"
                    style={{ color: "var(--muted)" }}
                  >
                    {r.external_url && (
                      <a
                        href={r.external_url as string}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline"
                        style={{ color: "var(--accent)" }}
                      >
                        {r.external_url as string}
                      </a>
                    )}
                    {r.storage_path && !r.external_url && (
                      <span>{r.storage_path as string}</span>
                    )}
                    {r.created_at && (
                      <span className="ml-2">
                        {new Date(r.created_at as string).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <form action={deleteResource}>
                  <input
                    type="hidden"
                    name="resource_id"
                    value={r.id as string}
                  />
                  <input type="hidden" name="course_id" value={courseId} />
                  <button
                    type="submit"
                    className="text-xs text-[var(--orange)] hover:underline"
                  >
                    Delete
                  </button>
                </form>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
