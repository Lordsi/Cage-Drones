import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ResourceCard } from "@/components/resource-viewer";

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

  const { data: views } = await supabase
    .from("resource_views")
    .select("resource_id, completed_at")
    .eq("user_id", user.id);

  const viewMap = new Map(
    (views ?? []).map((v) => [v.resource_id as string, v.completed_at as string | null]),
  );

  const cards: Array<{
    id: string;
    title: string;
    course: string;
    type: string;
    href: string;
    label: string;
    alreadyViewed: boolean;
  }> = [];

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
    cards.push({
      id: r.id,
      title: r.title,
      course: r.courses?.title ?? "Course",
      type: r.resource_type,
      href,
      label,
      alreadyViewed: viewMap.has(r.id),
    });
  }

  return (
    <div>
      <div className="mb-8">
        <div
          className="mb-1 text-[0.68rem] font-bold uppercase tracking-widest"
          style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
        >
          Learning materials
        </div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
          Resources
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--muted2)" }}>
            No resources published for your courses.
          </p>
        ) : (
          cards.map((r) => <ResourceCard key={r.id} {...r} />)
        )}
      </div>
    </div>
  );
}
