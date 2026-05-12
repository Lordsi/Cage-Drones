import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Download, Play } from "lucide-react";

export default async function PortalResourcesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("course_id")
    .eq("user_id", user.id);

  const courseIds = (enrollments ?? []).map((e) => e.course_id as string);

  const { data: resources } = courseIds.length
    ? await supabase
        .from("resources")
        .select("id, title, resource_type, storage_path, external_url, meta, courses ( title )")
        .in("course_id", courseIds)
        .order("title")
    : { data: [] as Record<string, unknown>[] };

  const links: {
    id: string;
    title: string;
    course: string;
    type: string;
    href: string;
    label: string;
  }[] = [];

  for (const raw of resources ?? []) {
    const r = raw as {
      id: string;
      title: string;
      resource_type: string;
      storage_path: string | null;
      external_url: string | null;
      meta: string | null;
      courses: { title: string } | null;
    };
    let href = "#";
    let label = "Open";
    if (r.storage_path) {
      const { data: signed, error } = await supabase.storage
        .from("course-resources")
        .createSignedUrl(r.storage_path, 3600);
      if (!error && signed?.signedUrl) {
        href = signed.signedUrl;
        label = "Download";
      }
    } else if (r.external_url) {
      href = r.external_url;
      label = r.resource_type === "video" ? "Watch" : "Open";
    }
    links.push({
      id: r.id,
      title: r.title,
      course: r.courses?.title ?? "Course",
      type: r.resource_type,
      href,
      label,
    });
  }

  return (
    <div>
      <div className="mb-8">
        <div
          className="font-display mb-1 text-[0.7rem] font-bold uppercase tracking-widest"
          style={{ color: "var(--muted)" }}
        >
          Learning materials
        </div>
        <h1 className="display text-3xl font-extrabold">Resources</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--muted2)" }}>
            No resources published for your courses.
          </p>
        ) : (
          links.map((r) => (
            <div key={r.id} className="card rounded-2xl p-5">
              <div className="flex gap-3">
                <div
                  className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl border"
                  style={{
                    background:
                      r.type === "pdf" ? "rgba(255,101,53,.1)" : "rgba(34,211,163,.1)",
                    borderColor:
                      r.type === "pdf" ? "rgba(255,101,53,.2)" : "rgba(34,211,163,.2)",
                  }}
                >
                  {r.type === "pdf" ? (
                    <Download size={18} color="var(--orange)" />
                  ) : (
                    <Play size={18} color="var(--green)" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 text-sm font-semibold leading-snug">{r.title}</div>
                  <div className="mb-2 text-xs" style={{ color: "var(--muted2)" }}>
                    {r.course}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={r.type === "pdf" ? "badge badge-orange" : "badge badge-green"}>
                      {r.type.toUpperCase()}
                    </span>
                    {r.href !== "#" ? (
                      <Link
                        href={r.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs underline"
                        style={{ color: "var(--cyan)" }}
                      >
                        {r.label}
                      </Link>
                    ) : (
                      <span className="text-xs" style={{ color: "var(--muted)" }}>
                        Unavailable
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
