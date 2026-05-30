"use client";

import { useEffect, useState } from "react";
import { markResourceViewed } from "@/app/actions/resources";
import { FileText, Image as ImageIcon, Link as LinkIcon, Play, Presentation, BookOpen } from "lucide-react";

const TYPE_ICONS: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  pdf: FileText,
  document: FileText,
  slides: Presentation,
  ppt: Presentation,
  image: ImageIcon,
  video: Play,
  link: LinkIcon,
};

export function ResourceCard({
  id,
  title,
  course,
  type,
  href,
  label,
  alreadyViewed,
}: {
  id: string;
  title: string;
  course: string;
  type: string;
  href: string;
  label: string;
  alreadyViewed?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const Icon = TYPE_ICONS[type] ?? BookOpen;

  useEffect(() => {
    if (open && href && href !== "#") {
      const fd = new FormData();
      fd.set("resource_id", id);
      fd.set("completed", "false");
      markResourceViewed(fd).catch(() => {});
    }
  }, [open, href, id]);

  const inlinePreview =
    type === "pdf" || type === "slides" || type === "document" || type === "image";

  return (
    <div className="card rounded-lg p-5">
      <div className="flex gap-3">
        <div
          className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-lg border"
          style={{
            background: "color-mix(in srgb, var(--accent) 10%, transparent)",
            borderColor: "color-mix(in srgb, var(--accent) 20%, transparent)",
          }}
        >
          <Icon size={18} color="var(--accent)" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 text-sm font-semibold leading-snug" style={{ color: "var(--text)" }}>{title}</div>
          <div className="mb-2 text-xs" style={{ color: "var(--muted2)" }}>{course}</div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge badge-cyan">{type.toUpperCase()}</span>
            {alreadyViewed ? <span className="badge badge-green">Viewed</span> : null}
            {href === "#" ? (
              <span className="text-xs" style={{ color: "var(--muted)" }}>Unavailable</span>
            ) : (
              <>
                {inlinePreview && (
                  <button
                    type="button"
                    onClick={() => setOpen((o) => !o)}
                    className="text-xs underline"
                    style={{ color: "var(--accent)", background: "none", border: "none", padding: 0, cursor: "pointer" }}
                  >
                    {open ? "Hide preview" : "Preview"}
                  </button>
                )}
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs underline"
                  style={{ color: "var(--accent)" }}
                  onClick={() => {
                    const fd = new FormData();
                    fd.set("resource_id", id);
                    fd.set("completed", "true");
                    markResourceViewed(fd).catch(() => {});
                  }}
                >
                  {label}
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      {open && href !== "#" && (
        <div className="mt-4 overflow-hidden rounded border" style={{ borderColor: "var(--border)" }}>
          {type === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={href} alt={title} className="w-full" style={{ maxHeight: "70vh", objectFit: "contain" }} />
          ) : (
            <iframe
              src={href}
              title={title}
              className="block w-full"
              style={{ height: "70vh", border: "none", background: "#fff" }}
            />
          )}
        </div>
      )}
    </div>
  );
}
