"use client";

import dynamic from "next/dynamic";

const DroneViewer = dynamic(
  () =>
    import("@/components/drone-viewer").then((m) => ({
      default: m.DroneViewer,
    })),
  { ssr: false }
);

export function DroneScene() {
  return <DroneViewer />;
}
